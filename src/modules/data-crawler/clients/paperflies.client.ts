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
import { PaperFliesSource } from '../dto/source-data/paperflies.source';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PaperfliesClient
  implements SourceClientInterface<PaperFliesSource>, OnApplicationBootstrap
{
  private apiConnector: AxiosInstance;
  private logger = new Logger('PaperfliesClient');

  public static BASE_URL =
    'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies';

  constructor(
    @Inject(HotelRemoteService)
    private readonly hotelRemoteService: HotelRemoteService,
  ) {
    this.apiConnector = axios.create({
      timeout: 5000,
      timeoutErrorMessage: 'Paperflies API Request Timeout',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    addLogHandler(this.apiConnector, this.logger);
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
  private _mockFilterById(ids: string[], hotels: PaperFliesSource[]) {
    return hotels.filter(
      (hotel) => ids.length === 0 || ids.includes(hotel.hotel_id),
    );
  }

  /**
   * This filter is mock to get corresponding _id
   * @param ids
   * @param hotels
   * @private
   */
  private _mockFilterByDestinationId(
    ids: number[],
    hotels: PaperFliesSource[],
  ) {
    return hotels.filter(
      (hotel) => ids.length === 0 || ids.includes(hotel.destination_id),
    );
  }

  private _mockPagination(
    page: number = 1,
    pageSize: number = 10,
    hotels: PaperFliesSource[],
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
      .get<PaperFliesSource[]>(PaperfliesClient.BASE_URL, {
        params: { page, pageSize, destinationIds },
      })
      .then(this._processAxiosResponse)
      .then((hotels) => this._mockFilterByDestinationId(destinationIds, hotels))
      .then((hotels) => this._mockFilterById(hotelIds, hotels))
      .then((hotels) => this._mockPagination(page, pageSize, hotels))
      .then((hotels) =>
        hotels.map((hotel) => plainToInstance(PaperFliesSource, hotel)),
      );
  }

  getClientSourceId(): string {
    return DataSourceEnum.paperflies;
  }
}
