import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject, NotFoundException } from '@nestjs/common';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { BaseModel } from '../entity/base.model';

export abstract class DatabaseFacingService<T extends BaseModel> {
  protected repo: Repository<T>;
  private static initiateConnectionCleaner?: NodeJS.Timeout = undefined;
  @InjectDataSource() protected readonly dataSource: DataSource;
  @Inject(EventEmitter2) protected readonly eventEmitter: EventEmitter2;

  constructor(
    repo: Repository<T>,
    protected readonly idFieldName = 'entityId',
    protected readonly eventPrefix = 'service',
  ) {
    this.repo = repo;
  }

  async getById(id: number): Promise<T> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-by-id`,
      { id },
      async () => {
        const items = await this.repo.findOne({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          where: {
            [this.idFieldName]: id,
          },
        });
        if (!items) {
          throw new NotFoundException(
            `Entity ${this.repo.metadata.name} not found`,
          );
        }
        return items;
      },
    );
  }

  async getList(criteria?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-list`,
      { criteria },
      () => this.repo.findAndCount(criteria),
    );
  }

  async getOne(
    criteria?: FindManyOptions<T>,
    throwErrorOnEmpty = true,
  ): Promise<T> {
    return this.wrapToEventContainer(
      `${this.eventPrefix}.get-one`,
      { criteria },
      async () => {
        const entity = await this.repo.findOne(criteria);
        if (!entity && throwErrorOnEmpty) {
          throw new NotFoundException(
            `Entity ${this.repo.metadata.name} not found`,
          );
        }
        return entity;
      },
    );
  }

  async save(entity: T): Promise<T> {
    return this.wrapToTransactionContainer(
      `${this.eventPrefix}.save`,
      async (queryRunner) =>
        queryRunner.manager.save<T>(entity, {
          reload: true,
          transaction: false,
        }),
      { entity },
    );
  }

  async update(id: number, entity: Partial<T>): Promise<T> {
    const entityFromDb = await this.getById(id);
    Object.assign(entityFromDb, entity);
    return this.save(entityFromDb);
  }

  async delete(entity: T) {
    return this.wrapToTransactionContainer(
      `${this.eventPrefix}.delete`,
      async (queryRunner) => queryRunner.manager.remove(entity),
      { entity },
    );
  }

  protected async wrapToTransactionContainer(
    event: string,
    actionFn: (queryRunner: QueryRunner) => Promise<any>,
    eventVariables?: object,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const result = await this.wrapToEventContainer(
        event,
        { queryRunner, ...eventVariables },
        async () => actionFn(queryRunner),
      );

      await this.wrapToEventContainer(
        `${event}.commit`,
        { queryRunner, ...eventVariables },
        async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
          return result;
        },
      );
      return result;
    } catch (e) {
      queryRunner.isTransactionActive &&
        (await queryRunner.rollbackTransaction());
      throw e;
    } finally {
      !queryRunner.isReleased && (await queryRunner.release());
    }
  }

  protected async wrapToEventContainer(
    eventIdPrefix: string,
    variables: object,
    actionFunction: () => Promise<any>,
  ) {
    await this.eventEmitter.emitAsync(`${eventIdPrefix}.before`, {
      ...variables,
    });

    const result = await actionFunction();

    // Subscribe for the event after
    await this.eventEmitter.emitAsync(`${eventIdPrefix}.after`, {
      ...variables,
      result,
    });
    return result;
  }

  async saveBulk(list: T[]) {
    return this.wrapToTransactionContainer(
      `${this.eventPrefix}.save-bulk`,
      async (queryRunner) => queryRunner.manager.save(list),
      { list },
    );
  }

  getRepository() {
    return this.repo;
  }
}
