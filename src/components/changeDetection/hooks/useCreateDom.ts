import { type Ref, watch } from 'vue'
import Viewer from 'viewerjs'
import type { IFormatDoodle } from './useFormatDoodleList'
import { emitter } from '../core/mitt'
import { E_DrawType } from '@/components/changeDetection/hooks/useDrawCtrl'
import { getRotateAngleFromElement } from '../core/getRotateAngleFromElement'

/**
 * 在图片上元素
 * @param data
 */
export const useCreateDom = (data: {
  viewerIns: Ref<Viewer>
  imageIns: Ref<HTMLImageElement>
  photoWrapperRef: Ref<HTMLDivElement>
  doodleList: Ref<IFormatDoodle[]>
}) => {
  InjectStyle()
  const { viewerIns, imageIns, photoWrapperRef, doodleList } = data
  const doodleMaskElement = document.createElement('div')
  const doodleContainerElement = document.createElement('div')
  const doodleContainerWarpElement = document.createElement('div')
  const config = { attributes: true, childList: true, subtree: true }
  const observer = null

  // 当观察到变动时执行的回调函数
  const ObserverCallback = function (mutationsList: any, observer: any) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        adjustMaskElement(mutation.target)
      } else {
        //
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
    adjustTextWarpPos()
  }

  function adjustTextWarpPos() {
    const angle = getRotateAngleFromElement(doodleContainerElement)
    const textWrapperElementList = doodleContainerWarpElement.querySelectorAll('.text-wrapper')
    textWrapperElementList.forEach((textWarpItem: any) => {
      const { width } = textWarpItem.getBoundingClientRect()
      let top = '100%'
      let left = '0px'
      if (angle === 90) {
        left = -width + 'px'
      }
      if (angle === 180) {
        top = `0px`
        left = '100%'
      }
      if (angle === 270) {
        top = '0px'
      }
      textWarpItem.style.transform = `rotate(${-angle}deg)`
      textWarpItem.style.top = top
      textWarpItem.style.left = left
    })
  }

  /**
   * 创建doodle
   * @param doodle
   */
  function createDoodle(doodle: IFormatDoodle) {
    const selectorString = `div[data-x1='${doodle.originX1}'][data-y1='${doodle.originY1}']`
    let dom = doodleContainerWarpElement.querySelector(selectorString) as HTMLDivElement
    if (doodle.type === E_DrawType.rect) dom = createRect(doodle, dom)
    if (doodle.type === E_DrawType.line) dom = createLine(doodle, dom)
    adjustDoodle(doodle, dom)
    adjustTextWarpPos()
  }

  /**
   * image 放大/缩小
   */
  function adjustDoodle(doodle: IFormatDoodle, dom: HTMLDivElement) {
    if (doodle.type === E_DrawType.rect) adjustRect(doodle, dom)
    if (doodle.type === E_DrawType.line) adjustLine(doodle, dom)
  }

  /**
   * 绘制矩形
   * @param doodle
   * @param _dom
   * @returns
   */
  function createRect(doodle: IFormatDoodle, _dom: HTMLDivElement) {
    if (_dom) {
      _dom.getElementsByClassName('text')[0]!.innerHTML = doodle.name
      return _dom
    }
    const dom = document.createElement('div')
    dom.setAttribute('data-x1', doodle.originX1.toString())
    dom.setAttribute('data-y1', doodle.originY1.toString())
    dom.setAttribute('data-id', doodle.id?.toString()!)

    dom.innerHTML = `
              <div class="rect-top rect-item" data-child="true" data-type="top"></div>
              <div class="rect-right rect-item" data-child="true" data-type="right"></div>
              <div class="rect-bottom rect-item" data-child="true" data-type="bottom"></div>
              <div class="rect-left rect-item" data-child="true" data-type="left"></div>
              <div class="text-wrapper" data-child="true">
                <div class="text" data-child="true">${doodle.name}</div>
              </div>
         `
    doodleContainerWarpElement.appendChild(dom)

    dom.addEventListener('click', function (event) {
      // 阻止冒泡
      event.stopPropagation()
      const target = event.target as HTMLDivElement
      if (target.dataset.child === 'true') {
        emitter.emit('open-check-style', {
          viewerIns: viewerIns.value,
          options: { doodleId: doodle.id },
        })
      }
    })
    dom.addEventListener('mouseover', function (event) {
      event.stopPropagation()
      const target = event.target as HTMLDivElement
      if (target.dataset.child === 'true') {
        dom.classList.add('is-hover')
      }
    })

    dom.addEventListener('mouseout', function (event) {
      dom.classList.remove('is-hover')
    })
    return dom
  }

  /**
   *调整矩形
   * @param doodle
   * @param dom
   */
  function adjustRect(doodle: IFormatDoodle, dom: HTMLDivElement) {
    const { x1, y1, x2, y2 } = doodle
    const minY = Math.min(y1, y2)
    const minX = Math.min(x1, x2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)
    dom!.style.cssText = `
        position: absolute;
        top: ${minY}px;
        left: ${minX}px;
        width: ${width}px;
        height: ${height}px;
        z-index: 99;
        background-color: transparent;
        --bg-color: ${doodle.color};
      `
  }

  /**
   * 绘制线
   * @param doodle
   * @param _dom
   * @returns
   */

  function createLine(doodle: IFormatDoodle, _dom: HTMLDivElement) {
    if (_dom) {
      return _dom
    }
    const dom = document.createElement('div')
    dom.setAttribute('data-x1', doodle.originX1.toString())
    dom.setAttribute('data-y1', doodle.originY1.toString())
    dom.setAttribute('data-id', doodle.id?.toString()!)

    doodleContainerWarpElement.appendChild(dom)
    return dom
  }

  /**
   * 调整线
   * @param doodle
   * @param dom
   */
  function adjustLine(doodle: IFormatDoodle, dom: HTMLDivElement) {
    const { x1, y1, x2, y2, color, type } = doodle
    console.log(doodle, 'doodle')
    const minY = Math.min(y1, y2)
    const minX = Math.min(x1, x2)
    const maxY = Math.max(y1, y2)
    const maxX = Math.max(x1, x2)
    let width = 0
    if (x1 === x2) width = Math.abs(y1 - y2)
    if (y1 === y2) width = Math.abs(x1 - x2)
    else {
      width = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2))
    }
    let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
    if (angle < 0) angle += 360
    dom!.style.cssText = `
      position: absolute;
      top: ${y1}px;
      left: ${x1}px;
      width: ${width}px;
      height: 3px;
      transform: rotate(${angle}deg);
      transform-origin: left top;
      background: ${color};
        z-index: 99;
    `
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
    doodleContainerWarpElement,
  }
}

