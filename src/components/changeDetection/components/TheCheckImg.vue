<template>
  <div
    ref="photoWrapperRef"
    class="photo-wrapper"
    style="flex: 1; height: 100%; border: 1px solid red"
  ></div>
</template>

<script setup lang="ts">
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import { onMounted, ref, watch } from 'vue'
import img1 from '@/assets/image/img1.jpg'

const viewerIns = ref<Viewer | null>(null)
// 触发器
const photoWrapperRef = ref<HTMLDivElement | null>(null)

let defaultZoom = 0

onMounted(() => {
  createViewer()
})

const isMovable = ref(true)

const createViewer = () => {
  const img = document.createElement('img')
  img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  img.alt = 'Hidden trigger for Viewer.js'
  img.style.display = 'none'
  photoWrapperRef.value!.appendChild(img)
  const OViewer = new Viewer(img!, {
    url: () => img1,
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
    viewed(e) {
      const image = e.detail.image
      const imageNaturalWidth = image.naturalWidth
      const imageNaturalHeight = image.naturalHeight
      defaultZoom = Math.min(
        photoWrapperRef.value!.clientWidth / imageNaturalWidth,
        photoWrapperRef.value!.clientHeight / imageNaturalHeight,
      )
      OViewer.zoomTo(defaultZoom)
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
    },
    // 在 Viewer 初始化的配置中
  })
  viewerIns.value = OViewer
}

const destroyViewer = () => {
  viewerIns.value?.destroy()
}

const zoom = (num: number) => {
  viewerIns.value?.zoom(num)
}

const rotate = (num: number) => {
  viewerIns.value?.rotate(num)
}

const zoomTo = (num: number) => {
  viewerIns.value?.zoomTo(num)
}

const reset = () => {
  // viewerIns.value?.rotateTo(0)

  viewerIns.value?.reset()
  viewerIns.value?.zoomTo(defaultZoom)
}

/**
 * 暴露给父组件的方法
 */

defineExpose({
  zoom,
  rotate,
  zoomTo,
  reset,
})
</script>

<style></style>
