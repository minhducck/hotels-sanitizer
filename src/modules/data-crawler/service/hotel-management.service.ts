import { DatabaseFacingService } from '../../../framework/service/database-facing.service';
import { HotelModel } from '../model/hotel.model';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

const ID_FIELD = 'id';
const EVENT_PREFIX = 'hotel-service';

@Injectable()
export class HotelManagementService extends DatabaseFacingService<HotelModel> {
  protected readonly idFieldName = ID_FIELD;
  protected readonly eventPrefix = EVENT_PREFIX;

  constructor(
    @InjectRepository(HotelModel)
    private readonly hotelRepository: Repository<HotelModel>,
  ) {
    super(hotelRepository, ID_FIELD, EVENT_PREFIX);
  }
}
