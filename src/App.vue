<script setup lang="ts">
import { createPinia } from 'pinia';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import ImageUploader from './components/ImageUploader.vue';
import ImageProcessor from './components/ImageProcessor.vue';
import ImageExporter from './components/ImageExporter.vue';

const pinia = createPinia();
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto space-y-8">
      <h1 class="text-3xl font-bold text-center">Social Media Image Processor</h1>
      
      <ImageUploader />
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <ImageProcessor />
      </div>
      
      <ImageExporter />
    </div>
  </div>
</template>