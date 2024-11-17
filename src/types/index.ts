export interface ProcessedImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  crops: ImageCrop[];
}

export interface ImageCrop {
  id: string;
  platform: 'instagram' | 'facebook';
  type: 'square' | 'portrait' | 'landscape' | 'stories' | 'custom';
  aspectRatio: number;
  coordinates: CropCoordinates;
  preview?: string;
}

export interface CropCoordinates {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface AspectRatioPreset {
  name: string;
  value: number;
  platform: string;
  type: string;
}