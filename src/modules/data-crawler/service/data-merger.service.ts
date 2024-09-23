import { HotelModel } from '../model/hotel.model';
import { mergeWith, MergeWithCustomizer } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { mergeByCustomizerHelper } from '../helper/merge-by-customizer.helper';

@Injectable()
export class DataMergerService {
  private readonly logger = new Logger('DataMergerService');
  private readonly customizer: MergeWithCustomizer = mergeByCustomizerHelper;

  constructor(customizer?: MergeWithCustomizer) {
    if (customizer) {
      this.customizer = customizer;
    }
  }

  private reducer = (accumulator: HotelModel, hotelObjToMerge: HotelModel) => {
    return mergeWith(accumulator, hotelObjToMerge, this.customizer);
  };

  merge(destination: HotelModel, sources: HotelModel[]): HotelModel {
    this.logger.log(`Merge hotel data: `, destination.id);

    return sources.reduce(this.reducer, destination);
  }
}
