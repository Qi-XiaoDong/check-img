import { computed, readonly, ref, watchEffect } from 'vue'

export enum E_DrawType {
    point = '01',
    line = '02',
    rect = '03'
}

export const useDrawCtrl = () => {
    const paletteList = [
        {
            color: '#438FFF'
        },
        {
            color: '#1ABE6B'
        },
        {
            color: '#FFBB00'
        },
        {
            color: '#E23C39'
        },
        {
            color: '#B620E0'
        }
    ]

    const currentPaletteColor = ref(paletteList[3]!.color)
    // 是否处于编辑状态
    const isEdit = ref(false)
    // 是否允许绘制
    const _allowDraw = ref(false)

    const _initAllowDraw = ref(false)

    // 绘制图形的类别 矩形 线形 点
    const drawType = ref<E_DrawType>(E_DrawType.rect)

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
        setDrawType: (type: E_DrawType) => (drawType.value = type),
        changeAllowDraw: () => {
            _initAllowDraw.value = !_allowDraw.value
            _allowDraw.value = !_allowDraw.value
        },
        allowDraw: readonly(_allowDraw),
        allViewerOp: readonly(allViewerOp),
        drawType: readonly(drawType),
        paletteList,
        currentPaletteColor: readonly(currentPaletteColor)
    }
}
