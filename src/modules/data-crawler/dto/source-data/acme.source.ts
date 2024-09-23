import { SourceDataInterface } from '../../interface/source-data.interface';
import { DataSourceEnum } from '../data-source.enum';

export class AcmeSource implements SourceDataInterface {
  get sourceId() {
    return DataSourceEnum.ACME;
  }

  Id: string;
  DestinationId: number;
  Name: string;
  Latitude: number;
  Longitude: number;
  Address: string;
  City: string;
  Country: string;
  PostalCode: string;
  Description: string;
  Facilities: string[];
}
