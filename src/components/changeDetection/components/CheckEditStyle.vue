<template>
  <div ref="styleContainerRef" class="check-style-container">
    <div class="input-wrapper">
      <input
        id="inputValue"
        :value="inputValue"
        placeholder="请输入标签，按回车确认"
        @input="handlerInput"
        @keydown.enter="handlerOk"
        @click.stop
      />
      <div class="style-tools">
        <i class="iconfont icon-check" @click="handlerOk" />
        <i class="iconfont icon-quxiao" @click="handlerCancel" />
        <i class="iconfont icon-shanchu" @click="handlerDelete" />
        <i class="iconfont icon-tiaosepan" @click="paletteShow = !paletteShow" />
      </div>
    </div>
    <div v-show="paletteShow" class="style-palette">
      <div
        v-for="item in paletteList"
        :key="item.color"
        :class="{ active: item.color === _selectPaletteColor }"
        :style="{
          background: item.color,
        }"
        class="palette-item"
        @click="() => handlerSelect(item.color)"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import type { IFormatDoodle } from '../hooks/useFormatDoodleList'

const props = withDefaults(
  defineProps<{
    paletteList?: {
      color: string
    }[]
    top?: number
    left?: number
    doodle: Partial<IFormatDoodle>
  }>(),
  {
    paletteList: () => [
      {
        color: '#438FFF',
      },
      {
        color: '#1ABE6B',
      },
      {
        color: '#FFBB00',
      },
      {
        color: '#E23C39',
      },
      {
        color: '#B620E0',
      },
    ],
  },
)

const emits = defineEmits<{
  (e: 'palette-ok', value: IFormatDoodle): void
  (e: 'delete', value: string): void
  // 点击其他地方调用关闭
  (e: 'close'): void
  (e: 'open-before'): void
  (e: 'close-before'): void
}>()

const styleContainerRef = ref<HTMLDivElement>()

const inputValue = ref(props.doodle.name)

const innerDoodle = ref(props.doodle)

watch(
  () => props.doodle,
  (newDoodle) => {
    innerDoodle.value = newDoodle
  },
)

// 当前选中的调色盘
const _selectPaletteColor = computed(() => innerDoodle.value.color || '#438FFF')

const paletteShow = ref(false)

const topPx = computed(
  () => `${props.top || Math.max(innerDoodle.value.y1!, innerDoodle.value.y2!) + 5}px `,
)

const leftPx = computed(
  () => `${props.left || Math.min(innerDoodle.value.x1!, innerDoodle.value.x2!)}px`,
)

watchEffect(() => {
  console.log('props.doodle', props.doodle)
})

watchEffect(() => {
  console.log('innerDoodle.value', innerDoodle.value)
})

onMounted(() => {
  emits('open-before')
  styleContainerRef.value?.addEventListener('mousedown', (e) => {
    e.stopPropagation()
  })
})

onBeforeUnmount(() => {
  emits('close-before')
})

const handlerInput = (e: any) => {
  inputValue.value = e.target.value
}
const handlerOk = () => {
  emits('palette-ok', {
    ...innerDoodle.value,
    name: inputValue.value,
  } as IFormatDoodle)
  emits('close')
}

const handlerCancel = () => {
  emits('close')
}

const handlerDelete = () => {
  emits('delete', innerDoodle.value.id!)
  emits('close')
}

const handlerSelect = (color: string) => {
  emits('palette-ok', {
    ...innerDoodle.value,
    color: color,
  } as IFormatDoodle)
}

defineExpose({
  close: handlerCancel,
  update: (value: IFormatDoodle) => {
    innerDoodle.value = value
  },
})
</script>

<style lang="scss" scoped>
.check-style-container {
  position: absolute;
  top: v-bind(topPx);
  left: v-bind(leftPx);
  z-index: 100;
}

.input-wrapper {
  display: flex;
  width: 314px;
  height: 32px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  padding: 6px 16px;
  align-items: center;
}

input {
  font-size: 14px;
  color: #606266;
  border: none;
  outline: none;
}

input::placeholder {
  color: #dcdfe6;
}

.style-tools {
  flex: 1;
  display: flex;
  align-items: center;

  i {
    flex: 1;

    &:hover {
      cursor: pointer;
    }
  }

  .iconfont {
    font-size: 14px;

    &:hover {
      font-size: 16px;
    }

    &.icon-check {
      color: #67c23a;
    }

    &.icon-quxiao {
      color: #ff5e5e;
    }

    &.icon-shanchu {
      color: #606266;
    }

    &.icon-tiaosepan {
      color: #e23c39;
    }
  }
}

.style-palette {
  position: absolute;
  top: -26px;
  left: 227px;
  width: 128px;
  height: 24px;
  background: #ffffff;
  box-shadow:
    0px 1px 2px 0px rgba(0, 0, 0, 0.12),
    0px 2px 3px 0px rgba(0, 0, 0, 0.08),
    0px 1px 5px 0px rgba(0, 0, 0, 0.05);
  border-radius: 2px 2px 2px 2px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.palette-item {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  position: relative;

  &:hover {
    cursor: pointer;
    transform: scale(1.1);
  }

  &.active::after {
    font-family: 'iconfont' !important;
    content: '\e720';
    position: absolute;
    font-weight: bold;
    color: #fff;
  }
}
</style>
