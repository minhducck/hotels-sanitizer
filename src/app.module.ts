import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './modules/common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    MongooseModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
