<template>
  <div class="change-detection-container">
    <div class="detection-canvas">
      <the-check-img ref="originImgRef" />
      <the-check-img ref="targetImgRef" />
    </div>
    <div class="detection-toolbar">
      <div class="toolbar-left-extension">
        <slot name="detection-toolbar-left-extension">折叠</slot>
      </div>
      <div class="toolbar">
        <button @click="zoomIn">放大</button>
        <button @click="zoomOut">缩小</button>
        <button @click="rotate">旋转</button>
        <button @click="zoomTo">100%比例</button>
        <button @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TheCheckImg from './components/TheCheckImg.vue'
import { ref } from 'vue'

const props = defineProps<{
  sourceUrl: { mainUrl: string; subUrl: string }[]
  boundingCoordinates?: {
    leftX: number
    leftY: number
    rightX: number
    rightY: number
    labelName: string
    labelColor: string
    labelType: string
  }[][]
}>()

const currentDetectionIndex = ref(0)

const _boundingCoordinates = ref(props.boundingCoordinates || [])

const originImgRef = ref<any>(null)
const targetImgRef = ref<any>(null)

/**
 * 放大焦距
 */

const zoomIn = () => {
  originImgRef.value?.zoom?.(0.1)
  targetImgRef.value?.zoom(0.1)
}

/**
 * 缩小焦距
 */
const zoomOut = () => {
  originImgRef.value?.zoom?.(-0.1)
  targetImgRef.value?.zoom?.(-0.1)
}

/**
 * 旋转
 */
const rotate = () => {
  originImgRef.value?.rotate?.(90)
  targetImgRef.value?.rotate(90)
}

/**
 * 100%比例
 */
const zoomTo = () => {
  originImgRef.value?.zoomTo?.(1)
  targetImgRef.value?.zoomTo(1)
}

/**
 * 重置
 */

const reset = () => {
  originImgRef.value?.reset?.()
  targetImgRef.value?.reset()
}
</script>

<style lang="scss" scoped>
.change-detection-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.detection-canvas {
  height: calc(100% - 65px);
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
}

.detection-toolbar {
  padding: 0 10px;
  position: relative;
  width: 100%;
  height: 65px;
  box-sizing: border-box;
}
.toolbar-left-extension {
  position: absolute;
  left: 0;
  top: 0;
}
.toolbar {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
