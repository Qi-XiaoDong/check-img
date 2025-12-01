import { createVNode, render, type VNode } from 'vue'
import checkEditStyle from './CheckEditStyle.vue'
import { v4 as uuidV4 } from 'uuid'
import type { IFormatDoodle } from '../hooks/useFormatDoodleList'
// 消息配置项（与组件Props对齐）
export interface checkEditStyleOptions {
  paletteList?: {
    color: string
  }[]
  top?: number
  left?: number
  doodle?: Partial<IFormatDoodle>
  appendContainerHtml: HTMLElement
  openBefore?: () => void
  closeBefore?: () => void
  allowMultiple?: boolean // 允许多个实例存在，false 则创建之前清空其他实例
}

const checkEditStyleInstances: Map<string, { node: VNode; clearNode: () => void }> = new Map()
class CheckStyle {
  constructor() {}

  open(options: checkEditStyleOptions): { close: () => void } {
    // 定义关闭回调（销毁实例 + 重新计算剩余消息的偏移）
    const onClose = () => {
      // 销毁组件
      render(null, container)
      // 删除容器
      container.remove()
      // 删除实例
      checkEditStyleInstances.delete(uuidV4())
    }
    // 创建Vue虚拟节点
    const {
      allowMultiple = true,
      appendContainerHtml: _appendContainerHtml,
      openBefore: onOpenBefore,
      closeBefore: onCloseBefore,
      ...resetOp
    } = options

    if (!allowMultiple) {
      // 销毁其他实例
      checkEditStyleInstances.forEach((item) => {
        console.log(item)
        item.clearNode()
      })
    }

    const vNode = createVNode(checkEditStyle, {
      ...resetOp,
      onOpenBefore,
      onCloseBefore,
      onClose,
    })

    // 创建挂载容器
    const container = document.createElement('div')
    // 渲染组件到容器
    render(vNode, container)
    // 将容器添加到body（teleport也可以，但这里兜底）
    const appendContainerHtml = _appendContainerHtml || document.body
    appendContainerHtml.appendChild(container.firstElementChild!)
    // 将实例存入数组
    checkEditStyleInstances.set(uuidV4(), {
      node: vNode,
      clearNode: () => {
        close()
      },
    })

    function close() {
      const component = vNode.component
      if (component) {
        // 调用组件内的close方法
        ;(component.exposed as { close: () => void })?.close?.()
      }
    }

    return {
      close,
    }
  }
}

export const checkStyle = new CheckStyle()
