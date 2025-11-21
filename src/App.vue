<script setup lang="ts">
import ChangeDetection from '@/components/changeDetection/ChangeDetection.vue'
import checkImg from '@/assets/image/check.png?url'
</script>

<template>
  <change-detection :source-url="[{ mainUrl: checkImg, subUrl: checkImg }]" />
</template>

<style>
body,
#app {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}
</style>
