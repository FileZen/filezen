import { ZenStorageOptions } from '@filezen/js';

export interface FileZenModuleOptions extends ZenStorageOptions {
  /**
   * Whether to make the module global
   * @default false
   */
  global?: boolean;
  
  /**
   * Controller configuration for URL presigning
   */
  controller?: FileZenControllerOptions;
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
  useFactory: (...args: any[]) => Promise<FileZenModuleOptions> | FileZenModuleOptions;
  
  /**
   * Dependencies to inject into the factory function
   */
  inject?: any[];
}

export interface FileZenControllerOptions<TRequest = any> {
  /**
   * Custom path for the controller
   * @default 'upload/sign'
   */
  path?: string;
  
  /**
   * Whether to enable the default controller
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Middleware function that receives the request and returns boolean
   * @param request - The incoming request object
   * @returns Promise<boolean> - Whether the request should proceed
   */
  middleware?: (request: TRequest) => Promise<boolean> | boolean;
  
  /**
   * Custom decorators to apply to the controller class
   */
  decorators?: {
    /**
     * Decorators to apply to the controller class
     */
    class?: any[];
    
    /**
     * Decorators to apply to the generateSignedUrl method
     */
    method?: any[];
  };
}

export interface SignedUrlRequest {
  path: string;
  fileKey: string;
  expiresIn?: number; // seconds
}

export interface SignedUrlResponse {
  url: string;
} 