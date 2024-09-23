import { SourceClientInterface } from '../interface/source-client.interface';
import { SourceDataInterface } from '../interface/source-data.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataTransformerService } from './data-transformer.service';
import { HotelModel } from '../model/hotel.model';

@Injectable()
export class HotelRemoteService implements SourceClientInterface<HotelModel[]> {
  private clients: Set<SourceClientInterface<SourceDataInterface>> = new Set();
  private logger = new Logger('HotelRemoteService');

  constructor(
    @Inject(DataTransformerService)
    private readonly dataTransformerService: DataTransformerService,
  ) {}

  registerClient(client: SourceClientInterface<SourceDataInterface>) {
    this.clients.add(client);
  }

  async getHotelsByQuery(
    hotelIds: string[] = [],
    destinationIds: number[] = [],
    page: number = 1,
    pageSize: number = 10,
  ) {
    const response: Promise<HotelModel[]>[] = [];

    for (const client of this.clients) {
      const hotelList = client
        .getHotelsByQuery(hotelIds, destinationIds, page, pageSize)
        .then((hotelList) =>
          hotelList.map((hotelSource) =>
            this.dataTransformerService.transform(hotelSource),
          ),
        )
        .catch((err) => {
          this.logger.error(
            `Error during fetching hotels detail from remote source ${client.getClientSourceId()}: ${err.message}`,
          );
          this.logger.debug(err);
          this.logger.debug(hotelIds, destinationIds, page, pageSize);
          return undefined;
        });
      response.push(hotelList);
    }

    return Promise.all(response);
  }

  getClientSourceId(): string {
    return 'AggregatorService';
  }

  getClients() {
    return [...this.clients.values()];
  }
}
