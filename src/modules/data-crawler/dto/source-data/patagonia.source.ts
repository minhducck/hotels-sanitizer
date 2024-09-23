import { SourceDataInterface } from '../../interface/source-data.interface';
import { DataSourceEnum } from '../data-source.enum';

type PatagoniaImage = {
  [roomType: string]: Array<{ url: string; description: string }>;
};

export class PatagoniaSource implements SourceDataInterface {
  id: string;
  destination: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  info: string;
  amenities: string[];
  images: PatagoniaImage;

  get sourceId() {
    return DataSourceEnum.patagonia;
  }
}
