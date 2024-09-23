export interface SourceClientInterface<T> {
  getClientSourceId(): string;

  getHotelsByQuery(
    hotelIds: string[],
    destinationIds: number[],
    page: number,
    pageSize: number,
  ): Promise<T[]>;
}
