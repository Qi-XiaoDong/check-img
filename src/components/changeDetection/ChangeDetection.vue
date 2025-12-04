<template>
  <div class="change-detection-container">
    <div class="detection-canvas">
      <the-check-img
        v-if="!!sourceUrl"
        ref="originImgRef"
        :url="sourceUrl!.mainUrl"
        v-model:bounding-coordinates="boundingCoordinates"
      />
      <the-check-img
        v-if="!!sourceUrl"
        ref="targetImgRef"
        :url="sourceUrl!.subUrl"
        v-model:bounding-coordinates="boundingCoordinates"
      />
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
        <button @click="setDrawType(E_DrawType.rect)">矩形</button>
        <button @click="setDrawType(E_DrawType.line)">线</button>
        <!-- <button @click="setDrawType('point')">点</button> -->
        <button
          v-if="props.sourceUrl.length > 1"
          @click="currentDetectionIndex = ++currentDetectionIndex % props.sourceUrl.length"
        >
          下一张
        </button>
        <button @click="setAllowDraw">编辑</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TheCheckImg from './components/TheCheckImg.vue'
import { computed, ref } from 'vue'
import { E_DrawType } from './hooks/useDrawCtrl'

const props = withDefaults(
  defineProps<{
    sourceUrl?: { mainUrl: string; subUrl: string }[]
    boundingCoordinates?: {
      id: string
      leftX: number
      leftY: number
      rightX: number
      rightY: number
      labelName: string
      labelColor: string
      labelType: string
    }[][]
  }>(),
  {
    sourceUrl: () => [],
    boundingCoordinates: () => [],
  },
)

const emits = defineEmits<{
  (e: 'update:bounding-coordinates', val: any): void
}>()

const originImgRef = ref<InstanceType<typeof TheCheckImg> | null>(null)
const targetImgRef = ref<InstanceType<typeof TheCheckImg> | null>(null)
const currentDetectionIndex = ref(0)

const sourceUrl = computed(() => props.sourceUrl[currentDetectionIndex.value])
const boundingCoordinates = computed({
  get() {
    return props.boundingCoordinates[currentDetectionIndex.value] ?? []
  },
  set(val) {
    const data = props.boundingCoordinates
    data[currentDetectionIndex.value] = val
    emits('update:bounding-coordinates', data)
  },
})

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

const setDrawType = (type: E_DrawType) => {
  originImgRef.value?.setDrawType?.(type)
  targetImgRef.value?.setDrawType(type)
}

const setAllowDraw = () => {
  originImgRef.value?.changeAllowDraw()
  targetImgRef.value?.changeAllowDraw()
}

defineExpose({
  zoomIn,
  zoomOut,
  rotate,
  zoomTo,
  reset,
  setDrawType,
  setAllowDraw,
})
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
