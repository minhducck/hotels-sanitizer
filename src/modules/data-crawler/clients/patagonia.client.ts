import axios, { AxiosInstance, AxiosResponse } from 'axios';

import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { SourceClientInterface } from '../interface/source-client.interface';
import { addLogHandler } from '../../../framework/helper/addLogHandler';
import { HotelRemoteService } from '../service/hotel-remote-service';
import { DataSourceEnum } from '../dto/data-source.enum';
import { PatagoniaSource } from '../dto/source-data/patagonia.source';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PatagoniaClient
  implements SourceClientInterface<PatagoniaSource>, OnApplicationBootstrap
{
  private apiConnector: AxiosInstance;
  private logger = new Logger('PatagoniaClient');

  public static BASE_URL =
    'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia';

  constructor(
    @Inject(HotelRemoteService)
    private readonly hotelRemoteService: HotelRemoteService,
  ) {
    this.apiConnector = axios.create({
      timeout: 5000,
      timeoutErrorMessage: 'Patagonia API Request Timeout',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    addLogHandler(this.apiConnector, this.logger);
  }

  getClientSourceId(): string {
    return DataSourceEnum.patagonia;
  }

  onApplicationBootstrap() {
    this.hotelRemoteService.registerClient(this);
  }

  private _processAxiosResponse(response: AxiosResponse) {
    return response.data || [];
  }

  /**
   * This filter is mock to get corresponding _id
   * @param ids
   * @param hotels
   * @private
   */
  private _mockFilterById(ids: string[], hotels: PatagoniaSource[]) {
    return hotels.filter((hotel) => ids.length === 0 || ids.includes(hotel.id));
  }

  /**
   * This filter is mock to get corresponding _id
   * @param ids
   * @param hotels
   * @private
   */
  private _mockFilterByDestinationId(ids: number[], hotels: PatagoniaSource[]) {
    return hotels.filter(
      (hotel) => ids.length === 0 || ids.includes(hotel.destination),
    );
  }

  private _mockPagination(
    page: number = 1,
    pageSize: number = 10,
    hotels: PatagoniaSource[],
  ) {
    const startOffset = Math.max(0, page - 1) * pageSize;
    return hotels.slice(startOffset, startOffset + pageSize);
  }

  async getHotelsByQuery(
    hotelIds: string[],
    destinationIds: number[],
    page: number,
    pageSize: number,
  ) {
    return this.apiConnector
      .get<PatagoniaSource[]>(PatagoniaClient.BASE_URL, {
        params: { page, pageSize, destinationIds },
      })
      .then(this._processAxiosResponse)
      .then((hotels) => this._mockFilterByDestinationId(destinationIds, hotels))
      .then((hotels) => this._mockFilterById(hotelIds, hotels))
      .then((hotels) => this._mockPagination(page, pageSize, hotels))
      .then((hotels) =>
        hotels.map((hotel) => plainToInstance(PatagoniaSource, hotel)),
      );
  }
}
