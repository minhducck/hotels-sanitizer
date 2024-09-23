import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiSearchResultResponse } from '../dto/api/api-search-result-response';
import { HotelModel } from '../model/hotel.model';
import { SearchQueryDto } from '../dto/api/search-query.dto';
import { HotelRemoteService } from '../service/hotel-remote-service';
import { plainToInstance } from 'class-transformer';
import { groupBy } from 'lodash';
import { DataMergerService } from '../service/data-merger.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Hotels')
@Controller({ path: 'hotels' })
export class HotelController {
  constructor(
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
  async filter(
    @Body() searchQuery: SearchQueryDto,
  ): Promise<ApiSearchResultResponse<HotelModel>> {
    searchQuery = plainToInstance(SearchQueryDto, searchQuery);

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
      hotelEntries.push(hotelEntry);
    }

    return {
      searchResult: hotelEntries,
      possibleToGoNextPage: hotelEntries.length >= searchQuery.pageSize,
      totalCollectionSize: hotelEntries.length,
    };
  }
}
