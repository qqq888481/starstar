<script setup>
/*
地图工具栏 传入：行政区划接口数据（从vuex中获取默认选中项）、viewer
传出：
 */

import { onMounted, onUnmounted, reactive, ref, computed, watch } from 'vue'
import { AimOutlined } from '@ant-design/icons-vue'
import { yaoganStore } from '@/stores/yaogan.js'
import MeasureTool from './measureTool'

const emit = defineEmits(['changwind', 'showSite'])
const props = defineProps({
  areaDataList: Array
})
const store = yaoganStore()
let isShowWindy = ref(false) // 风场按钮显示状态
let isShowSite = ref(false) // 站点按钮显示状态
let viewer
let dropvisible = ref(false)
let measurevisible = ref(false)
let visible = ref(false) //透明度下拉框显隐值
const transparencyValue = ref(0.6) //透明度值
const layersMenuAry = reactive([]) //图层数组
//获取viewer值
const setViewer = propsViewer => {
  viewer = propsViewer

  for (const layer of viewer.layerInfoAry) {
    layersMenuAry.push({
      name: layer.name,
      id: layer.id,
      need: layer.need,
      isLabel: layer.isLabel
    })
  }
}

const inZoom = () => {
  // 地图放大
  viewer.zoomIn()
}
const init = () => {
  viewer.initViewer()
}
const outZoom = () => {
  // 地图缩小
  viewer.zoomOut()
}

const changeLayer = item => {
  dropvisible.value = false
  console.log(item)
  viewer.switchLayer(item.id, item.need)
}
//测量和清除
const changeMeasure = e => {
  if (e.key === 'measureLength') {
    const measureTool = new MeasureTool(viewer)
    measureTool.excuteMeasureLength()
  } else {
    const measureTool = new MeasureTool(viewer)
    measureTool.clearMeasureLayer()
  }
}
const changeShowWindy = () => {
  // 改变风场显隐，告知父组件现状
  isShowWindy.value = !isShowWindy.value
  emit('changwind', isShowWindy.value)
}

const changeAlpha = value => {
  visible.value = true
  // 改变产品透明度
  store.setOpacityData(value)
}
const cascaderValue = ref()
const options = computed(() => {
  const option = []
  loop(props.areaDataList, option)
  return option
})

const changeArea = value => {
  // 改变行政区划
  // vuex存了当前的行政区划。触发此方法时，去改变vuex
  cascaderValue.value = value
  store.setCurAreaValue(value)
}

function loop(list, option) {
  for (const element of list) {
    option.push({
      value: element.regionid,
      label: element.fullname
    })

    if (element.children) {
      loop(element.children, option)
    }
  }
}

onMounted(() => {})

onUnmounted(() => {})
defineExpose({
  setViewer
})
</script>

<template>
  <div id="Toolbar">
    <!-- <a-tooltip placement="left">
			<template #title>行政区划</template>

			<a-select
				:value="cascaderValue"
				size="small"
				style="width: 1.2rem"
				:options="options"
				class="region"
				:dropdown-style="{
					maxHeight: '400px',
					overflow: 'auto',
				}"
				@change="changeArea"
			></a-select>
		</a-tooltip> -->
    <!-- <a-tooltip placement="left">
			<template #title>风场</template>
			<i
				class="iconfont2 icon-fengchang"
				@click="changeShowWindy"
				:style="{
					color: isShowWindy ? '#078C8F' : '#d6d6d6',
				}"
			></i>
		</a-tooltip> -->
    <a-tooltip placement="left">
      <template #title>透明度</template>
      <a-dropdown placement="bottom" v-model:visible="visible">
        <i class="iconfont2 icon-toumingdu" :style="{ color: visible ? '#078C8F' : '#d6d6d6' }"></i>

        <template #overlay>
          <a-menu style="background-color: #201f249e">
            <a-menu-item style="width: 200px; background-color: #201f249e">
              <a-slider
                v-model:value="transparencyValue"
                :max="1"
                :min="0.01"
                :step="0.01"
                tooltipPlacement="bottom"
                @afterChange="changeAlpha"
              />
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-tooltip>
    <a-tooltip placement="left">
      <template #title>放大</template>
      <i class="iconfont2 icon-fangda111" @click="inZoom"></i>
    </a-tooltip>
    <a-tooltip placement="left">
      <template #title>复位</template>
      <i class="iconfont2 icon-fuwei" @click="init"></i>
    </a-tooltip>
    <a-tooltip placement="left">
      <template #title>缩小</template>
      <i class="iconfont2 icon-suoxiaoyg" @click="outZoom"></i>
    </a-tooltip>
    <a-dropdown placement="bottom" v-model:visible="dropvisible">
      <a class="ant-dropdown-link" @click.prevent>
        <i class="iconfont2 icon-tuceng111" :style="{ color: dropvisible ? '#078C8F' : '#d6d6d6' }"></i>
      </a>
      <template #overlay>
        <a-menu>
          <template v-for="item in layersMenuAry" :key="item.id">
            <a-menu-item v-if="!item.isLabel" @click="changeLayer(item)">
              <a href="javascript:;">{{ item.name }}</a>
            </a-menu-item>
          </template>
        </a-menu>
      </template>
    </a-dropdown>
    <!-- <a-dropdown placement="bottom" v-model:visible="measurevisible">
      <a class="ant-dropdown-link" @click.prevent>
        <i class="iconfont2 iconfont icon-celiang1" :style="{ color: measurevisible ? '#078C8F' : '#d6d6d6' }"></i>
      </a>
      <template #overlay>
        <a-menu @click="changeMeasure">
          <a-menu-item key="measureLength">距离测量</a-menu-item>
          <a-menu-item key="clear">清除</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown> -->
  </div>
</template>

<style lang="scss">
#Toolbar {
  position: absolute;
  background: rgba(32, 31, 36, 0.8);
  border-radius: 20rem;
  border: 1px solid #078c8f;
  z-index: 3;
  right: 40rem;
  top: 58rem;
  padding: 5rem 20rem 5rem 15rem;
  display: flex;
  column-gap: 20rem;
  align-items: center;
  .iconfont2 {
    color: #d6d6d6;
    font-size: 14rem;
    cursor: pointer;
  }

  .icon-fangda:hover,
  .icon-suoxiao1:hover,
  .icon-fuwei:hover {
    color: #078c8f;
  }
  .region {
    .ant-select-selector {
      background-color: #078c8f;
      border: 1px solid #078c8f;
      border-radius: 20rem;
      color: #fff;
    }
    .ant-select-arrow {
      color: #fff;
    }
  }
}
</style>
