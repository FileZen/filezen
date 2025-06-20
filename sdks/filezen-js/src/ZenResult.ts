import { buildZenError, ZenError } from './ZenError';

export class ZenResult<T> {
  constructor(
    readonly data?: T,
    readonly error?: ZenError,
  ) {}
}

export const buildZenSuccessResult = <T>(data?: T) => {
  return new ZenResult<T>(data);
};

export const buildZenErrorResult = <T>(error: any) => {
  return new ZenResult<T>(undefined, buildZenError(error));
};
