<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { reactive, onMounted } from 'vue'
import { getTimeLabelAry, getDateAry } from '@/common/utilFns.js'

export default {
  name: '',
  props: {},
  components: {},
  setup(props, { attrs, slots, emit }) {
    const date3 = new Date()
    const startDay3 = date3.getDate()
    date3.setDate(startDay3)
    const today3 = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const PLAYTIME = 2000

    // 时间轴相关
    let myInterval = null // 播放定时器
    let maxTimeDom = null
    let curTimeDom = null
    let boxDom = null

    let dateIndex = 0
    let widthStep = 1

    const timeTipsState = reactive({
      playStatus: false,
      curClickTime: '',
      disabledTime: today3,
      defaultLeft: '',
      dateAry: [],
      timeLabelAry: []
    })

    const actionsState = reactive({
      loop(initTime) {
        //时间处理
        const timeAry = getTimeLabelAry(initTime)
        timeTipsState.timeLabelAry = timeAry
        const dateAry = getDateAry(initTime)
        timeTipsState.dateAry = dateAry
        const time = props.initialTime || dayjs().format('YYYY-MM-DD HH:mm:ss')
        const str = dayjs(time).format('YYYY-MM-DD HH:00')
        for (let i = 0; i < timeAry.length; i++) {
          if (timeAry[i] === str) {
            dateIndex = i
            break
          }
        }
        actionsState.updateCurTime()
      },
      clickTime(value, index) {
        const timeLabelAry = [...timeTipsState.timeLabelAry]
        if (timeTipsState.playStatus) {
          message.warning({
            content: '正在播放中,请暂停后再进行操作',
            duration: 1,
            onClick: () => message.destroy()
          })
          return
        }
        const findIndex = timeLabelAry.indexOf(value + ':00')
        if (dateIndex === findIndex) {
          return
        }
        dateIndex = findIndex
        actionsState.updateCurTime()
      },
      updateCurTime() {
        const timeLabelAry = [...timeTipsState.timeLabelAry]

        actionsState.setTimeProgress()
        if (timeLabelAry[dateIndex]) {
          timeTipsState.curClickTime = timeLabelAry[dateIndex]
          emit('setTimeParams', 'curClickTime', timeLabelAry[dateIndex])
        }
      },
      setTimeProgress() {
        const timeLabelAry = [...timeTipsState.timeLabelAry]
        if (maxTimeDom) {
          const length = timeLabelAry.length > 1 ? timeLabelAry.length : 2
          widthStep = maxTimeDom.clientWidth / length
          let width = widthStep * dateIndex
          curTimeDom.style.width = widthStep * dateIndex + 'px'
          if (dateIndex > timeLabelAry.length - 10) {
            boxDom.style.left = widthStep * (timeLabelAry.length - 10) + 64 + 'px'
          } else {
            boxDom.style.left = width + 64 + 'px'
          }
          // 当前数据的时间标记
          const index = timeLabelAry.indexOf(String(timeTipsState.disabledTime.split(':')[0]))
          if (index > -1) {
            const defaultLeft = widthStep * index + 'px'
            timeTipsState.defaultLeft = defaultLeft
          } else {
            timeTipsState.defaultLeft = '-100%'
          }
        }
      },
      durationMove(value, n) {
        const timeLabelAry = [...timeTipsState.timeLabelAry]
        const findIndex = timeLabelAry.indexOf(value + ':00')
        const hoverTip = document.getElementById('hoverTip')
        const index = findIndex
        let width = widthStep * index

        if (index > timeLabelAry.length - 1) {
          return
        }

        if (index > timeLabelAry.length - 10) {
          hoverTip.style.left = widthStep * (timeLabelAry.length - 10) + 64 + 'px'
        } else {
          hoverTip.style.left = width + 64 + 'px'
        }

        hoverTip.style.opacity = 1
        hoverTip.innerHTML = timeLabelAry[index] || ''
      },
      durationOut(v) {
        const hoverTip = document.getElementById('hoverTip')
        hoverTip.style.opacity = 0
      },
      handlePlay(value) {
        timeTipsState.playStatus = value
        const timeLabelAry = [...timeTipsState.timeLabelAry]
        const playStatus = value
        emit('setTimeParams', 'playStatus', playStatus)
        if (!playStatus) {
          window.clearInterval(myInterval)
        } else {
          if (dateIndex === timeLabelAry.length - 1) {
            dateIndex = 0
            actionsState.updateCurTime()
          }
          let ts = new Date()
          myInterval = setInterval(() => {
            const te = new Date()
            if (te - ts > PLAYTIME) {
              ts = te
              dateIndex = dateIndex + 1
              actionsState.updateCurTime()
              if (dateIndex >= timeLabelAry.length - 1) {
                window.clearInterval(myInterval)
                timeTipsState.playStatus = false
              }
            }
          }, 100)
        }
      }
    })

    onMounted(() => {
      maxTimeDom = document.getElementById('maxTime')
      curTimeDom = document.getElementById('curTime')
      boxDom = document.getElementById('box')

      // 时间轴自适应
      window.addEventListener('resize', () => {
        actionsState.setTimeProgress()
      })
      actionsState.loop(props.initialTime)

      timeTipsState.disabledTime = props.initialTime || dayjs().format('yyyy-MM-dd HH:mm:ss')
    })

    return { timeTipsState, actionsState }
  },
  unmounted() {}
}
</script>
<template>
  <div id="timePanel">
    <div class="playbtns">
      <span class="play" @click.stop="actionsState.handlePlay(!timeTipsState.playStatus)">
        <template v-if="timeTipsState.playStatus">
          <img src="@/assets/images/common-images/stop.png" alt="" />
        </template>
        <template v-else>
          <img src="@/assets/images/common-images/bof.png" alt="" />
        </template>
      </span>
    </div>

    <div class="timeDiv" id="timeAxis">
      <div class="maxTime" id="maxTime">
        <div id="move">
          <div class="moveing" id="box">
            <div class="box">{{ timeTipsState.curClickTime }}</div>
          </div>
          <div class="level" id="level"></div>
          <div class="hoverTip" id="hoverTip"></div>
        </div>
        <div class="curTimeColor" :styles="{ left: timeTipsState.defaultLeft }"></div>
      </div>
      <div class="maxTime2"></div>
      <div class="curTime" id="curTime"></div>
      <div class="date">
        <template v-for="(ele, i) in timeTipsState.dateAry" :key="i">
          <div class="clickable">
            <div class="duration">
              <template v-for="(item, index) in ele.hours" :key="index">
                <div
                  class="littleDuration"
                  @click.stop="
                    e => {
                      actionsState.clickTime(item, index, e)
                    }
                  "
                  @mousemove="
                    e => {
                      actionsState.durationMove(item, index, e)
                    }
                  "
                  @mouseout="
                    e => {
                      actionsState.durationOut(item, index, e)
                    }
                  "
                >
                  <span :class="index === 0 || index % 4 !== 0 ? 'none' : 'name'" style="left: -8px">{{
                    item.substr(11, 2)
                  }}</span>
                </div>
              </template>
            </div>
            <div class="durationName">{{ ele.name }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import './style.scss'; //导入样式
</style>
