<script setup lang="ts">
import { ref } from 'vue';
import imageCompression from 'browser-image-compression';
import { useImageStore } from '../stores/imageStore';
import { useToast } from 'vue-toastification';

const imageStore = useImageStore();
const toast = useToast();
const format = ref<'jpeg' | 'png'>('jpeg');
const quality = ref(0.8);
const processing = ref(false);

const exportImages = async () => {
  if (!imageStore.currentImage) {
    toast.error('No image to export');
    return;
  }

  processing.value = true;
  try {
    const image = imageStore.currentImage;
    for (const crop of image.crops) {
      // Create canvas with cropped dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      const img = new Image();
      img.src = image.previewUrl;
      await new Promise(resolve => img.onload = resolve);

      canvas.width = crop.coordinates.width;
      canvas.height = crop.coordinates.height;
      
      ctx.drawImage(
        img,
        crop.coordinates.left,
        crop.coordinates.top,
        crop.coordinates.width,
        crop.coordinates.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Compress and download
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(
          blob => resolve(blob!),
          `image/${format.value}`,
          quality.value
        );
      });

      const compressedFile = await imageCompression(
        new File([blob], `${image.originalFile.name}-${crop.platform}-${crop.type}.${format.value}`, {
          type: `image/${format.value}`
        }),
        {
          maxSizeMB: 1,
          maxWidthOrHeight: 2048,
        }
      );

      // Download file
      const url = URL.createObjectURL(compressedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = compressedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast.success('Images exported successfully');
  } catch (error) {
    toast.error('Error exporting images');
  } finally {
    processing.value = false;
  }
};
</script>

<template>
  <div v-if="imageStore.currentImage" class="space-y-4 p-4 bg-gray-50 rounded-lg">
    <div class="flex space-x-4 items-center">
      <div class="space-y-2">
        <label class="block text-sm font-medium">Format</label>
        <select v-model="format" class="rounded border p-2">
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium">Quality</label>
        <input
          type="range"
          v-model="quality"
          min="0.1"
          max="1"
          step="0.1"
          class="w-32"
        >
        <span class="ml-2">{{ Math.round(quality * 100) }}%</span>
      </div>
    </div>

    <button
      @click="exportImages"
      :disabled="processing"
      class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {{ processing ? 'Processing...' : 'Export Images' }}
    </button>
  </div>
</template>