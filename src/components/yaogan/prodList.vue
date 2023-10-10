<script setup>
/*
产品列表组件
传入：产品列表数据（从vuex中获取默认选中项）
传出：
 */

import { computed } from '@vue/reactivity'
import { message } from 'ant-design-vue'
import { onMounted, onUnmounted, ref, watch, reactive } from 'vue'
import { yaoganStore } from '@/stores/yaogan.js'
import { eleToShow } from '@/views/1-ecology/0-yg/common/myComFn.js'

const props = defineProps({
  isLoading: Boolean
})
const store = yaoganStore()

const curProduct = computed(() => store.curProduct) //当前选中产品
const isShowHot = computed(() => store.isShowHot) //热点网格面板是否展开
const isShowSite = computed(() => store.isShowSite) //站点面板是否展开
const isPlay = computed(() => store.isPlay) //当前选中产品

const changeProd = item => {
  //需要判断是否在播放---------------------------------------------------------------
  if (isPlay.value) {
    message.info('请暂停播放或等待播放完成后切换产品')
    return
  }
  if (isShowSite.value || isShowHot.value) {
    message.info('请关闭热点网格和站点面板后切换产品')
    return
  }
  if (props.isLoading) {
    // message.info('产品加载中，请稍后切换', 0.1)
    return
  }

  if (item.name === '沙尘') {
    sandPanel.show = !sandPanel.show
    changeProd(sandPanel.data[0]) //默认选沙尘第一个
  } else {
    // 改变当前选中的产品，去改变vuex中的值
    store.setCurProduct(item)

    //其他产品关闭沙尘面板
    const arr = ['3305208420726874112', '3305215739351146496', '3305216220387483648']
    if (arr.indexOf(item.id) === -1) {
      sandPanel.show = false
    }
  }
}

const srcArr = [
  {
    name: '真彩色云图', //展示的name属性
    src1: `url(${new URL('../../assets/yaogan/image/cy.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/cy1.png', import.meta.url).href}) no-repeat`
  },
  //日照测试用
  // {
  // 	name: 'AOD',
  // 	isshow: 1,
  // 	src1: `url(${
  // 		new URL('../../assets/yaogan/image/sc.png', import.meta.url).href
  // 	}) no-repeat`,
  // 	src2: `url(${
  // 		new URL('../../assets/yaogan/image/sc1.png', import.meta.url).href
  // 	}) no-repeat`,
  // },
  {
    name: 'PM25',
    src1: `url(${new URL('../../assets/yaogan/image/PM2.5.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/PM251.png', import.meta.url).href}) no-repeat`
  },

  {
    name: 'PM10',
    src1: `url(${new URL('../../assets/yaogan/image/PM10.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/PM101.png', import.meta.url).href}) no-repeat`
  },

  {
    name: 'NO2',
    src1: `url(${new URL('../../assets/yaogan/image/NO2.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/NO21.png', import.meta.url).href}) no-repeat`
  },

  {
    name: 'O3',
    src1: `url(${new URL('../../assets/yaogan/image/O3.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/O31.png', import.meta.url).href}) no-repeat`
  },
  {
    name: 'SO2',
    src1: `url(${new URL('../../assets/yaogan/image/SO2.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/SO21.png', import.meta.url).href}) no-repeat`
  },
  {
    name: 'CO',
    src1: `url(${new URL('../../assets/yaogan/image/CO.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/CO1.png', import.meta.url).href}) no-repeat`
  },
  {
    name: 'CH4',
    src1: `url(${new URL('../../assets/yaogan/image/CH4.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/CH41.png', import.meta.url).href}) no-repeat`
  },

  {
    name: 'CO2',
    src1: `url(${new URL('../../assets/yaogan/image/CO2.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/CO21.png', import.meta.url).href}) no-repeat`
  },
  {
    name: 'HCHO',
    src1: `url(${new URL('../../assets/yaogan/image/HCHO.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/HCHO1.png', import.meta.url).href}) no-repeat`
  },

  {
    name: '臭氧前体物指示值',
    src1: `url(${new URL('../../assets/yaogan/image/cyqi.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/cyqi1.png', import.meta.url).href}) no-repeat`
  },

  {
    name: '灰霾',
    src1: `url(${new URL('../../assets/yaogan/image/hm.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/hm1.png', import.meta.url).href}) no-repeat`
  },
  {
    name: '沙尘',
    isshow: 1,
    src1: `url(${new URL('../../assets/yaogan/image/sc.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/sc1.png', import.meta.url).href}) no-repeat`
  },
  {
    name: '秸秆焚烧',
    src1: `url(${new URL('../../assets/yaogan/image/jg.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/jg1.png', import.meta.url).href}) no-repeat`
  },

  {
    name: '裸地监测',
    src1: `url(${new URL('../../assets/yaogan/image/ld.png', import.meta.url).href}) no-repeat`,
    src2: `url(${new URL('../../assets/yaogan/image/ld1.png', import.meta.url).href}) no-repeat`
  }
]

