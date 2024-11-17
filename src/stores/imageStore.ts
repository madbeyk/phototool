import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProcessedImage } from '../types';

export const useImageStore = defineStore('images', () => {
  const currentImage = ref<ProcessedImage | null>(null);

  const addImage = (image: ProcessedImage) => {
    // Clear any existing image first
    if (currentImage.value?.previewUrl) {
      URL.revokeObjectURL(currentImage.value.previewUrl);
    }
    currentImage.value = image;
  };

  const reset = () => {
    if (currentImage.value?.previewUrl) {
      URL.revokeObjectURL(currentImage.value.previewUrl);
    }
    currentImage.value = null;
  };

  return {
    currentImage,
    addImage,
    reset,
  };
});