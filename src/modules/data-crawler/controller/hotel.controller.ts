import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { HotelModel } from '../model/hotel.model';
import { SearchQueryDto } from '../dto/api/search-query.dto';
import { HotelRemoteService } from '../service/hotel-remote-service';
import { plainToInstance } from 'class-transformer';
import { groupBy } from 'lodash';
import { DataMergerService } from '../service/data-merger.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HotelManagementService } from '../service/hotel-management.service';
import { parseSearchQueryCondition } from '../helper/parse-search-query-condition';
import { SearchQueryResponseInterceptor } from '../../../framework/interceptor/search-query-response.interceptor';

@ApiTags('Hotels')
@Controller({ path: 'hotels' })
export class HotelController {
  constructor(
    private readonly hotelManagement: HotelManagementService,
    private readonly remoteHotelService: HotelRemoteService,
    private readonly dataMergerService: DataMergerService,
  ) {}

  @Post('search')
  @ApiOperation({ summary: 'Search for hotels' })
  @ApiResponse({ status: 200, description: 'Success request' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @HttpCode(200)
  @UseInterceptors(SearchQueryResponseInterceptor)
  async filter(
    @Body() searchQuery: SearchQueryDto,
  ): Promise<[collection: HotelModel[], totalCollectionSize: number]> {
    searchQuery = plainToInstance(SearchQueryDto, searchQuery);
    const searchCriteria = parseSearchQueryCondition(searchQuery);

    const cachedData = await this.hotelManagement.getCacheListByIds(
      searchQuery.getHotelList(),
    );

    if (
      searchQuery.getHotelList().length &&
      cachedData[1] === searchQuery.getHotelList().length
    ) {
      return this.hotelManagement.getList(searchCriteria);
    }

    const collection = await this.remoteHotelService.getHotelsByQuery(
      searchQuery.getHotelList(),
      searchQuery.getDestinationList(),
      searchQuery.page,
      searchQuery.pageSize,
    );

    const groupHotelByIds = groupBy(
      collection.flatMap((hotels) => hotels),
      (hotel) => hotel.id,
    );

    const hotelEntries: HotelModel[] = [];

    for (const id in groupHotelByIds) {
      const hotelEntry = this.dataMergerService.merge(
        groupHotelByIds[id][0],
        groupHotelByIds[id].slice(1),
      );
      hotelEntry.updatedAt = new Date();
      hotelEntries.push(hotelEntry);
    }

    await this.hotelManagement.saveBulk(hotelEntries);
    return this.hotelManagement.getList(parseSearchQueryCondition(searchQuery));
  }
}
