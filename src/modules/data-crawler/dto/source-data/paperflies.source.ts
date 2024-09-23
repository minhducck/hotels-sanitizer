import { SourceDataInterface } from '../../interface/source-data.interface';
import { DataSourceEnum } from '../data-source.enum';

type PaperFliesAmenities = {
  [roomType: string]: string[];
};
type PaperFliesImageType = {
  [roomType: string]: Array<{
    link: string;
    caption: string;
  }>;
};

type PaperFliesLocation = {
  address: string;
  country: string;
};

export class PaperFliesSource implements SourceDataInterface {
  hotel_id: string;
  destination_id: number;
  hotel_name: string;
  location: PaperFliesLocation;
  details: string;
  amenities: PaperFliesAmenities;
  images: PaperFliesImageType;
  booking_conditions: string[];

  get sourceId() {
    return DataSourceEnum.paperflies;
  }
}
