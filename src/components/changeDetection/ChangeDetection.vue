<template>
  <div class="change-detection-container">
    <div class="detection-canvas">
      <the-check-img
        ref="originImgRef"
        :url="sourceUrl!.mainUrl"
        v-model:bounding-coordinates="boundingCoordinates"
      />
      <the-check-img
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
        <button @click="setDrawType('rect')">矩形</button>
        <button @click="setDrawType('line')">线</button>
        <!-- <button @click="setDrawType('point')">点</button> -->
        <button @click="currentDetectionIndex = ++currentDetectionIndex % 3">下一张</button>
        <button @click="setAllowDraw">编辑</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TheCheckImg from './components/TheCheckImg.vue'
import { computed, ref } from 'vue'
import checkImg from '@/assets/image/check.png?url'

// const props = defineProps<{
//   sourceUrl: { mainUrl: string; subUrl: string }[]
//   boundingCoordinates?: {
//     leftX: number
//     leftY: number
//     rightX: number
//     rightY: number
//     labelName: string
//     labelColor: string
//     labelType: string
//   }[][]
// }>()

const currentDetectionIndex = ref(0)

const _boundingCoordinates = ref([
  [
    {
      leftX: 200,
      leftY: 200,
      rightX: 500,
      rightY: 500,
      labelName: '',
      labelColor: 'red',
      labelType: '',
    },
    {
      leftX: 0,
      leftY: 0,
      rightX: 100,
      rightY: 100,
      labelName: '',
      labelColor: 'yellow',
      labelType: '',
    },
  ],
  [
    {
      leftX: 500,
      leftY: 500,
      rightX: 600,
      rightY: 600,
      labelName: '',
      labelColor: 'red',
      labelType: '',
    },
  ],
  [
    {
      leftX: 500,
      leftY: 500,
      rightX: 600,
      rightY: 600,
      labelName: '',
      labelColor: 'red',
      labelType: '',
    },
  ],
])

const _sourceUrl = ref([
  {
    mainUrl: 'https://cn.bing.com/th?id=OHR.GwailorFort_ZH-CN6731607002_UHD.jpg&pid=hp&w=1920',
    subUrl: 'https://cn.bing.com/th?id=OHR.GwailorFort_ZH-CN6731607002_UHD.jpg&pid=hp&w=1920',
  },
  {
    mainUrl: 'https://cn.bing.com/th?id=OHR.OliveGrove_ZH-CN7054006944_UHD.jpg&pid=hp&w=1920',
    subUrl: 'https://cn.bing.com/th?id=OHR.OliveGrove_ZH-CN7054006944_UHD.jpg&pid=hp&w=1920',
  },
  {
    mainUrl: 'https://cn.bing.com/th?id=OHR.TreviFountain_ZH-CN6892299520_UHD.jpg&pid=hp&w=1920',
    subUrl: 'https://cn.bing.com/th?id=OHR.TreviFountain_ZH-CN6892299520_UHD.jpg&pid=hp&w=1920',
  },
])

const sourceUrl = computed(() => _sourceUrl.value[currentDetectionIndex.value])
const boundingCoordinates = computed({
  get() {
    return _boundingCoordinates.value[currentDetectionIndex.value]
  },
  set(val) {
    ;(_boundingCoordinates.value[currentDetectionIndex.value] as any) = val
  },
})

const originImgRef = ref<InstanceType<typeof TheCheckImg> | null>(null)
const targetImgRef = ref<InstanceType<typeof TheCheckImg> | null>(null)

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

const setDrawType = (type: 'rect' | 'point' | 'line') => {
  originImgRef.value?.setDrawType?.(type)
  targetImgRef.value?.setDrawType(type)
}

const setAllowDraw = () => {
  originImgRef.value?.changeAllowDraw()
  targetImgRef.value?.changeAllowDraw()
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
