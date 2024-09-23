import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as ACMEMockResponse from './mock-data/acme.json';
import * as PaperFliesResponse from './mock-data/paperflies.json';
import * as PatagoniaResponse from './mock-data/patagonia.json';

import axios from 'axios';
import { AcmeClient } from '../src/modules/data-crawler/clients/acme.client';
import { PaperfliesClient } from '../src/modules/data-crawler/clients/paperflies.client';
import { HotelModel } from '../src/modules/data-crawler/model/hotel.model';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HotelController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockedAxios.get.mockImplementation((url) => {
      switch (url) {
        case AcmeClient.BASE_URL:
          return new Promise((resolve) => resolve({ data: ACMEMockResponse }));
        case PaperfliesClient.BASE_URL:
          return new Promise((resolve) =>
            resolve({ data: PaperFliesResponse }),
          );
        default:
          return new Promise((resolve) => resolve({ data: PatagoniaResponse }));
      }
    });

    mockedAxios.create.mockImplementation(() => mockedAxios);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('[POST] /hotels/search with default filters.', async () => {
    const response = await request(app.getHttpServer())
      .post('/hotels/search')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.error).toBe(false);
    expect(response.body.result).not.toBe(undefined);
    expect(response.body.result.possibleToGoNextPage).toBe(false);
    expect(response.body.result.totalCollectionSize).toBe(3);
    expect(response.body.result.searchResult).toHaveLength(3);
    expect(response.body.result.searchResult?.[0]?.id).toEqual('iJhz');
    expect(response.body.result.searchResult?.[1]?.id).toEqual('SjyX');
    expect(response.body.result.searchResult?.[2]?.id).toEqual('f8c9');
  });

  it('[POST] /hotels/search with pagination.', async () => {
    const response = await request(app.getHttpServer())
      .post('/hotels/search')
      .send({ page: 2, pageSize: 1 })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).not.toBe(undefined);
    expect(response.body.error).toBe(false);
    expect(response.body.result).not.toBe(undefined);
    expect(response.body.result.possibleToGoNextPage).toBe(true);
    expect(response.body.result.totalCollectionSize).toBe(2);
    expect(response.body.result.searchResult).toHaveLength(2);
    expect(response.body.result.searchResult?.[0]?.id).toEqual('SjyX');
  });

  it('[POST] /hotels/search wrong inputs.', async () => {
    const response = await request(app.getHttpServer())
      .post('/hotels/search')
      .send({
        page: 'AAA',
        pageSize: 'BBB',
        hotelIds: 'XXX',
        destinationIds: 'YYY',
      })
      .expect(400)
      .expect('Content-Type', /json/);

    expect(response.body).not.toBe(undefined);
    expect(response.body.error).toBe(true);
    expect(response.body.message).not.toBe(undefined);
    expect(response.body.message).toContainEqual(
      'page must be number or number string',
    );
    expect(response.body.message).toContainEqual(
      'pageSize must be number or number string',
    );
    expect(response.body.message).toContainEqual('hotelIds must be an array');
    expect(response.body.message).toContainEqual(
      'destinationIds must be an array',
    );
    expect(response.body.message).toContainEqual(
      'each value in destinationIds must be a positive number',
    );
  });

  it('[POST] /hotels/search specific hotel Ids.', async () => {
    const response = await request(app.getHttpServer())
      .post('/hotels/search')
      .send({
        hotelIds: ['SjyX', 'f8c9', 'nonExist'],
        destinationIds: [],
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).not.toBe(undefined);
    expect(response.body.error).toBe(false);
    expect(response.body.result).not.toBe(undefined);
    expect(response.body.result.possibleToGoNextPage).toBe(false);
    expect(response.body.result.totalCollectionSize).toBe(2);
    expect(response.body.result.searchResult).toHaveLength(2);
    expect(response.body.result.searchResult).toMatchObject([
      {
        id: 'SjyX',
      } as Partial<HotelModel>,
      {
        id: 'f8c9',
      } as Partial<HotelModel>,
    ]);
  });

  it('[POST] /hotels/search specific destination.', async () => {
    const response = await request(app.getHttpServer())
      .post('/hotels/search')
      .send({
        destinationIds: [1122, 5432, 123],
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).not.toBe(undefined);
    expect(response.body.error).toBe(false);
    expect(response.body.result).not.toBe(undefined);
    expect(response.body.result.possibleToGoNextPage).toBe(false);
    expect(response.body.result.totalCollectionSize).toBe(3);
    expect(response.body.result.searchResult).toHaveLength(3);
    expect(response.body.result.searchResult).toMatchObject([
      { id: 'iJhz', destination_id: 5432 },
      { id: 'SjyX', destination_id: 5432 },
      { id: 'f8c9', destination_id: 1122 },
    ]);
  });

  it('[POST] /hotels/search specific hotel Ids and destination.', async () => {
    const response = await request(app.getHttpServer())
      .post('/hotels/search')
      .send({
        hotelIds: ['SjyX', 'f8c9', 'nonExist'],
        destinationIds: [1122],
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).not.toBe(undefined);
    expect(response.body.error).toBe(false);
    expect(response.body.result).not.toBe(undefined);
    expect(response.body.result.possibleToGoNextPage).toBe(false);
    expect(response.body.result.totalCollectionSize).toBe(1);
    expect(response.body.result.searchResult).toHaveLength(1);
    expect(response.body.result.searchResult).toMatchObject([
      {
        id: 'f8c9',
        destination_id: 1122,
      } as Partial<HotelModel>,
    ]);
  });
});
