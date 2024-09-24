import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { BaseModel } from '../../../framework/entity/base.model';
import { ApiProperty } from '@nestjs/swagger';

export class HotelLocation {
  @ApiProperty({ description: 'Latitude' })
  lat: number;
  @ApiProperty({ description: 'Longitude' })
  lng: number;
  @ApiProperty({ description: 'Address' })
  address: string;
  @ApiProperty()
  city: string;
  @ApiProperty()
  country: string;
}

export class HotelAmenities {
  [roomType: string]: string[];
}

export type HotelImageEntry = {
  link: string;
  description: string;
};

export class HotelImages {
  [roomType: string]: HotelImageEntry[];
}

@Entity({ name: 'hotel' })
export class HotelModel extends BaseModel<HotelModel> {
  @PrimaryColumn({ primary: true, comment: 'Hotel Id' })
  @ApiProperty({ description: 'Hotel Id' })
  id: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
    comment: 'Destination Id',
  })
  @Index()
  @ApiProperty({ description: 'Destination Id' })
  destination_id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 255,
    comment: 'Hotel Name',
  })
  @ApiProperty({ description: 'Hotel Name' })
  name: string;

  @Column({ type: 'json' })
  @ApiProperty({ description: 'Location' })
  location: Partial<HotelLocation>;

  @Column({ type: 'text', comment: 'Description', nullable: true, default: '' })
  @ApiProperty({ description: 'Description' })
  description: string;

  @Column({ type: 'json' })
  @ApiProperty({ description: 'Hotel Amenities' })
  amenities?: HotelAmenities;

  @Column({ type: 'json' })
  @ApiProperty({ description: 'Images' })
  images?: HotelImages;

  @Column({ type: 'json' })
  @ApiProperty({ description: 'Booking Conditions' })
  booking_conditions?: string[];
}
