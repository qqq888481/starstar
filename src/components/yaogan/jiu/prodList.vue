<script setup>
/*
产品列表组件
传入：产品列表数据（从vuex中获取默认选中项）
传出：
 */

//  近地面调整：1.dom需要判断parentId和id两个信息 2. 图标name字段需要和返回的接口name字段一致
import { computed } from '@vue/reactivity'
import { message } from 'ant-design-vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { yaoganStore } from '@/stores/yaogan.js'

const props = defineProps({
  isLoading: Boolean
})
const store = yaoganStore()

const curProduct = computed(() => store.curProduct) //当前选中产品
const isPlay = computed(() => store.isPlay) //当前选中产品

const changeProd = item => {
  //需要判断是否在播放---------------------------------------------------------------
  if (isPlay.value) {
    message.info('请暂停播放或等待播放完成后切换产品')
    return
  }
  if (props.isLoading) {
    message.info('产品加载中，请稍后切换')
    return
  }
  // 改变当前选中的产品，去改变vuex中的值
  store.setCurProduct(item)
}

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
    //根据name属性将icon类名添加到数组中
    for (let i = 0; i < store.productList.length; i++) {
      let element = store.productList[i].sonProducts
      if (element) {
        for (let j = 0; j < element.length; j++) {
          let data = element[j]
          const tempsrc = iconArr.find(item => item.name === data.name) || {
            class: 'iconfont icon-zanwutupian' //无对应数据时显示的图标
          }
          arr.push({
            ...data,
            ...tempsrc
          })
        }
      }
    }
  }

  return arr
})

onUnmounted(() => {})
</script>

<template>
  <div id="ProdList">
    <div class="pro-th">
      <img src="@/assets/yaogan/image/ygjc1.png" alt="" />
      <div class="th-icon">
        <img src="@/assets/yaogan/image/ygjc.png" alt="" />
      </div>
    </div>
    <div class="pro-content">
      <div class="left">
        <template v-for="item in prodList">
          <div
            class="name"
            v-if="item.parentId === '3193418994760638464' && item.isshow === 1"
            :key="item.name"
            @click="changeProd(item)"
          >
            <span
              :style="{
                backgroundColor: curProduct.id === item.id ? 'rgb(57, 123, 214)' : ''
              }"
            >
              {{ item.name }}</span
            >
          </div>
        </template>
      </div>
      <div class="right">
        <template v-for="item in prodList">
          <div
            class="icon"
            v-if="item.parentId === '3193418994760638464' && item.isshow === 1"
            :key="item.name"
            @click="changeProd(item)"
            :style="{
              backgroundColor: curProduct.id === item.id ? '#3f90ff' : ''
            }"
          >
            <span
              :class="item.class"
              :style="{
                color: curProduct.id === item.id ? '#fff' : '#b5c3dd'
              }"
            ></span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#ProdList {
  z-index: 3;
  position: absolute;
  right: 20rem;
  top: 65rem;
  .pro-th {
    display: grid;
    grid-template-columns: auto 40rem;
    align-items: center;
    justify-items: right;
    column-gap: 1rem;

    color: #fff;
    font-size: 16rem;
    font-weight: 200;
    span {
      text-align: right;
    }
    .th-icon {
      width: 4rem;
      height: 4rem;
      background: rgb(9, 86, 177);
      border-radius: 5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .pro-content {
    display: grid;
    grid-template-columns: auto 40rem;
    column-gap: 10rem;
    color: #fff;

    .left {
      padding: 5rem 2rem;
      display: grid;
      grid-template-columns: 1fr;
      column-gap: 2rem;
      align-items: center;
      justify-items: end;
      .name {
        padding: 5rem 5rem;
        span {
          padding: 5rem 5rem;
          padding-left: 30rem;
          text-align: right;
          font-size: 14rem;
          border-radius: 5rem;
          cursor: pointer;
        }
      }
    }
    .right {
      margin: 0 5rem;
      padding: 5rem 2rem;
      background-color: rgb(32, 31, 36);
      display: grid;
      grid-template-columns: 1fr;
      column-gap: 5rem;
      border-radius: 3rem;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3rem;
        cursor: pointer;
      }
    }
  }
}
</style>
