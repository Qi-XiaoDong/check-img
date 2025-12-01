import { readonly, type Ref, computed, watchEffect } from 'vue'
import type { TDrawType } from './useDrawCtrl'
import { v4 as uuidV4 } from 'uuid'
export interface IDoodle {
  id: string
  leftX: number
  leftY: number
  rightX: number
  rightY: number
  labelType: string
  labelColor: string
  labelName: string
  isNew?: boolean
}

export interface IFormatDoodle {
  id: string
  isNew?: boolean
  x1: number
  y1: number
  x2: number
  y2: number
  originX1: number
  originY1: number
  originX2: number
  originY2: number
  type: TDrawType
  color: string
  name: string
}
/**
 * 标绘数据管理
 * zoom 缩放比例
 * */
export const useFormatDoodleList = (zoom: Ref<number>, originDoodleList: Ref<IDoodle[]>) => {
  const doodleList = computed({
    get() {
      return originDoodleList.value.map((item) => {
        return {
          originX1: item.leftX,
          originX2: item.rightX,
          originY1: item.leftY,
          originY2: item.rightY,
          x1: item.leftX * zoom.value,
          y1: item.leftY * zoom.value,
          x2: item.rightX * zoom.value,
          y2: item.rightY * zoom.value,
          color: item.labelColor,
          name: item.labelName,
          type: item.labelType || 'rect',
          id: item.id,
          isNew: item.isNew,
        } as IFormatDoodle
      })
    },
    set(newDoodleList: IFormatDoodle[]) {
      originDoodleList.value = newDoodleList.map((doodle) => {
        return {
          id: doodle.id,
          leftX: doodle.originX1,
          leftY: doodle.originY1,
          rightX: doodle.originX2,
          rightY: doodle.originY2,
          labelColor: doodle.color,
          labelName: doodle.name,
          labelType: doodle.type,
          isNew: doodle.isNew,
        }
      })
    },
  })
  const setDoodleList = async (doodle: IFormatDoodle) => {
    const _doodle: IFormatDoodle = {
      id: doodle.id,
      x1: doodle.x1 / zoom.value,
      y1: doodle.y1 / zoom.value,
      x2: doodle.x2 / zoom.value,
      y2: doodle.y2 / zoom.value,
      originX1: doodle.x1 / zoom.value,
      originY1: doodle.y1 / zoom.value,
      originX2: doodle.x2 / zoom.value,
      originY2: doodle.y2 / zoom.value,
      color: doodle.color,
      name: doodle.name,
      type: doodle.type,
    }

    // 新增
    if (!_doodle.id) {
      // 请求Id
      doodle.id = uuidV4()
      doodleList.value = [...doodleList.value, { ..._doodle, isNew: true }]
    } else {
      const index = doodleList.value.findIndex((item) => item.id === doodle.id)!
      doodleList.value.splice(index, 1, { ...doodle })
    }

    return {
      ..._doodle,
      x1: _doodle.originX1 * zoom.value,
      y1: _doodle.originY1 * zoom.value,
      x2: _doodle.originX2 * zoom.value,
      y2: _doodle.originY2 * zoom.value,
    }
  }

  return {
    doodleList: readonly(doodleList),
    setDoodleList,
  }
}
