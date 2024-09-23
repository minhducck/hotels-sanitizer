import { SourceDataInterface } from './source-data.interface';
import { HotelModel } from '../model/hotel.model';

export interface TransformerInterface {
  transform(value: SourceDataInterface): Partial<HotelModel>;
}
