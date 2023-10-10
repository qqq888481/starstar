<script setup>
/* 
产品操作组件
传入：
传出：
 */
import { message } from 'ant-design-vue'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { yaoganStore } from '@/stores/yaogan.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  satData: Object,
  siteData: Object
})

let chooseItem = computed(() => store.chooseItem) //当前选中菜单
const store = yaoganStore()
const router = useRouter()
const areaData = computed(() => store.areaData)
const curAreaValue = computed(() => store.curAreaValue) //选择框选中的地区value属性

const barClickData = computed(() => store.barClickData)
const curProduct = computed(() => store.curProduct) //当前选中产品

//数据下载地址
const downloadUrl = computed(() => {
  let id
  if (store.isShowSite && store.sitePicChecked) {
    id = props.siteData ? props.siteData.id : ''
  } else {
    id = barClickData.value ? barClickData.value.id : ''
  }
  return `${interfaceDir}/product-file-info/fileDownload?id=${id}&regionId=${store.picAreaValue}`
})
onMounted(() => {})

onUnmounted(() => {})

// 改变当前组件需要展示哪些功能按钮
const showReport = computed(() => {
  const arr = [
    '3299317048445280256', //pm2.5
    '3302246611278487552' //pm10
    // '3305209245360594944', //秸秆焚烧
    // '3304698882986369024', //甲醛 HCHO
    // '3300283055309627392', //NO2
  ]
  const index = arr.findIndex(item => item === curProduct.value?.id)
  return index === -1 ? false : true
})

const clickOpt = (type, e) => {
  // type :专题图、下载、统计分析等等
  // 如果 是专题图   在vuex中改变专题图显隐状态
  // 如果 是对比分析   在vuex中改变对比分析显隐状态
  store.setChooseItem(type)
  switch (type) {
    case 'download':
      message.info('下载中,请稍候')
      e.stopPropagation()
      //把下载蓝色选中状态取消
      setTimeout(() => {
        store.setChooseItem('')
      }, 2000)
      break
    case 'thematicVisible':
    case 'dqStatisticsVisible':
    case 'trendStatisticsVisible':
      store.changVisible([type, true])
      break
    case 'reportVisible':
      store.setChooseItem('')
      // router.push({ path: '/report' })
      break
    default:
      break
  }
}
</script>

<template>
  <div id="OptList">
    <a-tooltip placement="top" title="专题图">
      <a-button type="text" :disabled="satData.regionInfo?.length === 0" @click="clickOpt('thematicVisible')">
        <template #icon>
          <i
            class="iconfont2 icon-zhuantitu"
            :style="{
              color: chooseItem === 'thematicVisible' ? '#ebc200' : '#fff'
            }"
          ></i>
        </template>
      </a-button>
    </a-tooltip>
    <template
      v-if="
        curProduct?.id !== '3305217113740681216' &&
        curProduct?.id !== '3305209245360594944' &&
        curProduct?.id !== '3305215241134940160'
      "
    >
      <!-- 云图、秸秆焚烧不展示统计 -->
      <a-tooltip placement="top" title="单期统计" v-if="curAreaValue !== '130000000000'">
        <a-button type="text" :disabled="satData.regionInfo?.length === 0" @click="clickOpt('dqStatisticsVisible')">
          <template #icon>
            <i
              class="iconfont2 icon-zhuzhuangtu"
              :style="{
                color: chooseItem === 'dqStatisticsVisible' ? '#ebc200' : '#fff'
              }"
            ></i>
          </template>
        </a-button>
      </a-tooltip>
    </template>
    <template
      v-if="
        curProduct?.id !== '3305217113740681216' &&
        curProduct?.id !== '3305209245360594944' &&
        curProduct?.id !== '3305215241134940160'
      "
    >
      <a-tooltip
        placement="top"
        title="趋势统计"
        v-if="curAreaValue !== '130000000000' && curProduct?.id !== '3305215241134940160'"
      >
        <a-button type="text" :disabled="satData.regionInfo?.length === 0" @click="clickOpt('trendStatisticsVisible')">
          <template #icon>
            <i
              class="iconfont2 icon-zhexiantu"
              :style="{
                color: chooseItem === 'trendStatisticsVisible' ? '#ebc200' : '#fff'
              }"
            ></i>
          </template>
        </a-button>
      </a-tooltip>
    </template>

    <a-tooltip placement="top" title="数据下载">
      <a :href="downloadUrl">
        <a-button type="text" :disabled="satData.regionInfo?.length === 0" @click="e => clickOpt('download', e)">
          <template #icon>
            <i
              class="iconfont2 icon-xiazai111"
              :style="{
                color: chooseItem === 'download' ? '#ebc200' : '#fff'
              }"
            ></i>
          </template>
        </a-button>
      </a>
    </a-tooltip>
    <template v-if="showReport">
      <a-tooltip placement="top" title="分析报告" v-if="curAreaValue !== '130000000000'">
        <a-button type="text" @click="clickOpt('reportVisible')">
          <template #icon>
            <i
              class="iconfont2 icon-wendang"
              :style="{
                color: chooseItem === 'reportVisible' ? '#ebc200' : '#fff'
              }"
            ></i>
          </template>
        </a-button>
      </a-tooltip>
    </template>
  </div>
</template>

<style lang="scss">
#OptList {
  z-index: 3;
  position: absolute;
  bottom: 101rem;
  right: 45rem;
  // padding: 0rem 0.05rem 0.15rem 0.05rem;
  padding: 5rem;
  // width: 0.28rem;
  // height: 1.3rem;
  // background-color: rgb(32, 31, 36);
  background: url('@/assets/yaogan/image/194182.png') no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  // flex-wrap: wrap;
  row-gap: 5rem 1rem;
  align-items: center;

  border-radius: 2rem;
  .ant-btn-icon-only {
    width: 16rem;
    height: 28rem;
  }
  .iconfont2 {
    color: #fff;
    font-size: 14rem;
  }

  // div {
  // 	padding: 5rem;
  // 	border-radius: 3rem;
  // 	display: flex;
  // 	align-items: center;
  // 	justify-content: center;
  // 	img {
  // 		cursor: pointer;
  // 	}
  // }
}
</style>
