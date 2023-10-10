<script setup>
/*
地图工具栏 传入：行政区划接口数据（从vuex中获取默认选中项）、viewer
传出：
 */

import { onMounted, onUnmounted, reactive, ref, computed, watch, toRefs } from 'vue'
// import { AimOutlined } from '@ant-design/icons-vue'
import { ecologyStore } from '@/stores/ecology.js'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import Request from '@/views/1-ecology/0-p1.1/0-yg/request.js'
import thematicAcitveIcon from '@/assets/images/ecology/thematicActive.png'
import thematicDefaultIcon from '@/assets/images/ecology/thematicDefault.png'
import tzActiveIcon from '@/assets/yaogan/image/tzActive.png'
import tzDefaultIcon from '@/assets/yaogan/image/tzDefault.png'
const emit = defineEmits(['changwind', 'showSite', 'toThematic', 'handleTz'])
const router = useRouter()
const store = ecologyStore()
const props = defineProps({
  area: Object,
  legend: Object,
  isLoading: Boolean
})
const { area, legend } = toRefs(props)
let curProductName = ref()
// const legend = computed(() => {

//   return props.legend
// })
const btnList = reactive([
  { name: '分级', key: '2.1' },
  { name: '渐进', key: '2' }
])
const downFileId = ref()

let isShowWindy = ref(false) // 风场按钮显示状态
let isShowSite = ref(false) // 站点按钮显示状态
let isShowThemetic = ref(false) //专题图按钮显示状态
let viewer
let dropvisible = ref(false) //图层下拉框
let tanzhenvisible = ref(false) //探针开启关闭下拉框
let tanzhenState = ref(false) //是否开启探针
let barClickData = computed(() => store.curProduct)
let visible = ref(false) //透明度下拉框显隐值
let value1 = ref('1')
let value2 = ref()
const transparenctValue = ref(1.0) //透明度值
const transparenct = computed(() => parseInt(transparenctValue.value * 100))
const layersMenuAry = reactive([]) //图层数组
const layerChooseId = ref()
const tanzhenAry = reactive([
  { name: '开启探针', id: 'open' },
  { name: '关闭探针', id: 'close' }
]) //图层数组

let toolContainerStyle = computed(() => {
  if (router.currentRoute.value.path === '/eco-service-assessment') {
    return '457rem'
  } else {
    return '460rem'
  }
})
//获取viewer值
const setViewer = propsViewer => {
  viewer = propsViewer

  for (const layer of viewer.layerInfoAry) {
    if (layer.need) {
      layersMenuAry.push({
        name: layer.name,
        id: layer.id,
        need: layer.need,
        isLabel: layer.isLabel
      })
      if (layer.name === '天地图影像图') {
        layerChooseId.value = layer.id
        //初始默认加载天地图
        changeLayer(layer)
      }
    }
  }
}
const downloadUrl = computed(() => {
  const issueFiles = store.curData ? store.curData.issueFiles : []
  let id = issueFiles && issueFiles.length > 0 ? issueFiles[0]?.productInfoId : null
  downFileId.value = id

  if (id) {
    return `${interfaceDir}/product-file-info/fileDownload?id=${id}&regionId=${store.curArea.regionid}`
  } else {
    // return `javascript:alert('无数据可下载')`
    return '#'
  }
})
const showMessage = () => {
  if (downFileId.value) {
    message.info('下载中, 请稍后')
    return
  } else {
    message.info('无数据可下载!')
  }
}

