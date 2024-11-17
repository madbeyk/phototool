<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { useImageStore } from '../stores/imageStore';
import type { AspectRatioPreset } from '../types';

const imageStore = useImageStore();
const currentImage = computed(() => imageStore.currentImage);
const containerHeight = ref('600px');

const presets: AspectRatioPreset[] = [
  { name: 'Square', value: 1, platform: 'instagram', type: 'square' },
  { name: 'Portrait', value: 0.8, platform: 'instagram', type: 'portrait' },
  { name: 'Landscape', value: 1.91, platform: 'instagram', type: 'landscape' },
  { name: 'Stories', value: 0.5625, platform: 'instagram', type: 'stories' },
];

const selectedPreset = ref<AspectRatioPreset>(presets[0]);
const cropperRef = ref();

const updateContainerHeight = () => {
  const availableHeight = window.innerHeight - 250;
  containerHeight.value = `${Math.max(400, Math.min(600, availableHeight))}px`;
};

const maximizeCrop = () => {
  if (!cropperRef.value) return;
  
  const cropper = cropperRef.value;
  const boundaries = cropper.getBoundaries();
  const aspect = selectedPreset.value.value;
  
  let width = boundaries.width;
  let height = width / aspect;
  
  if (height > boundaries.height) {
    height = boundaries.height;
    width = height * aspect;
  }
  
  cropper.setCoordinates({
    left: (boundaries.width - width) / 2,
    top: (boundaries.height - height) / 2,
    width,
    height
  });
};

// Watch for preset changes to maximize crop area
watch(selectedPreset, () => {
  setTimeout(maximizeCrop, 0);
});

// Watch for image changes to maximize crop area
watch(currentImage, () => {
  if (currentImage.value) {
    setTimeout(maximizeCrop, 0);
  }
});

onMounted(() => {
  updateContainerHeight();
  window.addEventListener('resize', updateContainerHeight);
  setTimeout(maximizeCrop, 0);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight);
});

const onCrop = ({ coordinates }: any) => {
  if (!currentImage.value) return;
  
  const crop = {
    id: crypto.randomUUID(),
    platform: selectedPreset.value.platform,
    type: selectedPreset.value.type,
    aspectRatio: selectedPreset.value.value,
    coordinates,
  };

  currentImage.value.crops = [
    ...currentImage.value.crops.filter(c => 
      c.platform !== selectedPreset.value.platform || 
      c.type !== selectedPreset.value.type
    ),
    crop
  ];
};
</script>

<template>
  <div v-if="currentImage" class="space-y-4">
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="px-4 py-2 rounded"
        :class="{
          'bg-blue-500 text-white': selectedPreset === preset,
          'bg-gray-200': selectedPreset !== preset
        }"
        @click="selectedPreset = preset"
      >
        {{ preset.name }}
      </button>
    </div>

    <div class="cropper-container" :style="{ height: containerHeight }">
      <Cropper
        ref="cropperRef"
        class="h-full"
        :src="currentImage.previewUrl"
        :stencil-props="{
          aspectRatio: selectedPreset.value
        }"
        :canvas="{
          maxWidth: '100%',
          maxHeight: '100%'
        }"
        @change="onCrop"
      />
    </div>
  </div>
  <div v-else class="text-center py-8 text-gray-500">
    No image selected
  </div>
</template>

<style scoped>
.cropper-container {
  min-height: 400px;
  max-height: 600px;
  width: 100%;
}
</style>