const iconArr = [
  {
    name: 'CO',
    class: 'iconfont icon-CO'
  },
  {
    name: 'O₃',
    class: 'iconfont icon-O3'
  },
  {
    name: 'NO₂',
    class: 'iconfont icon-NO2'
  },
  {
    name: 'SO₂',
    class: 'iconfont icon-SO2'
  },
  {
    name: 'CH₄',
    class: 'iconfont icon-CH4'
  },
  {
    name: '臭氧前体物指示值',
    class: 'iconfont icon-chouyangqiantiwuzhishizhi'
  },
  {
    name: 'HCHO',
    class: 'iconfont icon-HCHO'
  },
  {
    name: '近地面O₃',
    class: 'iconfont icon-O3'
  },
  {
    name: '近地面NO₂',
    class: 'iconfont icon-NO2'
  }
]
const prodList = computed(() => {
  const arr = []
  if (store.productList) {
    //添加各自的src属性，用于展示背景图片
    // for (let i = 0; i < store.productList.length; i++) {
    // 	let element = store.productList[i]
    // 	if (element) {
    // 		const tempsrc = srcArr.find(item => item.name === element.name) || {
    // 			src1: new URL('../../assets/yaogan/image/110.png', import.meta.url)
    // 				.href, //无对应数据时显示的图标
    // 			src2: new URL('../../assets/yaogan/image/zu1.png', import.meta.url)
    // 				.href, //无对应数据时显示的图标
    // 		}

    for (let element of srcArr) {
      const tempsrc = store.productList.find(item => item.name === element.name)
      if (tempsrc) {
        arr.push({
          ...tempsrc,
          ...element
        })
      } else {
        arr.push({
          ...element
        })
      }
    }
  }
  return arr
})
const sandPanel = reactive({
  show: false,
  data: computed(() => {
    if (store.productList) {
      const tempsand = store.productList.filter(item => item.name.includes('沙尘'))
      return tempsand
    }
  })
})
watch(prodList, () => {
  if (prodList.value.length !== 0) {
    store.setCurProduct(prodList.value[1])
  }
})

onUnmounted(() => {})
</script>

<template>
  <div id="ProdList">
    <div class="pro-th">
      <img src="@/assets/yaogan/image/ygjc1.png" alt="" />
    </div>
    <div class="pro-content">
      <template v-for="item in prodList">
        <div
          class="clos"
          :style="{
            background: curProduct?.name === item.name ? item.src2 : item.src1
          }"
          v-if="item.isshow === 1"
          @click="changeProd(item)"
        >
          <span class="name">{{ eleToShow(item.name) }}</span>
          <!-- 沙尘面板 -->
          <div class="sand-panel" v-if="item.name === '沙尘' && sandPanel.show">
            <div
              v-for="sand in sandPanel.data"
              @click.stop="changeProd(sand)"
              :class="curProduct?.name === sand.name ? 'sand-check' : ''"
            >
              {{ sand.name }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#ProdList {
  z-index: 3;
  position: absolute;
  right: 20rem;
  top: 100rem;

  .pro-th {
    padding-left: 15rem;
    img {
      width: 91rem;
    }
  }
  .pro-content {
    // background: rgb(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    row-gap: 4rem;
    .clos {
      position: relative;
      height: 32rem;
      width: 135rem;
      color: #fff;
      display: flex;
      align-items: center;
      cursor: pointer;

      .name {
        position: absolute;
        right: 42rem;
        font-size: 14px;
        font-family: Hiragino Sans GB, sans-serif;
        font-weight: normal;
        color: #ffffff;
        white-space: nowrap;
      }
      .sand-panel {
        position: relative;
        z-index: 5;
        right: 30rem;
        padding: 15rem 12rem;
        background: rgba(32, 31, 36, 0.8);
        border: 1px solid #078c8f;
        border-radius: 15px;
        div {
          margin: 2rem 0;
        }
        .sand-check {
          color: #078c8f;
        }
      }
    }
  }
}
</style>
