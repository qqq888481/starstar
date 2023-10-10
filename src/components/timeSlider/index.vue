<template>
  <!-- <TimeSlider @changeSlider='fun' @changeDate='fun' :defalutTime='defalutTime' type='days'></TimeSlider> 
        changeSlider为点击滑动条时间方法 返回当前时间
        changeDate为起始时间方法，返回起始时间,如果不传changeDate可以通过ref组件方式获取nowTime值
        defalutTime默认时间  不传则为当前时间
        type时间轴类型 默认为四小时逐日类型hours
    -->
  <div id="time-line-slider">
    <div :class="timeSliderType == 'hours' ? 'top-tip-hours-list' : 'top-tip-days-list'">
      <div v-for="(time, index) in hoursList" :key="index" class="tip-box">
        <div class="tip-content" v-show="nowTimeIndex == index">
          {{ getTipShowTime(time) }}
        </div>
      </div>
    </div>
    <div class="bottom-slider">
      <div class="left-control">
        <div @click="changeStep(-1, true)"><img src="./left.png" alt="" /></div>
        <div v-show="!nowPlayStatus" @click="startPlay(true)"><img src="./play.png" alt="" /></div>
        <div v-show="nowPlayStatus" @click="stopPlay()"><img src="./stop.png" alt="" /></div>
        <div @click="changeStep(1, true)"><img src="./right.png" alt="" /></div>
      </div>
      <div class="time">
        <a-date-picker
          :disabled="nowPlayStatus"
          style="width: 100%"
          v-model:value="nowTime"
          valueFormat="YYYY-MM-DD"
          @change="changeDate(timeSliderType)"
        />
      </div>
      <div class="slider">
        <div class="top-color-line" ref="colorLine">
          <div class="line" :style="'width:' + lineWidth + 'px'"></div>
          <div class="circle"></div>
        </div>
        <div class="time-content" v-show="timeSliderType == 'hours'">
          <div
            v-for="(time, index) in hoursList"
            :key="index"
            :data-time="nowTime + ' ' + time.text"
            class="time-text"
            @click="changeSliderShow(time, index, true)"
          >
            <div class="column-line" v-show="index % 6 != 0">{{ time.text }}</div>
          </div>
        </div>
        <div class="time-hour" v-show="timeSliderType == 'hours'">
          <div class="day-list" v-for="(time, index) in dayList" :key="index">{{ time }}</div>
        </div>
        <div class="time-day" v-show="timeSliderType == 'days'">
          <div
            class="day-list"
            v-for="(time, index) in hoursList"
            :key="index"
            @click="changeSliderShow(time, index, true)"
          >
            <div class="line"></div>
            <div class="time-text">{{ time.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, toRefs, onMounted, nextTick, onUnmounted } from 'vue'
import TIME from '@/config/getTime/index.js' //获取时间类
let sliderTime = null
export default {
  setup(props, { attrs, emit }) {
    let colorLine = ref()
    let mail = reactive({
      nowTime: '', //当前时间轴显示时间开始点
      changeDate(type) {
        //开始日期修改方法
        mail.lineWidth = 0
        mail.nowTimeIndex = 0
        let sevendDay = [
          //当前时间后七天时间
          TIME.getNeedTime({ needData: mail.nowTime, needChangeNum: 0, needReturnType: 'day' }),
          TIME.getNeedTime({ needData: mail.nowTime, needChangeNum: 1, needReturnType: 'day' }),
          TIME.getNeedTime({ needData: mail.nowTime, needChangeNum: 2, needReturnType: 'day' }),
          TIME.getNeedTime({ needData: mail.nowTime, needChangeNum: 3, needReturnType: 'day' }),
          TIME.getNeedTime({ needData: mail.nowTime, needChangeNum: 4, needReturnType: 'day' }),
          TIME.getNeedTime({ needData: mail.nowTime, needChangeNum: 5, needReturnType: 'day' }),
          TIME.getNeedTime({ needData: mail.nowTime, needChangeNum: 6, needReturnType: 'day' })
        ]
        mail.hoursList = []
        mail.dayList = []
        if (type == 'hours') {
          sevendDay.map((day, index) => {
            for (let i = 0; i <= 20; i += 4) {
              let hour = i <= 10 ? '0' + i : i
              mail.hoursList.push({
                time: day + ' ' + hour,
                text: i
              })
            }
            mail.dayList.push(TIME.getWeekDay(day) + '（' + day.slice(5, 10) + '）')
          })
          mail.hoursList.push({
            //额外加上第八天0点
            time: TIME.getNeedTime({ needData: mail.nowTime, needChangeNum: 7, needReturnType: 'day' }) + ' 00',
            text: 0
          })
        } else if (type == 'days') {
          sevendDay.map((day, index) => {
            mail.hoursList.push({
              time: day,
              text: 0
            })
          })
        }
        emit('changeDate', mail.nowTime)
        mail.changeSliderShow(mail.hoursList[0], 0, false)
      }, //时间控件改变点
      lineWidth: 0, //滑动条长度
      nowTimeIndex: 0, //当前滑动条指向小时的index
      getTipShowTime(time) {
        //tip框显示时间
        if (mail.timeSliderType == 'hours') {
          return time.time + '时' // + ' ' + time.text
        } else if (mail.timeSliderType == 'days') {
          return time.time.slice(0, 10)
        }
      },
      changeSliderShow(time, index, status) {
        //修改显示滑动条长度
        if (mail.nowPlayStatus && status) return
        if (mail.timeSliderType == 'hours') {
          mail.lineWidth = ((colorLine.value.clientWidth - 10) / 42) * index
        } else if (mail.timeSliderType == 'days') {
          mail.lineWidth = (colorLine.value.clientWidth / 7) * index + colorLine.value.clientWidth / 14
        }
        mail.nowTimeIndex = index
        emit('changeSlider', time.time, mail.nowTime, status)
      },
      timeSliderType: '', //hours四小时时间轴  days天时间轴
      nowPlayStatus: false, //当前播放状态
      changeStep(type, status) {
        //点击时判断当前是否在播放状态 其次判断是否在第一个时刻或者最后一个时刻
        if (mail.nowPlayStatus && status) return
        if (
          (mail.timeSliderType == 'hours' && type == 1 && mail.nowTimeIndex >= 42) ||
          (mail.timeSliderType == 'days' && type == 1 && mail.nowTimeIndex >= 6)
        )
          return
        if (type == -1 && mail.nowTimeIndex <= 0) return
        mail.nowTimeIndex += type
        mail.changeSliderShow(mail.hoursList[mail.nowTimeIndex], mail.nowTimeIndex)
      },
      startPlay(type) {
        //播放
        mail.nowPlayStatus = true
        if (
          (type && mail.timeSliderType == 'hours' && mail.nowTimeIndex == 42) ||
          (type && mail.timeSliderType == 'days' && mail.nowTimeIndex == 6)
        ) {
          //播放结束时在次播放从头开始并停第一时间一秒
          mail.changeSliderShow(mail.hoursList[0], 0)
          setTimeout(() => {
            mail.startPlay(false)
          }, 1000)
          return
        }
        mail.changeStep(1) //自动加1下一步
        sliderTime = setTimeout(() => {
          if (
            (mail.timeSliderType == 'hours' && mail.nowTimeIndex < 42) ||
            (mail.timeSliderType == 'days' && mail.nowTimeIndex < 6)
          ) {
            mail.startPlay(false)
          } else {
            mail.stopPlay()
          }
        }, 1000)
      },
      stopPlay() {
        //暂停播放
        mail.nowPlayStatus = false
        clearTimeout(sliderTime)
        sliderTime = null
      },
      hoursList: [], //时间轴小时列表
      dayList: [] //时间轴下方星期列表
    })

    onMounted(() => {
      mail.timeSliderType = attrs.type == 'hours' || attrs.type == 'days' ? attrs.type : 'hours' //设置时间轴类型
      mail.nowTime = attrs.defalutTime
        ? attrs.defalutTime
        : TIME.getNeedTime({ needChangeNum: 0, needReturnType: 'day' }) //设置当前时间后七天
      mail.changeDate(mail.timeSliderType) //默认触发当前第一时间的事件
    })
    onUnmounted(() => {})
    return {
      ...toRefs(mail),
      colorLine
    }
  }
}
</script>

<style lang="scss">
#time-line-slider {
  .top-tip-days-list {
    justify-content: space-around !important;
    margin-left: 5rem !important;
    .tip-box:last-child {
      .tip-content {
        transform: translateX(-50%) !important;
      }
      .tip-content::after {
        left: 50% !important;
      }
    }
  }
  .top-tip-hours-list,
  .top-tip-days-list {
    height: 40rem;
    display: flex;
    pointer-events: none;
    padding-left: 340rem;
    justify-content: space-between;
    background-color: transparent;
    .tip-box {
      width: 10px;
      .tip-content {
        position: absolute;
        width: 130rem;
        height: 30rem;
        background-color: #1c85ef;
        color: white;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
      }
      .tip-content::after {
        content: '';
        width: 10rem;
        height: 10rem;
        background-color: #1c85ef;
        transform-origin: 50% 50%;
        transform: rotate(45deg);
        position: absolute;
        top: 80%;
        left: 47%;
      }
    }
    .tip-box:last-child {
      .tip-content {
        transform: translateX(-90%);
      }
      .tip-content::after {
        left: 86%;
      }
    }
  }
  .bottom-slider {
    width: 100%;
    height: 50rem;
    display: flex;
    color: #b7bcc5;
    background-color: #fff;
    .left-control {
      width: 120rem;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-around;
      margin-right: 20rem;
      div {
        cursor: pointer;
      }
    }
    .time {
      width: 180rem;
      height: 100%;
      display: flex;
      align-items: center;
      margin-right: 20rem;
    }
    .slider {
      width: calc(100% - 340rem);
      height: 100%;
      .top-color-line {
        width: 100%;
        height: 5rem;
        display: flex;
        margin-bottom: 5rem;
        background-color: #e2e7ec;
        .line {
          background-color: #32c5ff;
          height: 100%;
          border-radius: 2px;
          transition: 0.3s;
        }
        .circle {
          width: 10rem;
          height: 10rem;
          border-radius: 50%;
          border: 2px solid #32c5ff;
          background-color: white;
          transform: translate(-50%, -30%);
        }
      }
      .time-content {
        width: calc(100%);
        height: 20rem;
        display: flex;
        justify-content: space-between;
        .time-text:nth-of-type(6n + 1) {
          height: 100%;
        }
        .time-text {
          width: 10px;
          height: 30%;
          border-left: 1px solid #b7bcc5;
          cursor: pointer;
          position: relative;
          .column-line {
            position: absolute;
            transform: translate(-50%, 10%);
          }
        }
      }
      .time-day {
        width: 100%;
        display: flex;
        height: calc(100% - 10rem);
        justify-content: space-around;
        border-left: 1px solid #b7bcc5;
        border-right: 1px solid #b7bcc5;
        .day-list {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          flex: 1;
          .line {
            width: 1px;
            height: 10px;
            background-color: #b7bcc5;
          }
          .time-text {
            height: 30%;
          }
        }
      }
      .time-hour {
        display: flex;
        height: calc(100% - 30rem);
        justify-content: space-around;
        .day-list {
          flex: 1;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .day-list:first-child {
          border-left: 1px solid #b7bcc5;
        }
      }
    }
  }
}
</style>
