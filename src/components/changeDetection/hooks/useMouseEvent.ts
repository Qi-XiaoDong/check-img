import { type Ref, watch } from 'vue'
import { emitter } from '../core/mitt'
import { E_DrawType } from './useDrawCtrl'
import { getRotateAngleFromElement } from '../core/getRotateAngleFromElement'

/**
 * 鼠标绘制图形事件
 */
export const useMouseEvent = (data: {
  dom: any
  setDoodleList: any
  drawType: Ref<E_DrawType>
  allowDraw: Ref<boolean>
  viewerIns: Ref<Viewer>
  paletteColor: Ref<string>
}) => {
  const { dom, setDoodleList, drawType, allowDraw, viewerIns, paletteColor } = data

  let canvasDom: any = null

  let ctx: any = null

  // canvas 旋转角度
  let angle = 0

  let doodle = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    color: paletteColor.value,
    type: drawType.value,
  }

  /**
   * 根据旋转角度doodle的值
   */
  const setDoodleByAngle = async (e: any, type: 'down' | 'move') => {
    const rect = canvasDom.getBoundingClientRect()
    if (type === 'down') {
      if (angle === 0) {
        doodle.x1 = e.clientX - rect.left
        doodle.y1 = e.clientY - rect.top
      }
      if (angle === 90) {
        doodle.x1 = e.clientY - rect.top
        doodle.y1 = rect.right - e.clientX
      }
      if (angle === 180) {
        doodle.x1 = rect.right - e.clientX
        doodle.y1 = rect.bottom - e.clientY
      }
      if (angle === 270) {
        doodle.x1 = rect.bottom - e.clientY
        doodle.y1 = e.clientX - rect.left
      }
      doodle.x2 = doodle.x1
      doodle.y2 = doodle.y1
    }
    if (type === 'move') {
      if (angle === 0) {
        doodle.x2 = e.clientX - rect.left
        doodle.y2 = e.clientY - rect.top
      }
      if (angle === 90) {
        doodle.x2 = e.clientY - rect.top
        doodle.y2 = rect.right - e.clientX
      }
      if (angle === 180) {
        doodle.x2 = rect.right - e.clientX
        doodle.y2 = rect.bottom - e.clientY
      }
      if (angle === 270) {
        doodle.x2 = rect.bottom - e.clientY
        doodle.y2 = e.clientX - rect.left
      }
    }
  }

  /**
   * 设置canvas宽高
   * @param canvasDom
   */
  const setCanvasByAngle = (canvasDom: any) => {
    const { height, width } = dom.getBoundingClientRect()
    angle = getRotateAngleFromElement(dom)
    if (angle === 0 || angle === 180) {
      canvasDom.width = width
      canvasDom.height = height
    } else {
      canvasDom.width = height
      canvasDom.height = width
    }
  }

  /**
   * 创建canvas用于画图
   */
  const createCanvas = (dom: any) => {
    canvasDom = document.createElement('canvas')
    canvasDom.style.cssText = `
          position: absolute;
          z-index: 1;
        `
    ctx = canvasDom.getContext('2d')
    setCanvasByAngle(canvasDom)
    dom.appendChild(canvasDom)
  }

  /**
   * 删除canvasDOM
   * @param dom
   */
  const deleteCanvas = (dom: any) => {
    dom.removeChild(canvasDom)
    ctx = null
    canvasDom = null
  }

  watch(
    allowDraw,
    (isAllow) => {
      if (isAllow) {
        dom.addEventListener('mousedown', domMouseDown)
      } else {
        dom.removeEventListener('mousedown', domMouseDown)
      }
    },
    { immediate: true },
  )

  /**
   * 鼠标按下
   * @param e
   */
  function domMouseDown(e: any) {
    dom.addEventListener('mouseup', domMouseUp)
    dom.style.cursor = 'crosshair'
    createCanvas(dom)
    setDoodleByAngle(e, 'down')
    doodle.type = drawType.value
    // 设置画笔样式
    ctx!.strokeStyle = paletteColor.value // 矩形边框颜色
    ctx!.lineWidth = 2 // 边框宽度

    if (drawType.value === E_DrawType.point) {
      domMousePointDown()
      return
    }
    dom.addEventListener('mousemove', domMouseMove)
  }

  /**
   *鼠标抬起
   * @param e
   */
  async function domMouseUp(e: any) {
    dom.removeEventListener('mouseup', domMouseUp)
    dom.removeEventListener('mousemove', domMouseMove)
    deleteCanvas(dom)
    dom.style.cursor = 'default'
    if (Math.abs(doodle.x1 - doodle.x2) < 10 && Math.abs(doodle.y1 - doodle.y2) < 10) {
      //
    } else {
      const id = await setDoodleList(doodle)
      emitter.emit('open-check-style', {
        viewerIns: viewerIns.value,
        options: { doodleId: id },
      })
      doodle = { x1: 0, y1: 0, x2: 0, y2: 0, color: paletteColor.value, type: drawType.value }
    }
  }

  /**
   *鼠标移动
   * @param e
   */
  function domMouseMove(e: any) {
    if (drawType.value === E_DrawType.rect) domMouseRectMove(e)
    if (drawType.value === E_DrawType.line) domMouseLineMove(e)
  }

  /**
   * 鼠标移动 绘制矩形
   *
   * */
  function domMouseRectMove(e: any) {
    setDoodleByAngle(e, 'move')

    // a. 清除整个画布，以擦除上一帧绘制的矩形
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height)

    // b. 开始绘制新的矩形
    ctx.beginPath()

    // 计算矩形的宽和高
    const width = Math.abs(doodle.x2 - doodle.x1)
    const height = Math.abs(doodle.y2 - doodle.y1)

    const startX = Math.min(doodle.x1, doodle.x2)
    const startY = Math.min(doodle.y1, doodle.y2)

    ctx.rect(startX, startY, width, height)

    // c. 描边矩形
    ctx.stroke()
  }

  /**
   * 鼠标移动绘制线
   */
  function domMouseLineMove(e: MouseEvent) {
    // 获取鼠标相对于 Canvas 的当前坐标
    setDoodleByAngle(e, 'move')
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height)

    ctx.beginPath()
    ctx.moveTo(doodle.x1, doodle.y1)
    ctx.lineTo(doodle.x2, doodle.y2)
    ctx.stroke()
  }

  /**
   * 鼠标移动绘制菱形
   */

  function domMousePointDown() {
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height)
    ctx.beginPath()

    // 以doodle.x1, doodle.y1为中心 画一个菱形
    // 开始路径
    ctx.beginPath()
    // 1. 上顶点：x不变，y - halfHeight
    ctx.moveTo(doodle.x1, doodle.y1 - 20)
    // 2. 右顶点：x + halfWidth，y不变
    ctx.lineTo(doodle.x1 + 10, doodle.y1)
    // 3. 下顶点：x不变，y + halfHeight
    ctx.lineTo(doodle.x1, doodle.y1 + 20)
    // 4. 左顶点：x - halfWidth，y不变
    ctx.lineTo(doodle.x1 - 10, doodle.y1)
    // 闭合路径（回到上顶点）
    ctx.closePath()
    ctx.stroke() // 描边
  }
}
