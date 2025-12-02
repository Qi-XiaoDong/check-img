import { ref, unref, type Ref } from 'vue'
import { emitter } from '../core/mitt'
import Viewer from 'viewerjs'

/**
 *  图片事件处理
 * @param viewerIns
 * @returns
 */
export const useViewerEvent = (viewerIns: Ref<Viewer>) => {
    const defaultZoom = ref(0)

    // 变焦倍数
    const zoomNum = ref(1)

    const moveXY = ref({
        x: 0,
        y: 0
    })
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

    emitter.on('viewer-move', (payload) => {
        if (viewerIns.value === payload.viewerIns) return
        if (payload.moveData.x === moveXY.value.x && payload.moveData.y === moveXY.value.y) return
        viewerIns.value.moveTo(payload.moveData.x, payload.moveData.y)
    })

    emitter.on('viewer-zoom', (payload) => {
        if (viewerIns.value === payload.viewerIns) return
        if (zoomNum.value !== payload.zoomNum) viewerIns.value.zoomTo(payload.zoomNum)
    })

    return {
        defaultZoom,
        destroyViewer,
        zoom,
        rotate,
        zoomTo,
        reset,
        zoomNum,
        moveXY
    }
}
