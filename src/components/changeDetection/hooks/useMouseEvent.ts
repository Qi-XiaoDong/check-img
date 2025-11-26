import { ref } from 'vue'

/**
 * 鼠标绘制图形事件
 */
export const useMouseEvent = (data: { dom: any; setDoodleList: any }) => {
  const { dom, setDoodleList } = data

  let doodle = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    color: 'blue',
  }

  let canvasDom: any = null

  let ctx: any = null

  // 绘制图形的类别 矩形 线形 点
  const drawType = ref<'rect' | 'point' | 'line'>('rect')
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

  //给doodleContainerElement 绑定鼠标按下  移动 抬起事件, 记录按下坐标 移动x，y
  dom.addEventListener('mousedown', domMouseDown)

  /**
   * 鼠标按下
   * @param e
   */
  function domMouseDown(e: any) {
    createCanvas(dom)
    dom.style.cursor = 'crosshair'
    // 获取鼠标相对于 Canvas 的坐标
    const rect = canvasDom.getBoundingClientRect()
    doodle.x1 = e.clientX - rect.left
    doodle.y1 = e.clientY - rect.top
    doodle.x2 = doodle.x1
    doodle.y2 = doodle.y1

    // 设置画笔样式
    ctx!.strokeStyle = 'blue' // 矩形边框颜色
    ctx!.lineWidth = 2 // 边框宽度
    dom.addEventListener('mouseup', domMouseUp)
    dom.addEventListener('mousemove', domMouseMove)
  }

  /**
   *鼠标抬起
   * @param e
   */
  function domMouseUp(e: any) {
    setDoodleList(doodle)
    deleteCanvas(dom)
    doodle = { x1: 0, y1: 0, x2: 0, y2: 0, color: 'blue' }
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
    setDrawType: (type: 'rect' | 'point' | 'line') => (drawType.value = type),
  }
}
