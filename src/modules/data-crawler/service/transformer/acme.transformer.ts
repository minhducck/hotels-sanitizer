import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataTransformerService } from '../data-transformer.service';
import { DataSourceEnum } from '../../dto/data-source.enum';
import { TransformerInterface } from '../../interface/transformer.interface';
import {
  HotelAmenities,
  HotelImages,
  HotelLocation,
  HotelModel,
} from '../../model/hotel.model';
import { AcmeSource } from '../../dto/source-data/acme.source';

@Injectable()
export class AcmeTransformer
  implements TransformerInterface, OnApplicationBootstrap
{
  constructor(
    @Inject(DataTransformerService)
    private readonly dataConverter: DataTransformerService,
  ) {}

  onApplicationBootstrap() {
    this.dataConverter.registerTransformer(DataSourceEnum.ACME, this);
  }

  transform(source: AcmeSource): Partial<HotelModel> {
    return new HotelModel({
      id: source.Id,
      destination_id: source.DestinationId,
      name: source.Name,
      location: this.parseLocation(source),
      description: source.Description,
      amenities: this.parseAmenities(source),
      images: this.parseImages(source),
      booking_conditions: undefined,
    });
  }

  private parseLocation(source: AcmeSource): Partial<HotelLocation> {
    return {
      address: source.Address,
      lat: source.Latitude,
      lng: source.Longitude,
      city: source.City,
      country: source.Country,
    };
  }

  private parseAmenities(source: AcmeSource): HotelAmenities {
    return { general: source.Facilities };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private parseImages(source: AcmeSource): HotelImages {
    return {};
  }
}
