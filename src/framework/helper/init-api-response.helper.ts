import {
  ApiErrorResponseType,
  APIResponse,
  SuccessResponse,
} from '../types/api-response.type';

export const initApiResponse = <T = any>(
  result: Error | T,
  message?: string,
): APIResponse<T> => {
  if (result instanceof Error) {
    return result as ApiErrorResponseType;
  }

  return {
    error: false,
    result,
    message,
  } as SuccessResponse<T>;
};
