import { HotelModel } from '../model/hotel.model';
import { SourceDataInterface } from '../interface/source-data.interface';
import { Injectable } from '@nestjs/common';
import { TransformerInterface } from '../interface/transformer.interface';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { DataSourceEnum } from '../dto/data-source.enum';

@Injectable()
export class DataTransformerService implements TransformerInterface {
  private transformers = new Map<string, TransformerInterface>([]);

  public registerTransformer(id: string, handler: TransformerInterface) {
    if (this.transformers.has(id)) {
      throw new RuntimeException(`The handler ${id} is already registered`);
    }

    this.transformers.set(id, handler);
  }

  transform(sourceData: SourceDataInterface): Partial<HotelModel> {
    return this.getTransformer(sourceData.sourceId).transform(sourceData);
  }

  private getTransformer(sourceData: DataSourceEnum) {
    if (!this.transformers.has(sourceData)) {
      throw new RuntimeException(`The handler ${sourceData} is not registered`);
    }

    return this.transformers.get(sourceData);
  }
}
