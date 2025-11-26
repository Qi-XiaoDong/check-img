import { readonly, watchEffect, type Ref, computed } from 'vue'

export interface IDoodle {
  leftX: number
  leftY: number
  rightX: number
  rightY: number
  labelColor: string
  labelName: string
}

export interface IFormatDoodle {
  x1: number
  y1: number
  x2: number
  y2: number
  originX1: number
  originY1: number
  originX2: number
  originY2: number
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
        } as IFormatDoodle
      })
    },
    set(newDoodleList: IFormatDoodle[]) {
      originDoodleList.value = newDoodleList.map((doodle) => {
        return {
          leftX: doodle.originX1,
          leftY: doodle.originY1,
          rightX: doodle.originX2,
          rightY: doodle.originY2,
          labelColor: doodle.color,
          labelName: doodle.name,
        }
      })
    },
  })
  const setDoodleList = (doodle: IFormatDoodle) => {
    doodleList.value = [
      ...doodleList.value,
      {
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
      },
    ]
  }

  // watchEffect(() => {
  //   console.log(doodleList.value)
  // })

  return {
    doodleList: readonly(doodleList),
    setDoodleList,
  }
}
