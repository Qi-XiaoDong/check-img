import { computed, readonly, ref, watchEffect } from 'vue'
export type TDrawType = 'rect' | 'point' | 'line'
export const useDrawCtrl = () => {
  // 是否处于编辑状态
  const isEdit = ref(false)
  // 是否允许绘制
  const _allowDraw = ref(false)

  const _initAllowDraw = ref(false)

  // 绘制图形的类别 矩形 线形 点
  const drawType = ref<TDrawType>('rect')

  // 是否允许viewer的操作
  const allViewerOp = computed(() => !(isEdit.value || _allowDraw.value))

  watchEffect(() => {
    if (isEdit.value) {
      // 处于编辑状态时 禁止绘制
      _allowDraw.value = false
    } else {
      // 退出编辑状态时 恢复绘制状态
      _allowDraw.value = _initAllowDraw.value
    }
  })

  return {
    setDrawType: (type: TDrawType) => (drawType.value = type),
    changeAllowDraw: () => {
      _initAllowDraw.value = !_allowDraw.value
      _allowDraw.value = !_allowDraw.value
    },
    allowDraw: readonly(_allowDraw),
    allViewerOp: readonly(allViewerOp),
    drawType: readonly(drawType),
    setIsEdit: (_isEdit: boolean) => (isEdit.value = _isEdit),
  }
}
