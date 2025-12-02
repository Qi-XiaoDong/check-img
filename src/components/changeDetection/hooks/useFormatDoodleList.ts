import { computed, readonly, type Ref } from 'vue'

import { E_DrawType } from './useDrawCtrl'
import { emitter } from '@/components/changeDetection/core/mitt'

export interface IDoodle {
    id: string
    leftX: number
    leftY: number
    rightX: number
    rightY: number
    labelType: string
    labelColor: string
    labelName: string
}

export interface IFormatDoodle {
    id: string
    x1: number
    y1: number
    x2: number
    y2: number
    originX1: number
    originY1: number
    originX2: number
    originY2: number
    type: E_DrawType
    color: string
    name: string
}

/**
 * 标绘数据管理
 * zoom 缩放比例
 * */
export const useFormatDoodleList = (zoom: Ref<number>, viewerIns: Ref<Viewer>, originDoodleList: Ref<IDoodle[]>) => {
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
                    type: item.labelType || E_DrawType.rect,
                    id: item.id
                } as IFormatDoodle
            })
        },
        set(newDoodleList: IFormatDoodle[]) {
            originDoodleList.value = newDoodleList.map((doodle) => formatDoodle(doodle))
        }
    })
    const setDoodleList = (doodle: IFormatDoodle) => {
        return new Promise((resolve) => {
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
                name: doodle.name || (doodleList.value.length + 1).toString(),
                type: doodle.type
            }
            // 新增
            if (!_doodle.id) {
                emitter.emit('add-detect-target', {
                    viewerIns: viewerIns.value,
                    options: formatDoodle(_doodle),
                    callback: (id: string) => {
                        _doodle.id = id
                        doodleList.value = [...doodleList.value, { ..._doodle }]
                        resolve(_doodle.id)
                    }
                })
            } else {
                //TODO:暂时不用修改发送请求
                doodleList.value = doodleList.value.map((item) => (item.id === _doodle.id ? { ..._doodle } : item))
                resolve(_doodle.id)
            }
        })
    }

    const formatDoodle = (doodle: IFormatDoodle) => {
        return {
            id: doodle.id,
            leftX: doodle.originX1,
            leftY: doodle.originY1,
            rightX: doodle.originX2,
            rightY: doodle.originY2,
            labelColor: doodle.color,
            labelName: doodle.name,
            labelType: doodle.type
        }
    }
    return {
        doodleList: readonly(doodleList),
        setDoodleList
    }
}
