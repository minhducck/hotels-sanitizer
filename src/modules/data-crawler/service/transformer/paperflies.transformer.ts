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
import { PaperFliesSource } from '../../dto/source-data/paperflies.source';

@Injectable()
export class PaperfliesTransformer
  implements TransformerInterface, OnApplicationBootstrap
{
  constructor(
    @Inject(DataTransformerService)
    private readonly dataConverter: DataTransformerService,
  ) {}

  onApplicationBootstrap() {
    this.dataConverter.registerTransformer(DataSourceEnum.paperflies, this);
  }

  transform(source: PaperFliesSource): Partial<HotelModel> {
    return new HotelModel({
      id: source.hotel_id,
      destination_id: source.destination_id,
      name: source.hotel_name,
      location: this.parseLocation(source),
      description: source.details,
      amenities: this.parseAmenities(source),
      images: this.parseImages(source),
      booking_conditions: source.booking_conditions,
    });
  }

  private parseLocation(source: PaperFliesSource): Partial<HotelLocation> {
    return {
      address: source.location.address,
      country: source.location.country,
    };
  }

  private parseAmenities(source: PaperFliesSource): HotelAmenities {
    return source.amenities;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private parseImages(source: PaperFliesSource): HotelImages {
    const images = source.images;
    const result: HotelImages = {};

    for (const roomType in images) {
      result[roomType] = Object.values(
        images[roomType].map((imageEntry) => ({
          link: imageEntry.link,
          description: imageEntry.caption,
        })),
      );
    }

    return result;
  }
}
