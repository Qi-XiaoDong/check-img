import { type Ref, ref, watch } from 'vue'
import Viewer from 'viewerjs'
import type { IFormatDoodle } from './useFormatDoodleList'
/**
 * 在图片上元素
 * @param viewerIns
 * @param imageIns
 */
export const useCreateDom = (data: {
  viewerIns: Ref<Viewer>
  imageIns: Ref<HTMLImageElement>
  photoWrapperRef: Ref<HTMLDivElement>
  doodleList: Ref<IFormatDoodle[]>
}) => {
  const { viewerIns, imageIns, photoWrapperRef, doodleList } = data
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
    doodleList,
    (newDoodleList) => {
      if (newDoodleList.length)
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
  function createDoodle(doodle: IFormatDoodle) {
    const selectorString = `div[data-x1='${doodle.originX1}'][data-y1='${doodle.originY1}']`
    let dom = doodleContainerWarpElement.querySelector(selectorString) as HTMLDivElement
    if (!dom) {
      dom = document.createElement('div')
      dom.setAttribute('data-x1', doodle.originX1.toString())
      dom.setAttribute('data-y1', doodle.originY1.toString())
      doodleContainerWarpElement.appendChild(dom)
    }
    adjustDoodle(doodle, dom)
  }

  /**
   * image 放大/缩小
   */
  function adjustDoodle(doodle: IFormatDoodle, dom: HTMLDivElement) {
    const { x1, y1, x2, y2, color, type } = doodle
    const minY = Math.min(y1, y2)
    const minX = Math.min(x1, x2)
    const maxY = Math.max(y1, y2)
    const maxX = Math.max(x1, x2)
    if (type === 'rect') {
      const width = Math.abs(x2 - x1)
      const height = Math.abs(y2 - y1)
      dom!.style.cssText = `
          position: absolute;
          margin-top: ${minY}px;
          margin-left: ${minX}px;
          width: ${width}px;
          height: ${height}px;
          border: 3px solid ${color};
        `
    }

    if (type === 'line') {
      let width = 0
      if (x1 === x2) width = Math.abs(y1 - y2)
      if (y1 === y2) width = Math.abs(x1 - x2)
      else {
        width = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
      }

      let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
      if (angle < 0) angle += 360

      dom!.style.cssText = `
          position: absolute;
          margin-top: ${y1}px;
          margin-left: ${x1}px;
          width: ${width}px;
          height: 3px;
          transform: rotate(${angle}deg);
          transform-origin: left top;
          background: ${color};
        `
    }

    // if (type === 'point') {
    //   dom!.style.cssText = `
    //       position: absolute;
    //       margin-top: ${y1}px;
    //       margin-left: ${x1}px;
    //       transform: translate(-50%, -50%) rotate(45deg);
    //       width: 10px;
    //       height: 10px;
    //       background: transparent;
    //       border: 3px solid ${color};
    //       clipPath: clipPath

    //     `
    // }
  }

  /**
   * 清空绘制元素
   */
  function clearDraWRenderElement() {
    doodleContainerWarpElement.innerHTML = ''
  }

  return {
    doodleContainerElement,
    clearDraWRenderElement,
  }
}
