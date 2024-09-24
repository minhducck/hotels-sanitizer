import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './modules/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DataCrawlerModule } from './modules/data-crawler/data-crawler.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      expandVariables: true,
      envFilePath: ['.env', '.env.prod', '.env.dev'],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 100,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    TypeOrmModule.forRootAsync({ useClass: DatabaseConfig }),
    CommonModule,
    DataCrawlerModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
