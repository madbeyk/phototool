<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import heic2any from 'heic2any';
import { useImageStore } from '../stores/imageStore';

const toast = useToast();
const imageStore = useImageStore();
const dragActive = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const processFile = async (file: File) => {
  try {
    let processedFile = file;
    
    // Convert HEIC to JPEG if needed
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
      });
      processedFile = new File([blob as Blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
        type: 'image/jpeg',
      });
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(processedFile);
    
    imageStore.addImage({
      id: crypto.randomUUID(),
      originalFile: processedFile,
      previewUrl,
      crops: [],
    });
  } catch (error) {
    toast.error('Error processing image. Please try again.');
  }
};

const handleFiles = async (files: FileList) => {
  if (files.length > 1) {
    toast.error('Please upload only one image at a time');
    return;
  }

  const file = files[0];
  if (!file.type.startsWith('image/')) {
    toast.error(`${file.name} is not an image file`);
    return;
  }
  
  await processFile(file);
  
  // Reset the file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const onDrop = async (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  
  if (e.dataTransfer?.files) {
    await handleFiles(e.dataTransfer.files);
  }
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = true;
};

const onDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
};

const onFileInput = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    await handleFiles(files);
  }
};

const reset = () => {
  imageStore.reset();
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

<template>
  <div>
    <div
      class="w-full p-8 border-2 border-dashed rounded-lg transition-colors mb-4"
      :class="{ 'border-blue-500 bg-blue-50': dragActive, 'border-gray-300': !dragActive }"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <div class="text-center">
        <input
          ref="fileInput"
          type="file"
          accept="image/*,.heic"
          class="hidden"
          id="file-input"
          @change="onFileInput"
        >
        <label
          for="file-input"
          class="cursor-pointer inline-flex flex-col items-center"
        >
          <div class="text-4xl mb-2">📸</div>
          <p class="text-lg font-medium mb-1">Drop an image here or click to upload</p>
          <p class="text-sm text-gray-500">Supports JPG, PNG, and HEIC formats</p>
        </label>
      </div>
    </div>
    
    <button
      v-if="imageStore.currentImage"
      @click="reset"
      class="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
    >
      Reset
    </button>
  </div>
</template>