const changetanzhen = item => {
  tanzhenState.value = !tanzhenState.value
  if (tanzhenState.value) {
    message.info({
      content: '探针已开启',
      duration: 1,
      onClick: () => message.destroy()
    })
    emit('handleTz', 'open')
  } else {
    message.info('探针已关闭')
    emit('handleTz', 'close')
  }
  // tanzhenvisible.value = false
  // if (item.id == 'open') {
  //   message.info('探针已开启')
  // } else {
  //   message.info('探针已关闭')
  // }
  // emit('handleTz', item.id)
}
const changeThematic = () => {
  if (props.isLoading) {
    message.info('页面加载中请稍后')
    return
  }
  isShowThemetic.value = !isShowThemetic.value
  emit('toThematic')
}
const closeThematic = () => {
  //去除选中状态
  isShowThemetic.value = false
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
  const height = viewer.camera.positionCartographic.height
  if (height > MAXHEIGHT) {
    message.info({
      content: '当前已缩放到最大级别', //提示的内容
      duration: 1, //提示的时长
      onClick: () => message.destroy() //点击的时候关闭
    })
    return
  }
  viewer.zoomOut(10000)
}
const load = () => {
  viewer.saveSence()
}
const changeLayer = item => {
  dropvisible.value = false
  viewer.switchLayer(item.id, item.need)
  layerChooseId.value = item.id
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

//改变行政区划
const chooseCurArea = item => {
  area.value.curAreaList = item
  store.setCurArea(item)
}
/**
 * 获取济南下属区县列表
 */
const getAreaList = () => {
  let data = {
    categoryId: curBzzId.value,
    regionName: ''
  }
  Request.resList(data, res => {
    panel.areaDataList = res
    loopArea(panel.areaDataList, panel.areaMap)
    product.queryProductShow()
  })
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
watch(
  () => store.curProduct,
  () => {
    if (store.curProduct) {
      if (store.curProduct.name === '生态系统格局评估' || store.curProduct.parentName === '生态系统质量评估') {
        curProductName.value = false
      } else {
        curProductName.value = true
      }
    }
  }
)
onMounted(() => {})

onUnmounted(() => {})
defineExpose({
  setViewer,
  closeThematic
})
</script>

<template>
  <div id="Toolbar" :style="{ right: toolContainerStyle }">
    <a-select ref="select" :value="area.curAreaList.id">
      <a-select-option
        v-for="(item, index) in area.areaList"
        :key="index"
        :value="item.id"
        @click="chooseCurArea(item)"
        >{{ item.fullname }}</a-select-option
      >
    </a-select>
    <div class="mapShowBtn" v-show="curProductName">
      <slot name="monitor"> </slot>
      <slot name="estimate"></slot>
    </div>
    <a-tooltip placement="bottom">
      <div class="thematic" @click="changeThematic">专题图</div>
    </a-tooltip>
    <div class="mapTool">
      <a-tooltip placement="bottom">
        <template #title>放大</template>
        <div class="image-warp" @click="inZoom"><img src="@/assets/yaogan/image/toolbar2.png" alt="" /></div>
      </a-tooltip>
      <a-tooltip placement="bottom">
        <template #title>缩小</template>
        <div class="image-warp" @click="outZoom"><img src="@/assets/yaogan/image/toolbar4.png" alt="" /></div>
      </a-tooltip>
      <a-tooltip placement="bottom">
        <template #title>复位</template>
        <div class="image-warp" @click="init"><img src="@/assets/yaogan/image/toolbar3.png" alt="" /></div>
      </a-tooltip>

      <a-dropdown placement="bottom" v-model:visible="tanzhenvisible">
        <a class="ant-dropdown-link" @click.prevent>
          <div class="image-warp">
            <img :src="tanzhenState ? tzActiveIcon : tzDefaultIcon" alt="" @click="changetanzhen" />
          </div>
        </a>
      </a-dropdown>
      <a-dropdown placement="bottom" v-model:visible="visible">
        <div class="image-warp"><img src="@/assets/yaogan/image/toolbar6.png" alt="" /></div>
        <template #overlay>
          <a-menu style="background-color: #fff; margin-top: 3rem">
            <a-menu-item style="width: 100px; height: 40px; background-color: #fff">
              <div style="width: 100%; height: 15px; text-align: center; font-size: 12px; color: #3074e2">
                {{ transparenct }}%
              </div>
              <a-slider
                v-model:value="transparenctValue"
                :max="1"
                :min="0.01"
                :step="0.01"
                :tooltipVisible="false"
                @afterChange="changeAlpha"
              />
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-dropdown placement="bottom" v-model:visible="dropvisible">
        <a class="ant-dropdown-link" @click.prevent>
          <div class="image-warp"><img src="@/assets/yaogan/image/toolbar1.png" alt="" /></div>
        </a>
        <template #overlay>
          <a-menu style="margin-top: 5rem">
            <template v-for="item in layersMenuAry" :key="item.id">
              <a-menu-item
                v-if="!item.isLabel"
                :style="{
                  backgroundColor: item.id === layerChooseId ? '#1989FA' : '#FFFFFF',
                  color: item.id === layerChooseId ? '#FFFFFF' : '#666666'
                }"
                @click="changeLayer(item)"
              >
                <a href="javascript:;">{{ item.name }}</a>
              </a-menu-item>
            </template>
          </a-menu>
        </template>
      </a-dropdown>

      <a-tooltip placement="bottom">
        <template #title>下载</template>
        <a :href="downloadUrl" @click="showMessage()">
          <div class="image-warp"><img src="@/assets/yaogan/image/toolbar7.png" alt="" /></div>
        </a>
      </a-tooltip>
    </div>
  </div>
</template>

<style lang="scss">
#Toolbar {
  position: absolute;
  top: 22rem;
  display: flex;

  .toolbar-select {
    width: 100rem;
    height: 40rem;
    background: #ffffff;
    box-shadow: 0rem 4rem 12rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 24rem 24rem 24rem 24rem;
  }

  .mapShowBtn {
    margin-left: 12rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 4rem;
    height: 40rem;
    background: #ffffff;
    box-shadow: 0rem 4rem 12rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 24rem;
    opacity: 1;
    font-size: 14rem;
    font-family: Microsoft YaHei-Regular, Microsoft YaHei;
    font-weight: 400;
    text-align: center;
    line-height: 32rem;
    cursor: pointer;

    .activeMapShow {
      width: 56rem;
      height: 32rem;
      background: #3f75fe;
      border-radius: 24rem;
      color: #ffffff;
    }

    .defaultMapShow {
      width: 56rem;
      height: 32rem;
      background: #ffffff;
      border-radius: 24rem;
      color: #333333;
    }
  }

  .thematic {
    width: 60rem;
    height: 40rem;
    background: #ffffff;
    box-shadow: 0rem 4rem 12rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 24rem 24rem 24rem 24rem;
    opacity: 1;
    font-size: 14rem;
    font-family: Microsoft YaHei-Regular, Microsoft YaHei;
    font-weight: 400;
    color: #333333;
    line-height: 40rem;
    text-align: center;
    margin-left: 12rem;
    cursor: pointer;
  }

  .thematicAcitive {
    background: #1989fa;
  }

  .thematicDefault {
    background: #ffffff;
  }

  .toolbar-select2 {
    position: absolute;
    right: 430rem;
    top: 0rem;
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    width: 100rem;
    height: 40rem;
    background: #ffffff;
    box-shadow: 0rem 4rem 12rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 50rem;
    display: flex;
    align-items: center;
    padding-left: 20rem;
  }

  .slider-text {
    margin-left: 30rem;
    font-size: 12rem;
    font-weight: normal;
    color: #3074e2;
    text-align: center;
  }

  .mapTool {
    width: 352rem;
    height: 40rem;
    background: #ffffff;
    box-shadow: 0rem 2rem 6rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 20rem 20rem 20rem 20rem;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-left: 12rem;
  }

  .image-warp {
    height: 40rem;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    // margin-left: 12rem;
  }

  .image-warp:hover {
    background: #fff;
  }

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
      border: 1rem solid #078c8f;
      border-radius: 20rem;
      color: #fff;
    }

    .ant-select-arrow {
      color: #fff;
    }
  }

  .layerChoosed {
    background: #1989fa;
    color: #ffffff;
  }

  .layerDefault {
    background: #ffffff;
    color: #666666;
  }
}
</style>
