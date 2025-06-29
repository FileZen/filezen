import { serverSdkConfig } from '@repo/tsup-config';

export default serverSdkConfig({
  entry: ['src/index.ts'],
  external: ['@nestjs/common', '@nestjs/core', '@filezen/js'],
});
