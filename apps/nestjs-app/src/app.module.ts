import { Module } from '@nestjs/common';
import { FileZenModule } from '@filezen/nest';
import { UploadController } from './upload.controller';
import { AppController } from './app.controller';

@Module({
  imports: [FileZenModule.forRoot()],
  controllers: [AppController, UploadController],
  providers: [],
})
export class AppModule {}
