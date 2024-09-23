export type ApiSearchResultResponse<T = any> = {
  searchResult: Array<T>;
  totalCollectionSize: number;
  possibleToGoNextPage: boolean;
};