const InjectStyle = () => {
  const isHoverStyle = `
  .is-hover {
    border: 2px solid #fff;
  }
  `

  const textWrapperStyle = `
  .text-wrapper {
    position: absolute;
    top: 100%;
    max-width: 100%;
    left: 0;
    font-weight: bold;
    cursor: pointer;
    color:#000;
    pointer-events: auto;
    transform-origin: left top;
     -webkit-text-stroke: 1px #fff;
  }
  `

  const rectItemStyle = `
  .rect-item {
    position: absolute;
    background: var(--bg-color);
    cursor: pointer;
    pointer-events: auto;
  }
  .rect-item::after {
    content: ' ';
    position: absolute;
    width:calc(100% - 8px);
    height:calc(100% - 8px);

  }
  `
  const rectLeftStyle = `
  .rect-left {
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
  }
  .is-hover .rect-left::after {
    left: 3px;
    top:50%;
    transform: translateY(-50%);
    border-right: 2px solid #fff;
  }
  `
  const rectRightStyle = `
  .rect-right {
    top: 0;
    right: 0;
    width:3px;
    height: 100%;

  }
  .is-hover .rect-right::after {
    right: 3px;
    top:50%;
    transform: translateY(-50%);
    border-left: 2px solid #fff;
  }
  `
  const rectTopStyle = `
  .rect-top {
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    cursor: pointer;

  }
  .is-hover .rect-top::after {
    left: 50%;
    top:3px;
    transform: translateX(-50%);
    border-bottom: 2px solid #fff;
  }
  `
  const rectBottomStyle = `
  .rect-bottom {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
  }
  .is-hover .rect-bottom::after {
    left: 50%;
    bottom:3px;
    transform: translateX(-50%);
    border-top:2px solid #fff;
  }
  `
  // 1. 创建 style 元素
  const style = document.createElement('style')

  // 2. 写入要添加的样式（支持多行字符串）
  style.textContent = `
    ${isHoverStyle}
    ${rectItemStyle}
    ${rectLeftStyle}
    ${rectRightStyle}
    ${rectTopStyle}
    ${rectBottomStyle}
    ${textWrapperStyle}
  `

  // 3. 将 style 标签插入到 header 中（末尾位置）
  document.querySelector('head')!.appendChild(style)
}
