import { ZenSigner, ZenSignerGenerateOptions } from './server';
import { isValidUUID } from './utils';
import { ZenApi, ZenApiOptions } from './ZenApi';
import { ZenUploader } from './ZenUploader';
import {
  ZenUploaderProvider,
  ZenUploaderProviderListener,
} from './ZenUploaderProvider';

export type ZenStorageOptions = ZenApiOptions & {
  keepUploads?: boolean;
};

export type ZenStorageListener = ZenUploaderProviderListener;

export class ZenStorage extends ZenUploaderProvider<ZenStorageListener> {
  readonly api: ZenApi;
  readonly signer: ZenSigner;

  constructor(readonly options: ZenStorageOptions = {}) {
    super();
    this.api = new ZenApi(options);
    this.signer = new ZenSigner(this.api);
  }

  protected getUploader(): ZenUploader {
    return this.api.uploader;
  }

  protected isKeepingUploads(): boolean {
    return this.options.keepUploads === true;
  }

  generateSignedUrl(options: ZenSignerGenerateOptions) {
    return this.signer.generateSignedUrl(options);
  }

  deleteByUrl(urlOrId: string) {
    if (isValidUUID(urlOrId)) {
      return this.api.deleteFile(urlOrId);
    }
    return this.api.deleteFileByUrl(urlOrId);
  }
}
