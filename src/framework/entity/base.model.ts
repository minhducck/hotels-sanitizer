import {
  AfterLoad,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { cloneDeep } from 'lodash';
import { Exclude, instanceToPlain } from 'class-transformer';

export class BaseModel<T = any> extends BaseEntity {
  #originData: object;

  constructor(init?: Partial<T>) {
    super();
    Object.assign(this, init ?? {});
  }

  @CreateDateColumn({ name: 'createdAt' })
  @Exclude({ toPlainOnly: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  @Exclude({ toPlainOnly: true })
  updatedAt: Date;

  @AfterLoad()
  protected originalObjectData() {
    this.#originData = cloneDeep(this);
  }

  @Exclude({ toPlainOnly: true })
  getOriginData() {
    return this.#originData;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
