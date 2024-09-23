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
import { PatagoniaSource } from '../../dto/source-data/patagonia.source';

@Injectable()
export class PatagoniaTransformer
  implements TransformerInterface, OnApplicationBootstrap
{
  constructor(
    @Inject(DataTransformerService)
    private readonly dataConverter: DataTransformerService,
  ) {}

  onApplicationBootstrap() {
    this.dataConverter.registerTransformer(DataSourceEnum.patagonia, this);
  }

  transform(source: PatagoniaSource): Partial<HotelModel> {
    return new HotelModel({
      id: source.id,
      destination_id: source.destination,
      name: source.name,
      location: this.parseLocation(source),
      description: source.info,
      amenities: this.parseAmenities(source),
      images: this.parseImages(source),
      booking_conditions: undefined,
    });
  }

  private parseLocation(source: PatagoniaSource): Partial<HotelLocation> {
    return {
      address: source.address,
      lat: source.lat,
      lng: source.lng,
      city: undefined,
      country: undefined,
    };
  }

  private parseAmenities(source: PatagoniaSource): HotelAmenities {
    return { general: source.amenities };
  }

  private parseImages(source: PatagoniaSource): HotelImages {
    const images = source.images;
    const result: HotelImages = {};

    for (const roomType in images) {
      result[roomType] = Object.values(
        images[roomType].map((imageEntry) => ({
          link: imageEntry.url,
          description: imageEntry.description,
        })),
      );
    }
    return result;
  }
}
