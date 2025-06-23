import { createHmac } from 'crypto';
import { ZenApi } from '../ZenApi';

export type ZenSignerGenerateOptions = {
  path: string | '/files/upload' | '/files/chunk-upload/initialize';
  fileKey: string;
  expiresIn?: number | null;
};

export class ZenSigner {
  private credentials: { key: string; secret: string };

  constructor(private readonly api: ZenApi) {
    const decodedCredentials = Buffer.from(api.apiKey, 'base64')
      .toString('utf-8')
      .split(',');
    this.credentials = {
      key: decodedCredentials[0]!,
      secret: decodedCredentials[1]!,
    };
  }

  generateSignedUrl(options: ZenSignerGenerateOptions) {
    const expiresAt =
      Math.floor(Date.now() / 1000) + (options.expiresIn ?? 3600);
    const stringToSign = [options.fileKey, expiresAt].join('/n');
    const signature = createHmac('sha256', this.credentials.secret)
      .update(stringToSign)
      .digest('hex');
    const signedUrl = new URL(
      `${this.api.apiUrl}/${options.path.startsWith('/') ? options.path.substring(1) : options.path}`,
    );
    signedUrl.searchParams.set('signature', signature);
    signedUrl.searchParams.set('accessKey', this.credentials.key);
    signedUrl.searchParams.set('expires', expiresAt.toString());
    return signedUrl.toString();
  }
}
