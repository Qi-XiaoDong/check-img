import { ref, unref, type Ref } from 'vue'

/**
 *  图片事件处理
 * @param viewerIns
 * @returns
 */
export const useViewerEvent = (viewerIns: Ref<Viewer>) => {
  const defaultZoom = ref(0)
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
    viewerIns.value?.reset()
    viewerIns.value?.zoomTo(unref(defaultZoom))
  }

  return {
    defaultZoom,
    destroyViewer,
    zoom,
    rotate,
    zoomTo,
    reset,
  }
}
