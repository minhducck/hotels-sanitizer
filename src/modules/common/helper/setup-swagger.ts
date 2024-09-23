import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export function setupSwagger(app) {
  const configService: ConfigService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle(
      `${configService.get('APPLICATION_NAME')}
      - API Documentation
      - ${configService.get('APP_VERSION')}`,
    )
    .setContact(
      'Ta Minh Duc',
      'https://duckonemorec.me/',
      'minhducck@gmail.com',
    )
    .setVersion(configService.get('APP_VERSION'))
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  SwaggerModule.setup(
    'swagger',
    app,
    SwaggerModule.createDocument(app, config, options),
  );
}
