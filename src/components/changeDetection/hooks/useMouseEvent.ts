import { readonly, ref, watch } from 'vue'

export type TDrawType = 'rect' | 'point' | 'line'
/**
 * 鼠标绘制图形事件
 */
export const useMouseEvent = (data: { dom: any; setDoodleList: any }) => {
  const { dom, setDoodleList } = data

  let canvasDom: any = null

  let ctx: any = null

  // 绘制图形的类别 矩形 线形 点
  const drawType = ref<TDrawType>('rect')

  // 是否允许绘制
  const allowDraw = ref(false)

  let doodle = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    color: 'blue',
    type: drawType.value,
  }

  /**
   * 创建canvas用于画图
   */
  const createCanvas = (dom: any) => {
    const { transform } = dom.style

    // 计算dom的宽高
    const { height, width } = dom.getBoundingClientRect()
    canvasDom = document.createElement('canvas')
    ctx = canvasDom.getContext('2d')
    canvasDom.height = height
    canvasDom.width = width
    canvasDom.style.cssText = `
          position: absolute;
          z-index: 1;
          transform: ${transform};
        `
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
    createCanvas(dom)
    dom.style.cursor = 'crosshair'
    // 获取鼠标相对于 Canvas 的坐标
    const rect = canvasDom.getBoundingClientRect()
    doodle.x1 = e.clientX - rect.left
    doodle.y1 = e.clientY - rect.top
    doodle.x2 = doodle.x1
    doodle.y2 = doodle.y1
    doodle.type = drawType.value
    // 设置画笔样式
    ctx!.strokeStyle = 'blue' // 矩形边框颜色
    ctx!.lineWidth = 2 // 边框宽度

    if (drawType.value === 'point') {
      domMousePointDown()
      return
    }
    dom.addEventListener('mousemove', domMouseMove)
  }

  /**
   *鼠标抬起
   * @param e
   */
  function domMouseUp(e: any) {
    setDoodleList(doodle)
    deleteCanvas(dom)
    doodle = { x1: 0, y1: 0, x2: 0, y2: 0, color: 'blue', type: drawType.value }
    dom.style.cursor = 'default'
    dom.removeEventListener('mouseup', domMouseUp)
    dom.removeEventListener('mousemove', domMouseMove)
  }
  /**
   *鼠标移动
   * @param e
   */
  function domMouseMove(e: any) {
    if (drawType.value === 'rect') domMouseRectMove(e)
    if (drawType.value === 'line') domMouseLineMove(e)
  }

  /**
   * 鼠标移动 绘制矩形
   *
   * */
  function domMouseRectMove(e: any) {
    // 获取鼠标相对于 Canvas 的当前坐标
    const rect = canvasDom.getBoundingClientRect()
    doodle.x2 = e.clientX - rect.left
    doodle.y2 = e.clientY - rect.top

    // --- 关键步骤 ---
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
    const rect = canvasDom.getBoundingClientRect()
    doodle.x2 = e.clientX - rect.left
    doodle.y2 = e.clientY - rect.top
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height)

    ctx.beginPath()
    ctx.moveTo(doodle.x1, doodle.y1)
    ctx.lineTo(doodle.x2, doodle.y2)
    ctx.stroke()
  }

  return {
    setDrawType: (type: TDrawType) => (drawType.value = type),
    changeAllowDraw: () => (allowDraw.value = !allowDraw.value),
    allowDraw: readonly(allowDraw),
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
