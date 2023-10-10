<script setup>
import { onMounted, onUnmounted, reactive, ref, computed, watch, toRefs } from 'vue'
import AreaEcharts from './areaEcharts.vue'
import { ecologyStore } from '@/stores/ecology.js'
import upIcon from '@/assets/images/ecology/rise.png'
import downIcon from '@/assets/images/ecology/descend.png'
const store = ecologyStore()
const panelShow = store.panelShow
const emit = defineEmits(['toStatictis'])
const more = () => {
  emit('toStatictis')
}
const props = defineProps({
  isLoading: Boolean
})
const { isLoading } = toRefs(props)
const info = reactive({
  jz: null, //均值
  tb: null, //同比
  titleName: null, //
  state: false,
  stateValue: null,
  time: null
})
const unit = ref()//均值单位
watch(
  () => store.panelData,
  () => {
    /**
     * 根据传进来的同比值进行判断  如果返回来的为‘--’则不显示上升下降的图片
     *  如果大于1则显示上升的图片  小于1显示下降的图片
     */
    //console.log(store.panelData, '详情数据')
    if (!store.panelData) {
      return
    }

    info.jz = store.panelData.indexNum
    info.tb = store.panelData.tb

    if (parseFloat(store.panelData.tb)) {
      info.state = true
      if (parseFloat(store.panelData.tb) > 1) {
        info.stateValue = 1
      } else {
        info.stateValue = -1
      }
    } else {
      info.state = false
    }
  }
)
watch(
  () => store.panelShow,
  () => {
    if (!store.panelShow) {
      info.jz = '--'
      info.state = false
      info.tb = '--'
    }
  }
)

/**
 * 根据传入的12进制时间返回'YYYY-MM'或'YYYY'格式的数据
 * @param {*} cycle
 * @param {*} value
 * @param {*} list
 */
const getSliderItem = (cycle, value, list) => {
  switch (cycle) {
    case 'COAM':
      return list.slice(0, 4).join('') + '-' + list.slice(4, 6).join('')
      break
    case 'COAY':
      return list.slice(0, 4).join('')
  }
}
watch(
  () => [store.curArea, store.curProduct],
  (newVal, oldVal) => {
    if (!newVal) {
      return
    }
    if (newVal[0] && newVal[1]) {
      info.titleName = newVal[0].fullname + newVal[1].name

    }
  }
)
watch(
  () => store.issue,
  () => {
    if (!store.issue) {
      return
    }
    info.time = getSliderItem(store.curProduct.cycle, null, store.issue.split(''))
  }
)

onMounted(() => {
  //console.log(store.curArea, '区县', store.curProduct, 'chanpin')
})
</script>
<template>
  <div class="panel-container">
    <div>
      <div class="title-bar">

        <div class="title">{{ info.titleName }}</div>
        <div class="date">{{ info.time }}</div>
      </div>
      <div class="detail">
        <div class="mean">
          <!-- <p class="title">均值</p>

          <p class="value">{{ info.jz }}</p> -->
          <div class="title">
            <div class="title-name">均值</div>
            <div class="unit">{{ store.legendData.unit }}</div>
          </div>
          <div class="value">
            {{ info.jz }}
          </div>
        </div>
        <div class="compare">
          <!-- <p class="title">同比</p>
          <p class="value">{{ info.tb }}</p>
          <img alt="" v-show="info.state" :src="info.stateValue > 1 ? upIcon : downIcon" /> -->
          <div class="title">
            <div class="title-name">同比</div>
            <div class="unit">%</div>
          </div>
          <div class="value">
            {{ info.tb }}
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="title-bar">

        <div class="title">{{ info.titleName }}分级面积占比</div>
        <div class="date">{{ info.time }}</div>
      </div>
      <AreaEcharts />
    </div>

    <a-button class="btn" @click="more" :disabled="isLoading">查看更多</a-button>
  </div>
</template>
<style lang="scss" scoped>
.panel-container {
  position: absolute;
  top: 22rem;
  right: 20rem;
  width: 420rem;
  height: 480rem;
  box-shadow: 0rem 0rem 8rem 0rem rgba(70, 93, 139, 0.4);
  background: #ffffff;
  box-sizing: border-box;
  padding-top: 10rem;
  color: black;
  border-radius: 8rem;

  .title-bar {
    height: 33rem;
    line-height: 33rem;
    background: url('@/assets/yaogan/image/titleBarBg.png') no-repeat;
    background-size: 100% 100%;
    padding-left: 32rem;

    .title {
      float: left;
      margin-left: 6rem;
      font-size: 16rem;
      font-family: MicrosoftYaHei-Bold-, MicrosoftYaHei-Bold;
      font-weight: bold;
      color: #333333;
    }

    .date {
      font-size: 14rem;
      font-family: PingFang SC, sans-serif;
      font-weight: 400;
      color: #465c86;
      float: right;
      margin-right: 16rem;
    }
  }


  .detail {
    height: 130rem;
    display: flex;
    justify-content: center;
    align-items: center;

    .mean,
    .compare {
      width: 170rem;
      height: 70rem;
      box-sizing: border-box;
      position: relative;

      .title {
        float: left;
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 10rem;

        .title-name {
          font-size: 14rem;
          font-family: MicrosoftYaHei-, MicrosoftYaHei;
          font-weight: normal;
          color: #FFFFFF;
        }

        .unit {
          font-size: 14rem;
          font-family: D-DIN-Regular, D-DIN;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.5);
          height: 22rem;
        }
      }

      .value {
        position: absolute;
        width: 81rem;
        height: 46rem;
        right: 10rem;
        top: 50%;
        margin-top: -23rem;
        text-align: center;
        line-height: 46rem;
        font-size: 28rem;
        font-family: D-DIN, DIN-Bold, D-DIN, DIN;
        font-weight: bold;
        color: #FFFFFF;
      }
    }

    .mean {
      background: url('@/assets/images/ecology/mean-value.png') no-repeat;
      background-size: 100% 100%;
    }

    .compare {
      position: relative;
      background: url('@/assets/images/ecology/yoy.png') no-repeat;
      background-size: 100% 100%;
      margin-left: 30rem;


    }
  }

  .noMessage {
    text-align: center;
    line-height: 100%;
  }

  .btn {
    width: 80rem;
    height: 28rem;
    background: #1989fa;
    border-radius: 14rem;
    font-size: 12rem;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: #ffffff;
    position: absolute;
    bottom: 20rem;
    left: 50%;
    margin-left: -40rem;
    border: 0;
    cursor: pointer;
  }

  .ant-btn[disabled] {
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.25);
    background: #f5f5f5;
  }
}
</style>
