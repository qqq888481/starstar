<script setup>
/*
时间轴组件
传入：所有周期、数据时间（vuex）、所有产品时间数据、当前产品时间（vuex）
传出：
 */
import { onMounted, onUnmounted, ref, toRefs, computed } from 'vue'
import { getNeedTime } from '@/views/1-ecology/0-yg/common/myComFn.js'

import { UnorderedListOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { yaoganStore } from '@/stores/yaogan.js'
import { message } from 'ant-design-vue'

const val = ref(['2021-Q2', '2022-Q5'])
let timer
const props = defineProps({
  panel: Object,
  cycleMap: Object,
  slider: Object,
  listMap: Object
})
const emit = defineEmits(['setValue', 'setSlider', 'changPanelTime', 'changeCircle'])

const store = yaoganStore()
const { satArr, cycleArr, curSat, curSensor, curCycle, sensorArr, senSorMap, satSenMap, time } = toRefs(props.panel)
const { max, min, marks, tipShow, value } = toRefs(props.slider)

const panelShow = ref(false)
const isPlay = computed(() => store.isPlay)
const changePanel = () => {
  panelShow.value = !panelShow.value
}
const closePanel = () => {
  panelShow.value = false
}
const tip = e => {
  if (props.listMap && props.listMap.get(e)) {
    const value = props.listMap.get(e).issue
    if (curCycle.value) {
      return getNeedTime(curCycle.value, value)
    }
  }
  return null
}

const sliderChange = val => {
  //改变sliderValue值，暂停播放
  emit('setSlider', val)

  stop()
}
const next = () => {
  // 上一个；时次
  if (value.value >= max.value) {
    message.info('已是最后一个')
  } else {
    emit('setSlider', value.value + 1)
  }
}

const prev = () => {
  // 下一个；时次
  if (value.value <= min.value) {
    message.info('已是第一个')
  } else {
    emit('setSlider', value.value - 1)
  }
}

const play = () => {
  // 开始播放,清除tif、展示图片
  // 定时器，开始每隔几秒播放产品
  if (max.value == 0) {
    message.info('仅有一期产品')
  } else {
    store.setIsPlay(true)
    let test = value.value
    if (test === max.value) {
      if (isPlay.value === false) {
        return
      }
      test = -1
    }
    function changeIndex() {
      if (test >= max.value) {
        store.setIsPlay(false)
        clearInterval(timer)
        message.info('播放完毕')
        return
      } else {
        test++
      }
      emit('setSlider', test)
    }
    changeIndex() //手动执行一次，否则第一次执行会延迟几秒，动画不连续
    timer = setInterval(changeIndex, 1000)
  }
}
const stop = () => {
  // 暂停播放，清除图片展示tif
  store.setIsPlay(false)
  clearInterval(timer)
}
//面板change事件
const change = (e, type) => {
  switch (type) {
    case 'cycle':
      emit('setValue', type, e)
      emit('changeCircle')
      // setcycle(e)
      break
    case 'sat':
      emit('setValue', type, e)
      // setSat(e)
      const sat = satSenMap.value.get(e)
      emit('setValue', 'sensor', sat[0].sensor)
      emit('setValue', 'cycleArr', sat[0].cycle)
      emit('setValue', 'cycle', sat[0].cycle[0])
      // setsensor(sat[0].sensor)
      // setcycleArr(sat[0].cycle)
      // setcycle(sat[0].cycle[0])
      const sensorArr = []
      for (let i of sat) {
        emit('setValue', 'senSorMap', [i.sensor, i.cycle])
        // senSorMap.set(sat[i].sensor, sat[i].cycle)
        sensorArr.push(i.sensor)
      }
      emit('setValue', 'sensorArr', sensorArr)
      // setsensorArr(sensorArr)
      break
    case 'sensor':
      // setsensor(e.sensor)
      emit('setValue', type, e.sensor)

      const arr = senSorMap.value.get(e.sensor)
      emit('setValue', 'cycleArr', arr.cycle)
      emit('setValue', 'cycle', arr.cycle[0])
      // setcycleArr(arr.cycle)
      // setcycle(arr.cycle[0])
      break
    default:
      break
  }
}
const timeChange = (dates, dateStrings) => {
  const cha = dates[1].valueOf() - dates[0].valueOf()
  const days = Math.floor(cha / (24 * 3600 * 1000))

  let flag = true
  switch (curCycle.value) {
    case 'COOD':
      if (days > 90) {
        message.info('超出时间范围,请选择90天以内')
        flag = false
      }
      break
    case 'COOH':
      if (days > 30) {
        message.info('超出时间范围,请选择30天以内')
        flag = false
      }
      break
    case 'COAM':
      if (days > 730) {
        message.info('超出时间范围,请选择2年以内')
        flag = false
      }
      break
    case 'COAQ':
      if (days > 365 * 5) {
        message.info('超出时间范围,请选择5年以内')
        flag = false
      }
      break

    case 'COAY':
      if (days > 365 * 20) {
        message.info('超出时间范围,请选择20年以内')
        flag = false
      }
      break

    default:
      break
  }
  if (flag) {
    switch (dateStrings[0].length) {
      case 4:
        dateStrings = [dateStrings[0] + '-01-01 00:00', dateStrings[1] + '-12-31 00:00']
        break
      case 7:
        if (store.curProduct?.id === '3305215241134940160') {
          break
        }
        dateStrings = [dateStrings[0] + '-01 00:00', dateStrings[1] + '-01 00:00']
        break
      case 10:
        dateStrings = [dateStrings[0] + '  00:00', dateStrings[1] + '  23:59']
        break

      default:
        break
    }
    // setTime(dateStrings)
    emit('setValue', 'time', dateStrings)
    emit('changPanelTime')
  }
}
function getQuarter(data) {
  //季度转月份
  const quarter = data.substr(-2, 2)
  const year = data.substr(0, 5)
  switch (quarter) {
    case 'Q1':
      return year + '01'
    case 'Q2':
      return year + '05'
    case 'Q3':
      return year + '08'
    case 'Q4':
      return year + '11'
  }
}
defineExpose({
  closePanel
})

onMounted(() => {})

onUnmounted(() => {
  // 记得清除定时器
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div id="TimeLine">
    <a-button type="link">
      <template #icon>
        <img v-show="!isPlay" src="@/assets/yaogan/image/anniu1.png" alt="" @click="play" />
        <img v-show="isPlay" src="@/assets/yaogan/image/10610.png" alt="" @click="stop" /> </template
    ></a-button>
    <div class="liebiao">
      <unordered-list-outlined class="unordered" @click="changePanel" />
    </div>
    <a-slider
      v-if="max !== 0"
      :value="value"
      :marks="marks"
      :tip-formatter="e => tip(e)"
      :max="max"
      :min="min"
      :disabled="!(max > 0)"
      :tooltipVisible="tipShow"
      @change="sliderChange"
    >
    </a-slider>
    <a-slider
      v-else-if="marks && max === 0"
      :value="value"
      :marks="marks"
      :disabled="true"
      :tooltipVisible="false"
      @change="sliderChange"
      class="slider-empty"
    >
    </a-slider>
    <div class="panel" v-show="panelShow">
      <section v-show="false">
        <span>卫星：</span>
        <a-select style="width: 300rem" :value="curSat" @change="e => change(e, 'sat')">
          <a-select-option v-for="(item, index) in satArr" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </section>
      <section v-show="false">
        <span>传感器：</span>
        <a-select style="width: 300rem" :value="curSensor" @change="e => change(e, 'sensor')">
          <a-select-option v-for="(item, index) in sensorArr" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </section>
      <section>
        <span>周期：</span>
        <a-select style="width: 300rem" :value="curCycle" @change="e => change(e, 'cycle')">
          <a-select-option v-for="(item, index) in cycleArr" :key="index" :value="item">
            {{ cycleMap.get(item) }}
          </a-select-option>
        </a-select>
      </section>
      <section>
        <span>时间：</span>
        <template v-if="curCycle === 'COEY' || curCycle === 'COOM' || curCycle === 'COTM' || curCycle === 'COOH'">
          <a-range-picker
            :allowClear="false"
            class="time"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            @change="timeChange"
            :value="[dayjs(time[0], 'YYYY-MM-DD HH:mm'), dayjs(time[1], 'YYYY-MM-DD HH:mm')]"
          />
        </template>
        <template v-else-if="curCycle === 'COOD' || curCycle === 'COFD' || curCycle === 'COAW' || curCycle === 'COTD'">
          <a-range-picker
            :allowClear="false"
            class="time"
            format="YYYY-MM-DD"
            @change="timeChange"
            :value="[dayjs(time[0], 'YYYY-MM-DD '), dayjs(time[1], 'YYYY-MM-DD ')]"
          />
        </template>
        <template v-else-if="curCycle === 'COAQ' || curCycle === 'COAM'">
          <!-- 裸地 -->
          <a-range-picker
            v-if="store.curProduct?.id === '3305215241134940160'"
            :allowClear="false"
            class="time"
            picker="quarter"
            @change="timeChange"
            :value="[dayjs(getQuarter(time[0]), 'YYYY-MM'), dayjs(getQuarter(time[1]), 'YYYY-MM')]"
          />
          <a-range-picker
            v-else
            :allowClear="false"
            class="time"
            picker="month"
            format="YYYY-MM"
            @change="timeChange"
            :value="[dayjs(time[0], 'YYYY-MM'), dayjs(time[1], 'YYYY-MM')]"
          />
        </template>
        <template v-else-if="curCycle === 'COAY'">
          <a-range-picker
            :allowClear="false"
            class="time"
            picker="year"
            format="YYYY"
            @change="timeChange"
            :value="[dayjs(time[0], 'YYYY'), dayjs(time[1], 'YYYY')]"
          />
        </template>
        <template v-else>
          <a-range-picker
            :allowClear="false"
            class="time"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            @change="timeChange"
            :value="[dayjs(time[0], 'YYYY-MM-DD HH:mm'), dayjs(time[1], 'YYYY-MM-DD HH:mm')]"
          />
        </template>
      </section>
    </div>
  </div>
</template>

<style lang="scss">
#TimeLine {
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
  height: 60rem;
  border-radius: 5rem;
  width: calc(100% - 500rem);
  position: absolute;
  left: 15rem;
  bottom: 15rem;
  display: grid;
  align-items: center;
  justify-items: center;
  // grid-template-columns: 40px 50px 40px 60px auto;
  grid-template-columns: 50px 60px auto;

  .ant-slider-with-marks {
    margin: 0px 6px 15px;
    width: 90%;
  }
  .slider-empty {
    width: 0;
  }
  .ant-slider-mark-text {
    color: #fff;
    width: 130rem;
  }

  .ant-slider-track {
    background-color: #32dfff;
  }
  .liebiao {
    color: #32dfff;
    height: 100%;
    line-height: 60rem;
    width: 60rem;
    text-align: center;
    border-left: 1px solid rgb(47, 68, 78);
    border-right: 1px solid rgb(47, 68, 78);
    font-weight: 900;
    font-size: 20rem;
    .unordered {
      cursor: pointer;
    }
  }
  .panel {
    position: absolute;
    bottom: 60rem;
    left: 50rem;
    background: rgba($color: #061b2c, $alpha: 1);
    font-size: 12px;
    display: grid;
    align-items: center;
    justify-items: center;
    z-index: 10;
    width: 70rem;

    .time {
      width: 100%;

      input {
        text-overflow: ellipsis;
      }
    }

    .sure {
      justify-self: end;
    }

    section {
      border-top: 1px solid #061b2c;
      width: 100%;
      color: #fff;
      display: grid;
      grid-template-columns: 70px auto;
      align-items: center;
      justify-items: center;

      .ant-picker,
      .ant-select-selector,
      .ant-picker-input > input {
        background: rgba($color: #061b2c, $alpha: 0.7);
        border: 1px solid #061b2c;
        color: #fff;
        font-size: 12px;
      }

      .anticon {
        color: #fff;
      }
    }
  }
}
</style>
