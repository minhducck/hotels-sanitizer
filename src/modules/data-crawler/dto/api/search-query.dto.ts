import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
} from 'class-validator';
import { StringNumberStringValidator } from '../../helper/string-number-string.validator';

export class SearchQueryDto {
  @ApiProperty({
    example: ['iJhz', 'SjyX'],
    description: 'List of Hotel Id to filter',
    nullable: true,
    uniqueItems: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  hotelIds: string[] = [];

  @ApiProperty({
    example: [5432, 1122],
    description: 'List of Destination Id to filter',
    nullable: true,
    uniqueItems: true,
    isArray: true,
    type: 'number',
  })
  @IsArray()
  @IsPositive({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  destinationIds: number[] = [];

  @ApiProperty({
    default: 1,
    description: 'Page Number',
    nullable: true,
  })
  @Validate(StringNumberStringValidator)
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    default: 10,
    description: 'Number of entries per page',
    nullable: true,
  })
  @Validate(StringNumberStringValidator)
  @IsOptional()
  pageSize: number = 10;

  getHotelList() {
    return this.hotelIds;
  }

  getDestinationList() {
    return this.destinationIds;
  }
}
