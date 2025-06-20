import { Controller, Post } from '@nestjs/common';
import { InjectZenStorage } from '@filezen/nest';
import { ZenStorage } from '@filezen/js';
import * as fs from 'fs';
import * as path from 'path';

@Controller('upload')
export class UploadController {
  constructor(
    @InjectZenStorage()
    private readonly zenStorage: ZenStorage,
  ) {}

  @Post('server-image')
  async uploadFromServerSide() {
    const filePath = path.resolve('../../', 'test-files', 'image_2mb.jpg');
    const fileBuffer = fs.readFileSync(filePath);

    const uploadResult = await this.zenStorage.upload(fileBuffer, {
      name: 'image_2mb.jpg',
      mimeType: 'image/jpeg',
      folder: '/test-folder',
    });

    if (uploadResult.error) {
      throw uploadResult.error;
    }

    return uploadResult.file;
  }
}
