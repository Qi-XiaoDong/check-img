<template>
  <div ref="parentRef" class="check-canvas-container">
    <canvas ref="canvasRef" class="check-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRef, watch } from 'vue'
import { useDrawImageInCanvas } from '../hooks/useDrawImageInCanvas'

const props = withDefaults(
  defineProps<{
    labelType?: string
    zoomNum?: number
    rotationAngle?: number
    url: string
    boundingCoordinates?: {
      leftX: number
      leftY: number
      rightX: number
      rightY: number
      labelName: string
      labelColor: string
      labelType: string
    }[]
  }>(),
  {
    zoomNum: 0,
    rotationAngle: 0,
  },
)

const parentRef = ref<HTMLDivElement | null>(null)

const canvasRef = ref<HTMLCanvasElement | null>(null)

const { zoomImage } = useDrawImageInCanvas(canvasRef as any, toRef(props, 'url'))

watch(
  () => props.zoomNum,
  (_zoomNumber) => {
    zoomImage(_zoomNumber)
  },
)

onMounted(() => {
  const parent = parentRef.value!
  canvasRef.value!.width = parent.clientWidth
  canvasRef.value!.height = parent.clientHeight
})
</script>

<style scoped lang="scss">
.check-canvas-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}
.check-canvas {
  width: 100%;
  height: 100%;
}
</style>
