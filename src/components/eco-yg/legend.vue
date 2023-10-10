<script setup>
/**
 * 图例组件
 */
import { onMounted, onUnmounted, reactive, ref, computed, watch, toRefs } from 'vue'
import { ecologyStore } from '@/stores/ecology.js'
const props = defineProps({
  legend: Object
})
const store = ecologyStore()
const { legend } = toRefs(props)
</script>
<template>
  <div class="legendContainer" v-if="legend.legendData">
    <div class="unitBar">{{ store.curProduct.name === '生物量' ? 'g/m²' : legend.legendData?.unit }}</div>
    <div class="colorBar">
      <div v-for="(item, index) in legend.legendData?.color" :key="index" :style="{ backgroundColor: item }"
        class="colorItem">
      </div>
    </div>
    <div class="valueBar">
      <div v-for="(item, index) in legend.legendData?.value" :key="index" class="valueItem">
        {{ index == legend.legendData?.value.length - 1 ? '' : item }}</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.legendContainer {


  position: absolute;
  bottom: 110rem;
  right: 20rem;
  box-sizing: border-box;
  // width: 428rem;
  // height: 60rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 5rem 5rem 5rem 5rem;
  padding: 5rem 10rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;


  .labelBar {
    display: flex;

    .labelBarItem {
      width: 60rem;
      height: 20rem;
      text-align: center;
    }
  }

  .unitBar {
    height: 20rem;
    width: 100%;
  }

  .colorBar {
    display: flex;
    // position: absolute;
    // bottom: 20rem;
    // right: 0rem;

    .colorItem {
      width: 30rem;
      height: 20rem;

    }
  }

  .valueBar {
    // position: absolute;
    // bottom: 0;
    // right: -15rem;

    display: flex;

    .valueItem {
      width: 30rem;
      height: 20rem;
      text-align: center;
      cursor: pointer;
      font-size: 14rem;
    }


  }
}
</style>