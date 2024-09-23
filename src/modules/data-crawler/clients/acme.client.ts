import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { AcmeSource } from '../dto/source-data/acme.source';
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
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AcmeClient
  implements SourceClientInterface<AcmeSource>, OnApplicationBootstrap
{
  private apiConnector: AxiosInstance;
  private logger = new Logger('AcmeClient');

  public static BASE_URL =
    'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme';

  constructor(
    @Inject(HotelRemoteService)
    private readonly hotelRemoteService: HotelRemoteService,
  ) {
    this.apiConnector = axios.create({
      timeout: 5000,
      timeoutErrorMessage: 'ACME API Request Timeout',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    addLogHandler(this.apiConnector, this.logger);
  }

  getClientSourceId(): string {
    return DataSourceEnum.ACME;
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
  private _mockFilterById(ids: string[], hotels: AcmeSource[]) {
    return hotels.filter((hotel) => ids.length === 0 || ids.includes(hotel.Id));
  }

  /**
   * This filter is mock to get corresponding _id
   * @param ids
   * @param hotels
   * @private
   */
  private _mockFilterByDestinationId(ids: number[], hotels: AcmeSource[]) {
    return hotels.filter(
      (hotel) => ids.length === 0 || ids.includes(hotel.DestinationId),
    );
  }

  /**
   * This filter is mock to get corresponding _id
   * @param page
   * @param pageSize
   * @param hotels
   * @private
   */
  private _mockPagination(
    page: number = 1,
    pageSize: number = 10,
    hotels: AcmeSource[],
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
      .get<AcmeSource[]>(AcmeClient.BASE_URL, {
        params: { page, pageSize, destinationIds },
      })
      .then(this._processAxiosResponse)
      .then((hotels) => this._mockFilterByDestinationId(destinationIds, hotels))
      .then((hotels) => this._mockFilterById(hotelIds, hotels))
      .then((hotels) => this._mockPagination(page, pageSize, hotels))
      .then((hotels) =>
        hotels.map((hotel) => plainToInstance(AcmeSource, hotel)),
      );
  }
}
