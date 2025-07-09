export const UUID_REGEX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

export function isValidUUID(uuid: string) {
  return UUID_REGEX.test(uuid);
}

export const isBrowser: boolean =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const isNode: boolean =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

// URL validation regex
export const URL_REGEX =
  /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.-])*(?:\?(?:[\w&=%.,-])*)?(?:\#(?:[\w.-])*)?)?$/;

export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return URL_REGEX.test(url);
  } catch {
    return false;
  }
}

export function isUri(uri: string): boolean {
  return uri.startsWith('file:///') || uri.startsWith('content:///');
}

export function isBase64(str: string): boolean {
  // Check for data URL format or pure base64
  return str.startsWith('data:') || /^[A-Za-z0-9+/]*={0,2}$/.test(str);
}

// Common mime type mappings
const MIME_TYPE_MAP: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  tiff: 'image/tiff',
  tif: 'image/tiff',

  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  rtf: 'application/rtf',

  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
  m4a: 'audio/mp4',

  // Video
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',
  webm: 'video/webm',
  mkv: 'video/x-matroska',

  // Archives
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',

  // Web
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  xml: 'application/xml',
};

export interface UrlFileInfo {
  filename: string;
  extension: string | null;
  mimeType: string | null;
  isValid: boolean;
}

export function extractFileInfoFromUrl(url: string): UrlFileInfo | null {
  if (!isUrl(url) || isUri(url)) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname || '';

    // Remove query parameters and hash
    const cleanPath = pathname.split('?')[0]?.split('#')[0] || '';

    // Extract filename from path
    const pathSegments = cleanPath
      .split('/')
      .filter((segment) => segment.length > 0);
    let filename = pathSegments[pathSegments.length - 1] || 'unknown';

    // If no filename found or it looks like a directory, generate one from URL
    if (!filename || filename === 'unknown' || !filename.includes('.')) {
      // Try to extract meaningful name from URL path or use domain
      const meaningfulSegments = pathSegments.filter(
        (segment) =>
          segment !== 'photo' &&
          segment !== 'image' &&
          segment !== 'file' &&
          !segment.match(/^\d+$/), // exclude pure numbers
      );

      if (meaningfulSegments.length > 0) {
        filename =
          meaningfulSegments[meaningfulSegments.length - 1] || 'unknown';
      } else {
        // Use domain as fallback
        filename = (urlObj.hostname || 'unknown').replace(/^www\./, '');
      }

      // Clean up filename (remove special chars, limit length)
      filename = filename
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);

      if (!filename) {
        filename = 'unknown';
      }
    }

    // Extract extension
    const lastDotIndex = filename.lastIndexOf('.');
    let extension: string | null = null;
    let mimeType: string | null = null;

    if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
      extension = filename.substring(lastDotIndex + 1).toLowerCase();
      mimeType = MIME_TYPE_MAP[extension] || null;
    }

    return {
      filename,
      extension,
      mimeType,
      isValid: true,
    };
  } catch (error) {
    return null;
  }
}

export function getMimeTypeFromName(filename: string): string | null {
  const lastDotIndex = filename.lastIndexOf('.');
  let extension: string | null = null;
  let mimeType: string | null = null;

  if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
    extension = filename.substring(lastDotIndex + 1).toLowerCase();
    mimeType = MIME_TYPE_MAP[extension] || null;
  }
  return mimeType;
}

export function getMimeTypeFromExtension(extension: string): string | null {
  return MIME_TYPE_MAP[extension.toLowerCase()] || null;
}
