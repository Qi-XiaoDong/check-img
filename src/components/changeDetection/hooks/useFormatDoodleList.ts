import { readonly, ref, watchEffect, type Ref } from 'vue'

export interface IDoodle {
  x: number
  y: number
  width: number
  height: number
  color: string
  name: string
  dom: HTMLDivElement | null
}
export const useFormatDoodleList = (zoom: Ref<number>) => {
  const doodleList = ref<IDoodle[]>([])

  const setDoodleList = (doodle: IDoodle) => {
    doodleList.value = [
      ...doodleList.value,
      {
        x: doodle.x / zoom.value,
        y: doodle.y / zoom.value,
        width: doodle.width / zoom.value,
        height: doodle.height / zoom.value,
        color: '#f00' || doodle.color,
        name: doodle.name,
        dom: null,
      },
    ]
  }

  watchEffect(() => {
    console.log(doodleList.value)
  })

  return {
    doodleList: readonly(doodleList),
    setDoodleList,
  }
}
