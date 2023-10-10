<script setup>

import { onMounted, onUnmounted, reactive, ref, computed, watch, toRefs, nextTick } from 'vue'
import { ecologyStore } from '@/stores/ecology.js'
import { getNeedTime } from '@/common/dataFn.js'
import beginIcon from '@/assets/images/common-images/begin.png'
import stopIcon from '@/assets/images/common-images/stop1.png'
import timeLabelIcon from '@/assets/yaogan/image/timeLabel.png'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
const props = defineProps({
  panel: Object
})
const router = useRouter()
const newStore = ecologyStore()
const { panel } = toRefs(props)
let timer //定时器
const select = reactive({
  // dateString: [dayjs('2022-03', 'YYYY-MM'), dayjs('2022-07', 'YYYY-MM')], //期次
  dateString: [],//期次
  // dateValue: dayjs('2023-01', 'YYYY-MM'),
  dateValue: null,
  indicatorValue: 1,
  curTime: [],
  allTime: []
})

const picker = ref(null)
const playState = ref(false)
const timeList = ref([])
const curSliderIndex = ref(null)
const timePaddingStyle = ref(null)
const timeShowStyle = ref(null)
//根据路由跳转来设置当跳转到功能评价和其他路由时时间轴的总长度
let timeLineStyle = computed(() => {
  if (router.currentRoute.value.path == '/eco-service-assessment') {
    // if (JSON.stringify(newStore.curArea) !== '{}') {
    //   if (newStore.curArea?.fullname == '济南市') {
    //     return '445rem'
    //   } else {
    //     return '15rem'
    //   }
    // }
    return '457rem'
  } else {
    return '20rem'
  }
})

/**
 * 获取到当前时间以及所点击的节点处的offsetLeft,以使滑条滑到当前位置
 * @param {} param
 * @param {*} e
 */
const getCurrentTime = (param, index) => {

  curSliderIndex.value = index
  if (!timeList.value[curSliderIndex.value]) {
    return
  }
  newStore.setIssue(timeList.value[curSliderIndex.value].issue)
  let leftPosition = document.getElementById('slider' + index).getBoundingClientRect().left - 20
  // console.log(document.getElementById('slider' + index).getBoundingClientRect().left, 'rgrt')
  document.getElementById('timeSlider').style.width = leftPosition + 'rem'
  document.getElementById('timeCircle').style.left = leftPosition - 6.5 + 'rem'
  document.getElementById('timeLabel').style.left = leftPosition - 38.53 + 'rem'

  //根据当前issue改变Map数据
  panel.value.getCurrentMap(param)
  if (router.currentRoute.value.path == '/eco-service-assessment') {
    panel.value.getEvalutionValue(param)
  }

}

watch(
  () => newStore.curTime,
  () => {
    //截取时间字符串
    //判断是年还是月 并做相应的更改
    if (!newStore.curTime) {
      return
    }
    const time1 = slitTime(newStore.curTime[0], newStore.curProduct.cycle)
    const time2 = slitTime(newStore.curTime[1], newStore.curProduct.cycle)
    switch (newStore.curProduct.cycle) {
      case 'COAM':
        select.dateString = [dayjs(time1, 'YYYY-MM'), dayjs(time2, 'YYYY-MM')]
        picker.value = 'month'
        timePaddingStyle.value = { 'padding-left': '435rem', 'padding-right': '25rem' }
        timeShowStyle.value = { left: '-20rem', top: '10rem', width: '50rem' }
        break
      case 'COAY':
        select.dateString = [dayjs(time1, 'YYYY'), dayjs(time2, 'YYYY')]
        picker.value = 'year'
        timePaddingStyle.value = { 'padding-left': '427rem', 'padding-right': '17rem' }
        timeShowStyle.value = { left: '-10rem', top: '10rem', width: '30rem' }
    }
    select.allTime = [time1, time2]
  }
)
/**更改时间 */
const timeChange = (value, dateString) => {
  //根据当前时间获取12进制时间戳
  let time1 = dateString[0]
  let time2 = dateString[1]

  switch (newStore.curProduct.cycle) {
    case 'COAM':
      newStore.curTime2 = [time1.replace('-', '') + '010000', time2.replace('-', '') + '010000']
      break
    case 'COAY':
      newStore.curTime2 = [time1.replace('-', '') + '01010000', time2.replace('-', '') + '12310000']
      picker.value = 'year'
  }
}

