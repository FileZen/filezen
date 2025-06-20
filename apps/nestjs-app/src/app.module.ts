import { Module } from '@nestjs/common';
import { FileZenModule } from '@filezen/nest';
import { UploadController } from './upload.controller';

@Module({
  imports: [FileZenModule.forRoot()],
  controllers: [UploadController],
  providers: [],
})
export class AppModule {}
