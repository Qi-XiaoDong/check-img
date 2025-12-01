<template>
  <div class="check-style-container" @click.stop="() => {}">
    <div class="input-wrapper">
      <input
        id="inputValue"
        @input="handlerInput"
        :value="inputValue"
        placeholder="请输入标签，按回车确认"
        @keydown.enter="handlerOk"
        @click.stop
      />
      <div class="style-tools">
        <i class="iconfont icon-check" @click="handlerOk" />
        <i class="iconfont icon-quxiao" @click="handlerCancel" />
        <i class="iconfont icon-shanchu" @click="handlerDelete" />
        <i class="iconfont icon-tiaosepan" @click="handlerSelect" />
      </div>
    </div>
    <div class="style-palette" v-show="paletteShow">
      <div
        class="palette-item"
        :class="{ active: item.color === _selectPaletteColor }"
        v-for="item in paletteList"
        :key="item.color"
        :style="{
          background: item.color,
        }"
        @click="
          () => {
            _selectPaletteColor = item.color
          }
        "
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
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
  (e: 'palette-ok', value: any): void
  (e: 'delete'): void
  // 点击其他地方调用关闭
  (e: 'close'): void
  (e: 'open-before'): void
  (e: 'close-before'): void
}>()

const inputValue = ref(props.doodle.name)

const _selectPaletteColor = ref(props.doodle.color || '#438FFF')

const paletteShow = ref(false)

const topPx = computed(() => `${props.top || Math.max(props.doodle.y1!, props.doodle.y2!)}px `)

const leftPx = computed(() => `${props.left || Math.max(props.doodle.x1!, props.doodle.x2!)}px`)

watchEffect(() => {
  console.log('watchEffect', props.doodle)
})

onMounted(() => {
  console.log('挂载', props.doodle)
  emits('open-before')
})

onBeforeUnmount(() => {
  console.log('卸载')
  emits('close-before')
})

const handlerInput = (e: any) => {
  inputValue.value = e.target.value
}
const handlerOk = () => {
  emits('palette-ok', {
    ...props.doodle,
    name: inputValue.value,
  })
  emits('close')
}

const handlerCancel = () => {
  emits('close')
}

const handlerDelete = () => {
  emits('delete')
  emits('close')
}

const handlerSelect = () => {
  // emits('palette-ok', {
  //   ...props.doodle,
  //   color: _selectPaletteColor.value,
  // })
  paletteShow.value = !paletteShow.value
}
</script>

<style lang="scss" scope>
.check-style-container {
  position: absolute;
  margin-top: v-bind(topPx);
  margin-left: v-bind(leftPx);
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
