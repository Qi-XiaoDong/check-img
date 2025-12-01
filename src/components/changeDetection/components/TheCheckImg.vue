<template>
  <div
    ref="photoWrapperRef"
    class="photo-wrapper"
    :class="{ 'is-doodle': allViewerOp }"
    style="flex: 1; height: 100%; border: 1px solid red"
  />
</template>

<script setup lang="ts">
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useCreateDom } from '../hooks/useCreateDom'
import { useViewerEvent } from '../hooks/useViewerEvent'
import { useFormatDoodleList, type IDoodle } from '../hooks/useFormatDoodleList'
import { useMouseEvent } from '../hooks/useMouseEvent'
import { emitter } from '../core/mitt'
import { useDrawCtrl } from '../hooks/useDrawCtrl'
import { checkStyle } from './CheckEditStyle'

const props = defineProps<{
  url: string
  boundingCoordinates?: IDoodle[]
}>()

const emits = defineEmits<{
  (e: 'update:boundingCoordinates', data: any): void
}>()

const _boundingCoordinates = computed({
  get() {
    return props.boundingCoordinates
  },
  set(val) {
    emits('update:boundingCoordinates', val)
  },
})

const viewerIns = ref<Viewer | null>(null)

const imageIns = ref<HTMLImageElement | null>(null)

const isMovable = ref(true)

// 触发器
const photoWrapperRef = ref<HTMLDivElement | null>(null)

const { moveXY, zoomNum, defaultZoom, destroyViewer, zoom, rotate, zoomTo, reset } = useViewerEvent(
  viewerIns as any,
)

const { setDrawType, changeAllowDraw, allowDraw, drawType, allViewerOp, setIsEdit } = useDrawCtrl()

const { doodleList, setDoodleList } = useFormatDoodleList(
  zoomNum as any,
  _boundingCoordinates as any,
)

const { doodleContainerElement, doodleContainerWarpElement, clearDraWRenderElement } = useCreateDom(
  {
    imageIns: imageIns as any,
    viewerIns: viewerIns as any,
    photoWrapperRef: photoWrapperRef as any,
    doodleList: doodleList as any,
  },
)

useMouseEvent({
  dom: doodleContainerElement,
  setDoodleList,
  drawType: drawType,
  allowDraw: allowDraw,
})

/**
 * 打开编辑面板
 */
emitter.on('open-check-style', (data) => {
  const { doodle } = data.options
  checkStyle.open({
    doodle,
    appendContainerHtml: doodleContainerWarpElement,
    openBefore: () => setIsEdit(true),
    closeBefore: () => setIsEdit(false),
    allowMultiple: false,
  })
})

onMounted(() => {
  window.addEventListener('keydown', onCtrlKeyDown)
  window.addEventListener('keyup', onCtrlKeyUp)
  viewerIns.value = createViewer(props.url)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onCtrlKeyDown)
  window.removeEventListener('keyup', onCtrlKeyUp)
})

watch(
  () => props.url,
  (url) => {
    viewerIns.value = createViewer(url)
  },
)

