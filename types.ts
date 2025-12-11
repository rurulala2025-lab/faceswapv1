export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64Data: string; // Raw base64 string without data URI prefix
  mimeType: string;
}

export interface GenerationResult {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

export enum SwapMode {
  FaceSwap = 'FACE_SWAP',
  ArtisticBlend = 'ARTISTIC_BLEND'
}
