import { Module, DynamicModule, Provider } from '@nestjs/common';
import { FileZenModuleOptions, FileZenModuleAsyncOptions } from './filezen.types';
import { FILEZEN_MODULE_OPTIONS, FILEZEN_STORAGE } from './filezen.constants';
import { ZenStorage } from '@filezen/js';

@Module({})
export class FileZenModule {
  /**
   * Register the FileZen module with static options
   */
  static forRoot(options: FileZenModuleOptions = {}): DynamicModule {
    const { global, ...zenOptions } = options;
    
    // Set keepUploads to false by default for Nest.js (server-side usage)
    const defaultOptions = {
      keepUploads: false,
      ...zenOptions,
    };
    
    const providers: Provider[] = [
      {
        provide: FILEZEN_MODULE_OPTIONS,
        useValue: defaultOptions,
      },
      {
        provide: FILEZEN_STORAGE,
        useFactory: (options: FileZenModuleOptions) => {
          return new ZenStorage(options);
        },
        inject: [FILEZEN_MODULE_OPTIONS],
      },
    ];

    return {
      module: FileZenModule,
      providers,
      exports: [FILEZEN_STORAGE],
      global,
    };
  }

  /**
   * Register the FileZen module with async options
   */
  static forRootAsync(options: FileZenModuleAsyncOptions): DynamicModule {
    const { global, useFactory, inject = [] } = options;

    const providers: Provider[] = [
      {
        provide: FILEZEN_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => {
          const zenOptions = await useFactory(...args);
          // Set keepUploads to false by default for Nest.js (server-side usage)
          return {
            keepUploads: false,
            ...zenOptions,
          };
        },
        inject,
      },
      {
        provide: FILEZEN_STORAGE,
        useFactory: (zenOptions: FileZenModuleOptions) => {
          return new ZenStorage(zenOptions);
        },
        inject: [FILEZEN_MODULE_OPTIONS],
      },
    ];

    return {
      module: FileZenModule,
      providers,
      exports: [FILEZEN_STORAGE],
      global,
    };
  }
} 
