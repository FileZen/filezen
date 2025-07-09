import { AxiosError } from 'axios';

export class ZenError {
  constructor(
    readonly code: number,
    readonly message: string,
    readonly cause?: object,
  ) {}
}

export const buildZenError = (error: any) => {
  if (error instanceof ZenError) {
    return error;
  }
  if (error instanceof AxiosError) {
    if (error.response?.data) {
      return new ZenError(
        error.response.status,
        error.response.data?.message ?? error.response.statusText,
        error.response.data,
      );
    } else if (error.message) {
      return new ZenError(
        error.status ?? -1,
        error.message ?? 'Oops, something went wrong',
      );
    }
  }
  return new ZenError(-1, 'Oops, something went wrong');
};