/**
 * 截取时间字符串
 */
const slitTime = (time, cycle) => {
  let timeArr = time.split('-')
  switch (cycle) {
    case 'COAM':
      return timeArr[0] + '-' + timeArr[1]
      break
    case 'COAY':
      return timeArr[0]
  }
}

/**
 * 改变播放状态
 */
const playTime = () => {

  playState.value = !playState.value

  if (playState.value) {

    //点击开始播放的时候
    if (timeList.value.length) {
      if (timeList.value.length == 1) {
        message.info('仅有一期产品')
        return
      } else {

        if (curSliderIndex.value == timeList.value.length - 1) {//如果时间轴长度

          curSliderIndex.value = -1
        }
        timer = setInterval(changeIndex, 1000)
        function changeIndex() {

          curSliderIndex.value += 1
          getCurrentTime(timeList.value[curSliderIndex.value]?.issue, curSliderIndex.value)
          if (curSliderIndex.value == timeList.value.length - 1) {

            playState.value = false

            message.info('播放完毕')
            clearInterval(timer)

          }
        }
        changeIndex()

      }
    } else {
      message.info('无可播放产品')
    }
  } else {
    //暂停的时候
    clearInterval(timer)

  }

}

watch(
  () => newStore.curTime2,
  () => {
    //获取地图数据
    if (!newStore.curTime2) {
      return
    }
    panel.value.getPrdList(
      newStore.curProduct.id,
      newStore.curTime2[0],
      newStore.curTime2[1],
      newStore.curProduct.cycle,
      newStore.curArea.regionid,
      [2, 2.1],
      1,
      10000
    )
  }
)
watch(
  () => newStore.curArea,
  () => {
    if (newStore.curTime2) {
      panel.value.getPrdList(
        newStore.curProduct.id,
        newStore.curTime2[0],
        newStore.curTime2[1],
        newStore.curProduct.cycle,
        newStore.curArea.regionid,
        [2, 2.1],
        1,
        10000
      )
    }
  }
)
watch(
  () => newStore.timeList,
  () => {
    if (newStore.timeList && newStore.timeList.length) {
      // console.log(newStore.timeList[0].split(''))

      let newTimeStr
      let remainder
      let timestrShow
      timeList.value = []

      newStore.timeList.map((item, index) => {
        if (!item.issue) {
          return
        }
        newTimeStr = getSliderItem(newStore.curProduct.cycle, item.issue, item.issue.split(''))
        //判断当前索引+1是否是10的倍数

        if (newStore.timeList.length > 12) {
          remainder = index % Math.ceil(newStore.timeList.length / 12)

          if (remainder === 0) {

            timestrShow = true
          } else {
            timestrShow = false
          }
        } else {
          timestrShow = true
        }
        timeList.value.push({
          issue: item.issue,
          showTime: newTimeStr,
          issueFiles: item.issueFiles,
          timeShow: timestrShow
        })
      })


      nextTick(() => {
        //判断上次点击的时间在当前时间列表中是否存在,存在的话就先渲染上次点击的时间期次,否则就默认最后一期
        //let index = timeList.value.indexOf(newStore.issue)
        let exitIndex = -1

        for (let i = 0; i < timeList.value.length; i++) {
          if (timeList.value[i].issue === newStore.issue) {
            exitIndex = i

          }
        }

        if (exitIndex == -1) {
          //表示当前时间列表中不包含有上次点击的期次
          curSliderIndex.value = timeList.value.length - 1
          newStore.setIssue(timeList.value[curSliderIndex.value]?.issue)
          getCurrentTime(timeList.value[timeList.value.length - 1]?.issue, timeList.value.length - 1)
        } else {

          //index代表上次点击的时间在当前时间列表中的索引

          curSliderIndex.value = exitIndex
          newStore.setIssue(timeList.value[exitIndex]?.issue)
          getCurrentTime(timeList.value[exitIndex]?.issue, exitIndex)
        }

      })
    } else {
      timeList.value = []
      curSliderIndex.value = null
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

const exitSlider = () => {
  if (timeList.value.length) {
    if (timeList.value.length == 1) {
      message.info('仅有一期产品')
    } else {
      if (curSliderIndex.value == 0) {
        message.info('已是第一期产品')
      } else {
        curSliderIndex.value -= 1
        getCurrentTime(timeList.value[curSliderIndex.value]?.issue, curSliderIndex.value)
      }
    }
  } else {
    message.info('无可播放产品')
  }
}
const formatSlider = () => {
  if (timeList.value.length) {
    if (timeList.value.length == 1) {
      message.info('仅有一期产品')
    } else {
      if (curSliderIndex.value == timeList.value.length - 1) {
        message.info('已是最后一期产品')
      } else {
        curSliderIndex.value += 1
        getCurrentTime(timeList.value[curSliderIndex.value]?.issue, curSliderIndex.value)
      }
    }
  } else {
    message.info('无可播放产品')
  }
}
onMounted(() => {
  window.addEventListener('resize', function () {
    let leftPosition = document.getElementById('slider' + curSliderIndex.value).getBoundingClientRect().left - 20

    document.getElementById('timeSlider').style.width = leftPosition + 'rem'
    document.getElementById('timeCircle').style.left = leftPosition - 6.5 + 'rem'
    document.getElementById('timeLabel').style.left = leftPosition - 38.53 + 'rem'
  })
})
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
<template>
  <div class="timeLineContainer" id="timeContainer" :style="{ right: timeLineStyle }">
    <div class="btn">
      <img src="@\assets\images\common-images\back.png" @click="exitSlider" />
      <img :src="playState ? stopIcon : beginIcon" alt="" class="playBtn" @click="playTime" />
      <img src="@\assets\images\common-images\forward.png" @click="formatSlider" />
    </div>
    <div class="timePicker">
      <a-range-picker v-model:value="select.dateString" :picker="picker" class="pick" @change="timeChange" />
    </div>
    <div class="timeLine" :class="timeList.length > 1 ? 'asideBar' : 'centerBar'" :style="timePaddingStyle">
      <div v-for="(item, index) in timeList" :key="index" class="singleBar"
        @click="getCurrentTime(item.issue, index, $event)" :style="{ color: item.issueFiles ? '#6E7580' : '#B7BCC5 ' }">
        <div :id="`slider${index}`"
          :class="item.timeShow ? (curSliderIndex >= index ? 'activeBar' : 'defaultBar') : 'noColorBar'"
          style="{position:absolute;top:10rem;left:-5rem}"></div>
        <!-- {{ item.timeShow ? item.showTime : '' }} -->
        <!-- <div style="position:absolute;transform:translate(50%,50%)">2021</div> -->
        <div style="position:absolute" :style="timeShowStyle">{{ item.timeShow ? item.showTime : '' }} </div>
      </div>
      <div id="timeSlider" v-show="timeList.length > 0"></div>
      <div id="timeCircle" v-show="timeList.length > 0"></div>
      <div id="timeLabel" v-show="timeList.length > 0">
        <!-- <img :src=timeLabelIcon alt="" /> -->
        <div>{{ timeList[curSliderIndex]?.issueFiles ? timeList[curSliderIndex]?.showTime : '无数据' }}</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
* {
  box-sizing: border-box;
}

.timeLineContainer {
  height: 48rem;
  background: #ffffff;
  box-shadow: 0rem 0rem 5rem 0rem rgba(70, 93, 139, 0.25);
  border-radius: 5rem;
  position: absolute;
  bottom: 22rem;
  left: 20rem;
  right: 20rem;
  right: 0;
  padding: 12rem 0;

  .ant-picker-input>input {
    font-size: 12rem;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: #666666;
  }

  .ant-picker-header>button:hover {
    color: rgba(0, 0, 0, 1);
  }

  .ant-picker-header>button {
    min-width: 2em;
    font-size: 18rem;
  }

  .ant-picker-header button {
    color: rgba(0, 0, 0, 0.55);
  }

  //按钮
  .btn {
    position: absolute;
    left: 0;
    top: 15.98rem;
    bottom: 10rem;
    width: 151rem;
    float: left;

    border-right: 1.05rem solid #CDD3EC;

    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 13;

    img {
      cursor: pointer;
    }

    .playBtn {
      margin: 0 16rem;
      width: 16rem;
      height: 16rem;
    }
  }

  //时间选择区
  .timePicker {
    position: absolute;

    z-index: 13;
    left: 151rem;
    top: 15.98rem;
    bottom: 10rem;
    width: 252rem;

    border-right: 1.05rem solid #CDD3EC;
    display: flex;
    justify-content: center;
    align-items: center;

    .pick {
      width: 202rem;
      height: 28rem;
    }



  }

  //时间轴
  .timeLine {
    position: absolute;
    top: 0rem;
    right: 0;
    left: 0;
    height: 100%;
    border-top: 5.98rem solid #E2E7EC;
    display: flex;
    // padding-left: 410rem;
    // padding-right: 6rem;
    pointer-events: visiblePainted;
    //justify-content: space-around;

    .singleBar {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 10rem;
      font-family: PingFangSC-Regular-, PingFangSC-Regular;
      font-weight: normal;
      cursor: pointer;

      width: 10rem;
      position: relative;
    }

    .hiddenBar {
      position: absolute;
      width: 10rem;
      height: 10rem;
      background: rgba(255, 255, 255, 0);
      top: -4rem;
    }


    .noColorBar {
      // background: rgba(255, 255, 255, 0);
      background: #03aaf4;
      width: 1rem;
      height: 4rem;
      margin-top: 4rem;
      cursor: pointer;
      z-index: 13;
    }

    .activeBar {
      background: #03aaf4;
      width: 1rem;
      height: 4rem;
      margin-top: 4rem;
      cursor: pointer;
      z-index: 12;
    }

    .defaultBar {
      background: #eeeeee;
      width: 1rem;
      height: 4rem;
      margin-top: 4rem;
      cursor: pointer;
      z-index: 12;
    }

    #timeSlider {
      position: absolute;
      left: 0rem;
      height: 4rem;
      top: -4rem;

      background-color: #03aaf4;
      border-radius: 2rem;
    }

    #timeCircle {
      width: 14rem;
      height: 14rem;
      border-radius: 7rem;
      background-color: #ffffff;
      border: 2.5rem solid #32c5ff;
      position: absolute;
      top: -9.5rem;
      z-index: 12;
    }

    #timeLabel {
      position: absolute;
      width: 79rem;
      height: 37rem;
      top: -45rem;
      z-index: 13;
      box-shadow: 0rem 4rem 8rem 1rem rgba(0, 0, 0, 0.22);
      opacity: 0.95;
      background: url('@/assets/yaogan/image/timeLabel.png') no-repeat;
      background-size: cover;
      text-align: center;
      line-height: 37rem;
      font-size: 12rem;
      font-family: PingFangSC-Regular-, PingFangSC-Regular;
      font-weight: 400;
      color: #ffffff;
      padding: 0;
    }
  }

  .asideBar {
    justify-content: space-between;
  }

  .centerBar {
    justify-content: center;
  }
}


.bigBar {
  right: 15rem;
}

.smallBar {
  right: 445rem;
}
</style>
