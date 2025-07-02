import axios from 'axios';
import { DEFAULT_SIGN_URL } from './constants';
import { buildZenErrorResult, buildZenSuccessResult, ZenResult, } from './ZenResult';
import { ZenUploader } from './ZenUploader';
import { ZenUploaderProvider, ZenUploaderProviderListener, } from './ZenUploaderProvider';

export type ZenClientListener = ZenUploaderProviderListener;

export type ZenClientOptions = {
  url?: string;
  signUrl?: string;
  keepUploads?: boolean;
};

export class ZenClient extends ZenUploaderProvider<ZenClientListener> {
  private readonly options: Omit<ZenClientOptions, 'signUrl'> & {
    signUrl: string;
  };
  private readonly uploader: ZenUploader;

  constructor(options?: ZenClientOptions) {
    super();
    this.options = {
      ...options,
      signUrl: options?.signUrl ?? DEFAULT_SIGN_URL,
    };
    this.uploader = new ZenUploader(this.options);
  }

  protected getUploader(): ZenUploader {
    return this.uploader;
  }

  protected isKeepingUploads(): boolean {
    return this.options.keepUploads === true;
  }

  async delete(urlOrId: string): Promise<ZenResult<boolean>> {
    return await axios
      .delete<{ success: boolean }>(this.options.signUrl, {
        params: {
          urlOrId: urlOrId,
        },
      })
      .then((result) => {
        return buildZenSuccessResult(result.data.success);
      })
      .catch((error) => {
        return buildZenErrorResult(error);
      });
  }
}
