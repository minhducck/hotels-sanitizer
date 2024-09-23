import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as path from 'node:path';

enum ENV_MONGO_CONFIG_PATH {
  DB_PATH = 'DB_PATH',
}

export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(
    @Inject(ConfigService) protected readonly configService: ConfigService,
  ) {}

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: path.resolve(
        path.join(
          __dirname,
          '../../',
          this.configService.get<string>(
            ENV_MONGO_CONFIG_PATH.DB_PATH,
            '/var/database.sqlite',
          ),
        ),
      ),

      entities: [__dirname + '/../**/model/*.model{.ts,.js}'],
      synchronize: true,
      logging:
        process.env.ENV === 'production'
          ? ['error', 'warn', 'migration']
          : 'all',
    } as TypeOrmModuleOptions;
  }
}
