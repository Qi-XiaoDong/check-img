/**
 * 从元素的 computedStyle 中解析旋转角度（deg）
 * @param {HTMLElement} el 目标元素
 * @returns {number} 旋转角度（如 30、-45，无旋转则返回 0）
 */
export function getRotateAngleFromElement(el: HTMLElement) {
  const computedStyle = window.getComputedStyle(el)
  const transformValue = computedStyle.transform

  // 情况1：没有 transform 时返回 0
  if (transformValue === 'none') return 0

  // 情况2：解析矩阵（兼容 matrix/matrix3d）
  const matrix = new DOMMatrix(transformValue)

  // 从矩阵中计算旋转角度（基于三角函数）
  // atan2(matrix.b, matrix.a) 计算的是二维平面的旋转角度
  const angleRad = Math.atan2(matrix.b, matrix.a)
  const angleDeg = angleRad * (180 / Math.PI)

  // 处理负角度（如 -330deg 等价于 30deg），返回 0~360 范围内的角度
  return (angleDeg + 360) % 360
}
