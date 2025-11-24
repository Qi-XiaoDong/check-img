import { useCreateDom } from './useCreateDom'
/**
 * 鼠标事件
 */
export const useMouseEvent = (data: { dom: any; setDoodleList: any }) => {
  const { dom, setDoodleList } = data
  let doodle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: 'blue',
  }

  let canvasDom: any = null

  let ctx: any = null

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

  const deleteCanvas = (dom: any) => {
    dom.removeChild(canvasDom)
    ctx = null
    canvasDom = null
  }

  const domMouseMove = (e: any) => {
    // 获取鼠标相对于 Canvas 的当前坐标
    const rect = canvasDom.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    // --- 关键步骤 ---
    // a. 清除整个画布，以擦除上一帧绘制的矩形
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height)

    // b. 开始绘制新的矩形
    ctx.beginPath()

    // 计算矩形的宽和高
    doodle.width = Math.abs(currentX - doodle.x)
    doodle.height = Math.abs(currentY - doodle.y)

    ctx.rect(doodle.x, doodle.y, doodle.width, doodle.height)

    // c. 描边矩形
    ctx.stroke()
  }
  const domMouseUp = (e: any) => {
    setDoodleList(doodle)
    deleteCanvas(dom)
    doodle = { x: 0, y: 0, width: 0, height: 0, color: 'blue' }
    dom.style.cursor = 'default'
    dom.removeEventListener('mouseup', domMouseUp)
    dom.removeEventListener('mousemove', domMouseMove)
  }
  const domMouseDown = (e: any) => {
    createCanvas(dom)
    dom.style.cursor = 'crosshair'
    // 获取鼠标相对于 Canvas 的坐标
    const rect = canvasDom.getBoundingClientRect()
    doodle.x = e.clientX - rect.left
    doodle.y = e.clientY - rect.top

    // 设置画笔样式
    ctx!.strokeStyle = 'blue' // 矩形边框颜色
    ctx!.lineWidth = 2 // 边框宽度
    dom.addEventListener('mouseup', domMouseUp)
    dom.addEventListener('mousemove', domMouseMove)
  }

  //给doodleContainerElement 绑定鼠标按下  移动 抬起事件, 记录按下坐标 移动x，y
  dom.addEventListener('mousedown', domMouseDown)
}
