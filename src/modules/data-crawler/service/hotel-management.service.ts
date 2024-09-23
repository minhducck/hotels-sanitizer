import { DatabaseFacingService } from '../../../framework/service/database-facing.service';
import { HotelModel } from '../model/hotel.model';
import { Inject, Injectable } from '@nestjs/common';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';

const ID_FIELD = 'id';
const EVENT_PREFIX = 'hotel-service';
const CACHE_ENABLE_CONFIG = 'CACHE_ENABLE';
const CACHE_ENABLE_DEFAULT_VAL = 0;
const CACHE_LIFETIME_CONFIG = 'CACHE_LIFETIME';
const CACHE_LIFETIME_DEFAULT_VAL = 3600;

@Injectable()
export class HotelManagementService extends DatabaseFacingService<HotelModel> {
  protected readonly idFieldName = ID_FIELD;
  protected readonly eventPrefix = EVENT_PREFIX;

  constructor(
    @InjectRepository(HotelModel)
    private readonly hotelRepository: Repository<HotelModel>,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject('MOMENT_TIMEZONE')
    private readonly moment: (time?: any) => moment.Moment,
  ) {
    super(hotelRepository, ID_FIELD, EVENT_PREFIX);
  }

  async getCacheListByIds(ids: string[]): Promise<[HotelModel[], number]> {
    if (
      ids.length === 0 ||
      this.configService.get<number>(
        CACHE_ENABLE_CONFIG,
        CACHE_ENABLE_DEFAULT_VAL,
      ) === 0
    ) {
      return [[], 0];
    }
    const cacheLifeTime = this.configService.get<number>(
      CACHE_LIFETIME_CONFIG,
      CACHE_LIFETIME_DEFAULT_VAL,
    );
    const minRetrievalTime = this.moment()
      .subtract(cacheLifeTime, 'seconds')
      .toDate();

    return this.getList({
      where: { id: In(ids), updatedAt: MoreThanOrEqual(minRetrievalTime) },
    });
  }
}
