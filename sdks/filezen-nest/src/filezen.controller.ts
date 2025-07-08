import { ZenStorage } from '@filezen/js';
import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Request,
} from '@nestjs/common';
import { FILEZEN_STORAGE } from './filezen.constants';
import type {
  FileZenControllerOptions,
  SignedUrlRequest,
  SignedUrlResponse,
} from './filezen.types';

export function createFileZenController<TRequest = any>(
  options: FileZenControllerOptions<TRequest> = {},
) {
  const { path = 'upload/sign', middleware, decorators } = options;

  @Controller(path)
  class FileZenController {
    constructor(
      @Inject(FILEZEN_STORAGE) public readonly zenStorage: ZenStorage,
    ) {}

    @Post()
    async generateSignedUrl(
      @Body() body: SignedUrlRequest,
      @Request() request: TRequest,
    ): Promise<SignedUrlResponse> {
      if (middleware) {
        const shouldProceed = await middleware(request);
        if (shouldProceed === false) {
          throw new BadRequestException('Middleware not passed');
        }
      }

      const { path: requestPath, fileKey, expiresIn } = body;

      const url = this.zenStorage.generateSignedUrl({
        path: requestPath,
        fileKey,
        expiresIn,
      });

      return { url };
    }
  }

  // Apply custom class decorators (after @Controller)
  let DecoratedClass: any = FileZenController;
  if (decorators?.class) {
    for (const decorator of decorators.class) {
      DecoratedClass = decorator(DecoratedClass) || DecoratedClass;
    }
  }

  // Apply custom method decorators
  if (decorators?.method) {
    for (const decorator of decorators.method) {
      decorator(
        DecoratedClass.prototype,
        'generateSignedUrl',
        Object.getOwnPropertyDescriptor(DecoratedClass.prototype, 'generateSignedUrl')
      );
    }
  }

  return DecoratedClass;
}
