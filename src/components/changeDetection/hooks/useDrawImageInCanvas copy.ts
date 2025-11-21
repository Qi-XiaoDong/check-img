import { ref, watch, type Ref } from 'vue'

/**
 * 监听图片src 以及canvas切换 将图片绘制到canvas中
 * @param canvas
 * @param imgSrc
 */
export const useDrawImageInCanvas = (canvasRef: Ref<HTMLCanvasElement>, imgSrc: Ref<string>) => {
  const imgRef = ref<HTMLImageElement | null>(null)

  const drawImageInCanvas = (canvas: HTMLCanvasElement, img: HTMLImageElement, zoom: number) => {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const imgW = img.width // 图片原始宽
    const imgH = img.height // 图片原始高
    const canvasW = canvas.width // Canvas 实际宽
    const canvasH = canvas.height // Canvas 实际高
    // 计算缩放比：取较小值，确保图片完整放入 Canvas
    const baseScale = Math.min(canvasW / imgW, canvasH / imgH)

    // 缩放比：取较大值，避免图片过小
    const scale = zoom < baseScale ? baseScale : zoom
    // 缩放后的图片尺寸（保持宽高比）
    const drawW = imgW * scale
    const drawH = imgH * scale
    console.log('缩放比：', scale, drawH, drawW, canvasH, canvasW)

    if (drawW > canvasW || drawH > canvasH) {
      console.log('图片尺寸超出 Canvas 尺寸')
      // 根据放大比例裁剪img
      // 计算图片起点坐标
      const sx = imgW / 2 - imgW / 4
      const sy = imgH / 2 - imgH / 4
      // 计算 img中绘制的宽度 /高度
      const sWidth = canvasW / scale
      const sHeight = canvasH / scale
      console.log('裁剪图片：', sx, sy, sWidth, sHeight)

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, drawW, drawH)
    } else {
      console.log('图片尺寸小于 Canvas 尺寸')
      // 居中绘制（避免图片贴左上角）
      const x = (canvasW - drawW) / 2 // 水平居中偏移
      const y = (canvasH - drawH) / 2 // 垂直居中偏移
      // 绘制：无截断、无拉伸、完整显示
      ctx.drawImage(img, x, y, drawW, drawH)
    }
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
      drawImageInCanvas(_canvas, _img, 0)
    },
    { immediate: true },
  )

  /**
   * 根据比例 放大/缩小图片
   * @param zoomNum
   */
  const zoomImage = (zoomNum: number) => drawImageInCanvas(canvasRef.value, imgRef.value!, zoomNum)

  return {
    zoomImage,
  }
}
