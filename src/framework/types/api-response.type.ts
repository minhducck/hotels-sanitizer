export type SuccessResponse<T = any> = {
  error: false;
  result: T;
  message?: string;
};

export class ApiErrorResponseType extends Error {
  name: string;
  error: true;
  message: string;
  statusCode: number;
  stack?: string;
}

export type APIResponse<T> = SuccessResponse<T> | ApiErrorResponseType;
