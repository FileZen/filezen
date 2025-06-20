import { ZenStorageOptions } from '@filezen/js';

export interface FileZenModuleOptions extends ZenStorageOptions {
  /**
   * Whether to make the module global
   * @default false
   */
  global?: boolean;
}

export interface FileZenModuleAsyncOptions {
  /**
   * Whether to make the module global
   * @default false
   */
  global?: boolean;
  
  /**
   * Factory function to create options
   */
  useFactory: (...args: any[]) => Promise<ZenStorageOptions> | ZenStorageOptions;
  
  /**
   * Dependencies to inject into the factory function
   */
  inject?: any[];
} 