import { SearchQueryDto } from '../dto/api/search-query.dto';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { HotelModel } from '../model/hotel.model';
import { merge } from 'lodash';
import { In } from 'typeorm';

export function parseSearchQueryCondition(searchQuery: SearchQueryDto) {
  const condition: FindManyOptions<HotelModel> = {
    where: {
      id: undefined,
      destination_id: undefined,
    },
  };

  // Todo: Better to use builder Design Pattern to build query
  if (searchQuery.getHotelList().length > 0) {
    condition.where = merge(condition.where, {
      id: In(searchQuery.getHotelList()),
    });
  }

  if (searchQuery.getDestinationList().length > 0) {
    condition.where = merge(condition.where, {
      destination_id: In(searchQuery.getDestinationList()),
    });
  }

  if (searchQuery.page) {
    condition.skip = Math.max(searchQuery.page - 1, 0);
  }

  if (searchQuery.pageSize) {
    condition.take = Math.max(1, searchQuery.pageSize);
  }

  return condition;
}