function createViewer(url: string) {
  destroyViewer()
  clearDraWRenderElement()
  const img = document.createElement('img')
  img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  img.alt = 'Hidden trigger for Viewer.js'
  img.style.display = 'none'
  photoWrapperRef.value!.appendChild(img)
  const OViewer = new Viewer(img!, {
    url: () => url,
    inline: true, // 开启页面内直接交互模式
    zoomable: true,
    movable: isMovable.value,
    rotatable: true,
    scalable: true,
    toolbar: false,
    button: false,
    title: false,
    backdrop: false,
    navbar: false,
    // ready(e) {
    //   // Viewer 初始化完成后，覆盖 zoom 方法
    //   const originalZoom = OViewer.zoom // 保存原生 zoom 方法
    //   OViewer.zoom = function (percent, event) {
    //     // 1. 计算容器/图片的中心坐标
    //     const viewerEl = this.viewerElement // Viewer 容器元素
    //     const imageEl = this.imageData.element // 图片元素

    //     // 容器的几何中心（相对于视口）
    //     const rect = viewerEl.getBoundingClientRect()
    //     const centerX = rect.left + rect.width / 2
    //     const centerY = rect.top + rect.height / 2

    //     // 2. 构造伪造的事件对象，强制中心坐标
    //     const fakeEvent = {
    //       clientX: centerX,
    //       clientY: centerY,
    //       target: event?.target || imageEl, // 保留目标元素，避免报错
    //     }

    //     // 3. 调用原生 zoom 方法，传入中心坐标的事件
    //     return originalZoom.call(this, percent, fakeEvent)
    //   }
    // },
    viewed(e) {
      const image = e.detail.image
      imageIns.value = image
      const imageNaturalWidth = image.naturalWidth
      const imageNaturalHeight = image.naturalHeight
      const zoomNUm = Math.min(
        photoWrapperRef.value!.clientWidth / imageNaturalWidth,
        photoWrapperRef.value!.clientHeight / imageNaturalHeight,
      )
      OViewer.zoomTo(zoomNUm)
      defaultZoom.value = zoomNUm
    },
    // 核心：move 事件中通过 margin 限制边界
    move: (e: any) => {
      const viewerInstance = e.srcElement.viewer
      const imgElement = viewerInstance.image // 拿到实际显示的图片元素
      const container = photoWrapperRef.value!

      // 宽没有超出容器

      if (imgElement.offsetWidth < container.offsetWidth) {
        if (e.detail.x < e.detail.oldX && e.detail.x < 0) e.preventDefault()
        if (
          e.detail.x > e.detail.oldX &&
          e.detail.x > container.offsetWidth - imgElement.offsetWidth
        )
          e.preventDefault()
      }

      // 高没有超出容器
      if (imgElement.offsetHeight < container.offsetHeight) {
        if (e.detail.y < e.detail.oldY && e.detail.y < 0) e.preventDefault()
        if (
          e.detail.y > e.detail.oldY &&
          e.detail.y > container.offsetHeight - imgElement.offsetHeight
        )
          e.preventDefault()
      }

      // 宽超出了容器
      if (imgElement.offsetWidth > container.offsetWidth) {
        if (
          e.detail.x < e.detail.oldX &&
          e.detail.x < container.offsetWidth - imgElement.offsetWidth
        ) {
          e.preventDefault()
        }

        if (e.detail.x > e.detail.oldX && e.detail.x > 0) e.preventDefault()
      }

      // 高超出了容器
      if (imgElement.offsetHeight > container.offsetHeight) {
        if (
          e.detail.y < e.detail.oldY &&
          e.detail.y < container.offsetHeight - imgElement.offsetHeight
        ) {
          e.preventDefault()
        }

        if (e.detail.y > e.detail.oldY && e.detail.y > 0) e.preventDefault()
      }
      moveXY.value = {
        x: e.detail.x,
        y: e.detail.y,
      }
      emitter.emit('viewer-move', {
        viewerIns: viewerIns.value!,
        moveData: {
          x: e.detail.x,
          y: e.detail.y,
        },
      })
    },
    zoom: (e: any) => {
      zoomNum.value = e.detail.ratio
      emitter.emit('viewer-zoom', {
        viewerIns: viewerIns.value!,
        zoomNum: e.detail.ratio,
      })
    },
  })

  return OViewer
}

function onCtrlKeyDown(e: any) {
  if (['ShiftLeft', 'ShiftRight'].includes(e.code)) {
    photoWrapperRef.value?.classList.add('is-doodle')
  }
}

function onCtrlKeyUp(e: any) {
  if (['ShiftLeft', 'ShiftRight'].includes(e.code)) {
    photoWrapperRef.value?.classList.remove('is-doodle')
  }
}

/**
 * 暴露给父组件的方法
 */

defineExpose({
  zoom,
  rotate,
  zoomTo,
  reset,
  destroyViewer,
  setDrawType,
  changeAllowDraw,
})
</script>

<style>
.photo-wrapper {
  overflow: hidden;
}
.is-doodle .doodle-mask {
  display: none;
  pointer-events: none;
}
.is-doodle .doodle-container {
  pointer-events: none;
}
.is-doodle .doodle-container-warp {
  pointer-events: none;
}
.is-doodle .doodle-container .doodle-container-warp canvas {
  pointer-events: none;
}
</style>
