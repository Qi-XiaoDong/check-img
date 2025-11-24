import { type Ref, ref, watch } from 'vue'
import Viewer from 'viewerjs'
import type { IDoodle } from './useFormatDoodleList'
/**
 * 在图片上创建div元素覆盖整个图片大小
 * @param viewerIns
 * @param imageIns
 */
export const useCreateDom = (data: {
  viewerIns: Ref<Viewer>
  imageIns: Ref<HTMLImageElement>
  photoWrapperRef: Ref<HTMLDivElement>
  doodleList: Ref<IDoodle[]>
  zoom: Ref<number>
}) => {
  const { viewerIns, imageIns, photoWrapperRef, doodleList, zoom } = data
  const doodleMaskElement = document.createElement('div')
  const doodleContainerElement = document.createElement('div')
  const doodleContainerWarpElement = document.createElement('div')
  const config = { attributes: true, childList: true, subtree: true }
  const observer = null

  // 当观察到变动时执行的回调函数
  const ObserverCallback = function (mutationsList: any, observer: any) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        adjustMaskElement(mutation.target)
        console.log(mutation)
      } else {
      }
    }
  }

  watch(
    imageIns,
    (img: any) => {
      if (img) {
        adjustMaskElement(img)
        // 创建一个观察器实例并传入回调函数
        const observer = new MutationObserver(ObserverCallback)
        // 以上述配置开始观察目标节点
        observer.observe(img, config)
      }
    },
    { immediate: true },
  )

  watch(
    photoWrapperRef,
    (wrapper) => {
      if (!wrapper) return
      doodleContainerElement.style.position = 'absolute'
      doodleContainerElement.classList.add('doodle-container')
      doodleContainerElement.appendChild(doodleContainerWarpElement)
      doodleContainerWarpElement.style.position = 'absolute'
      doodleContainerWarpElement.style.width = 100 + '%'
      doodleContainerWarpElement.style.height = 100 + '%'
      doodleContainerWarpElement.classList.add('doodle-container-warp')
      doodleMaskElement.style.position = 'absolute'
      doodleMaskElement.classList.add('doodle-mask')
      wrapper && wrapper.appendChild(doodleMaskElement)
      wrapper && wrapper.appendChild(doodleContainerElement)
    },
    { immediate: true },
  )

  watch(
    [doodleList, zoom],
    ([newDoodleList, zoomNum]) => {
      if (newDoodleList.length && zoomNum)
        newDoodleList.forEach((doodle) => {
          createDoodle(doodle)
        })
    },
    { immediate: true },
  )

  /**
   * 调整doodleMaskElement和doodleMaskElement
   */

  function adjustMaskElement(target: any) {
    const { height, width, marginLeft, marginTop, transform } = target.style
    doodleContainerElement.style.cssText = `
          position: absolute;
          margin-top: ${marginTop};
          margin-left: ${marginLeft};
          height: ${height};
          width: ${width};
          z-index: 2;
          transform: ${transform};
        `
    doodleMaskElement.style.cssText = `
         position: absolute;
          margin-top: ${marginTop};
          margin-left: ${marginLeft};
          height: ${height};
          width: ${width}
          z-index: 1;
          transform: ${transform};
        `
  }

  /**
   * 创建doodle
   * @param doodle
   */
  function createDoodle(doodle: IDoodle) {
    if (!doodle.dom) {
      const dom = document.createElement('div')
      doodleContainerWarpElement.appendChild(dom)
      doodle.dom = dom
    }
    adjustDoodle(doodle, zoom.value)
  }

  /**
   * image 放大/缩小
   */
  function adjustDoodle(doodle: IDoodle, zoom: number) {
    const { x, y, width, height, color } = doodle
    doodle.dom!.style.cssText = `
          position: absolute;
          margin-top: ${y * zoom}px;
          margin-left: ${x * zoom}px;
          width: ${width * zoom}px;
          height: ${height * zoom}px;
          border: 3px solid ${color};
        `
  }

  return {
    doodleContainerElement,
  }
}
