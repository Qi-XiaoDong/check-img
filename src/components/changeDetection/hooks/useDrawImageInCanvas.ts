import { ref, watch, type Ref } from 'vue'

/**
 * 监听图片src 以及canvas切换 将图片绘制到canvas中
 * @param canvas
 * @param imgSrc
 */
export const useDrawImageInCanvas = (canvasRef: Ref<HTMLCanvasElement>, imgSrc: Ref<string>) => {
  const imgRef = ref<HTMLImageElement | null>(null)

  const drawImageInCanvas = (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const imgW = img.width // 图片原始宽
    const imgH = img.height // 图片原始高
    const canvasW = canvas.width // Canvas 实际宽
    const canvasH = canvas.height // Canvas 实际高
    // 计算缩放比：取较小值，确保图片完整放入 Canvas
    const scale = Math.min(canvasW / imgW, canvasH / imgH)

    // 缩放后的图片尺寸（保持宽高比）
    const drawW = imgW * scale
    const drawH = imgH * scale
    console.log('缩放比：', scale, drawH, drawW, canvasH, canvasW)
    // 居中绘制（避免图片贴左上角）
    const x = (canvasW - drawW) / 2 // 水平居中偏移
    const y = (canvasH - drawH) / 2 // 垂直居中偏移
    // 绘制：无截断、无拉伸、完整显示
    ctx.drawImage(img, x, y, drawW, drawH)
  }

  watch(
    imgSrc,
    (src) => {
      const OImg = new Image()
      OImg.onload = () => {
        imgRef.value = OImg
      }
      OImg.src = imgSrc.value
    },
    { immediate: true },
  )

  watch(
    [canvasRef, imgRef],
    ([_canvas, _img]) => {
      if (!_canvas || !_img) return
      drawImageInCanvas(_canvas, _img)
    },
    { immediate: true },
  )

  /**
   * 根据比例 放大/缩小图片
   * @param zoomNum
   */
  const zoomImage = (zoomNum: number) => {
    //我想通过ctx的 transform 控制画布缩放
    const ctx = canvasRef.value.getContext('2d')!
    ctx.transform(zoomNum, 0, 0, zoomNum, 0, 0)
    // ctx.translate(canvasRef.value.width / 2, canvasRef.value.height / 2)
    drawImageInCanvas(canvasRef.value, imgRef.value!)
  }

  return {
    zoomImage,
  }
}
