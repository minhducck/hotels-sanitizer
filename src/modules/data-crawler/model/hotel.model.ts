import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { BaseModel } from '../../../framework/entity/base.model';

export class HotelLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
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
  id: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
    comment: 'Destination Id',
  })
  @Index()
  destination_id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 255,
    comment: 'Hotel Name',
  })
  name: string;

  @Column({ type: 'json' })
  location: Partial<HotelLocation>;

  @Column({ type: 'text', comment: 'Description', nullable: true, default: '' })
  description: string;

  @Column({ type: 'json' })
  amenities?: HotelAmenities;

  @Column({ type: 'json' })
  images?: HotelImages;

  @Column({ type: 'json' })
  booking_conditions?: string[];
}
