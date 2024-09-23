import { Module } from '@nestjs/common';
import { HotelController } from './controller/hotel.controller';
import { HotelManagementService } from './service/hotel-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelModel } from './model/hotel.model';
import { DataTransformerService } from './service/data-transformer.service';
import { AcmeTransformer } from './service/transformer/acme.transformer';
import { PatagoniaTransformer } from './service/transformer/patagonia.transformer';
import { PaperfliesTransformer } from './service/transformer/paperflies.transformer';
import { HotelRemoteService } from './service/hotel-remote-service';
import { AcmeClient } from './clients/acme.client';
import { PaperfliesClient } from './clients/paperflies.client';
import { PatagoniaClient } from './clients/patagonia.client';
import { DataMergerService } from './service/data-merger.service';
import { mergeByCustomizerHelper } from './helper/merge-by-customizer.helper';

@Module({
  imports: [TypeOrmModule.forFeature([HotelModel])],
  providers: [
    HotelManagementService,
    DataTransformerService,
    PatagoniaTransformer,
    AcmeTransformer,
    PaperfliesTransformer,

    HotelRemoteService,
    AcmeClient,
    PaperfliesClient,
    PatagoniaClient,

    {
      provide: DataMergerService,
      useFactory: () => new DataMergerService(mergeByCustomizerHelper),
    },
  ],
  controllers: [HotelController],
  exports: [],
})
export class DataCrawlerModule {}
