<script setup>
/**
 * 济南市各区县产品的详细数据
 */
import { onMounted, onBeforeUnmount, onUnmounted, reactive, ref, computed, watch, toRefs, nextTick } from 'vue'
import * as echarts from 'echarts'

import { ecologyStore } from '@/stores/ecology.js'
const store = ecologyStore()

let myChart
let echartsShow = ref()
let unit = computed(() => {
  //根据当前产品选择相应的图片
  let newstr = ''
  if (store.curProduct) {
    if (store.curProduct.name === '水源涵养') {
      newstr = '(10⁶m³/a)'
    } else if (store.curProduct.name === '土壤保持') {
      newstr = '(10⁷t/(hm²∙a))'
    } else if (store.curProduct.name === '防风固沙') {
      newstr = '(t/km²/a)'
    }
    else if (store.curProduct.name === '生物多样性维护') {
      newstr = ''
    }
    else {
      newstr = ''
    }
  }
  return newstr
})

watch(
  () => store.evalutionData,
  () => {
    if (
      store.evalutionData.allRagionData?.regionNameList.length &&
      store.evalutionData.allRagionData?.regionDataList.length
    ) {
      echartsShow.value = true
      let xList = []
      let yList = []
      xList = store.evalutionData.allRagionData?.regionNameList.slice(0)
      xList.shift()
      yList = store.evalutionData.allRagionData?.regionDataList.slice(0)
      yList.shift()
      let newyArr = []
      if (store.curProduct.name === '水源涵养') {
        newyArr = yList.map(item => {
          return (parseFloat(item) / Math.pow(10, 1)).toFixed(2)
        })
      } else if (store.curProduct.name === '土壤保持') {
        newyArr = yList.map(item => {
          return (parseFloat(item) / Math.pow(10, 2)).toFixed(2)
        })
      } else if (store.curProduct.name === '生物多样性维护') {
        newyArr = yList
      } else if (store.curProduct.name === '防风固沙') {
        newyArr = yList
      } else {
        newyArr = yList
      }

      initEcharts(xList, newyArr, [
        '#B6EDF0',
        '#98D2ED',
        '#7CBBEB',
        '#5CA3E6',
        '#368DE3',
        '#2176D9',
        '#2259C7',
        '#1D3EB5',
        '#1727A3',
        '#3661FF',
        '#0000FF',
        '#0000FF'
      ])
    } else {
      initEcharts([], [], [])
    }
  }
)

const echartsHeight = ref(null)
onMounted(() => {
  myChart = echarts.init(document.getElementById('areaDataEcharts'))
  window.addEventListener('resize', function () {
    myChart?.resize()
  })
})
const resize = size => {
  document.getElementById('areaDataEcharts').style.height = size
  document.getElementById('areaDataEcharts').style.width = '420rem'
  myChart?.resize()
}
defineExpose({
  resize
})
onBeforeUnmount(() => {
  myChart?.dispose()
})

const initEcharts = (xList, yList, colorList) => {
  myChart.clear()
  myChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      triggerOn: 'mousemove',
      formatter: function (params) {
        return `<span>${params[0].name}</span><br/><span>${params[0].marker}${params[0].value}${unit.value}</span>`
      }
    },
    grid: {
      // containLabel: true,
      top: '16%',
      bottom: '27.27%',
      left: '13%',
      right: '5%'
    },
    graphic: {
      type: 'text', // 类型：文本
      left: '44%',
      top: 'middle',
      silent: true, // 不响应事件
      invisible: xList.length, // 有数据就隐藏
      style: {
        fill: '#9d9d9d',
        // fontWeight: 'bold',
        text: '暂无数据',
        fontFamily: 'Microsoft YaHei',
        fontSize: '14px'
      }
    },

    xAxis: [
      {
        type: 'category',

        data: xList,

        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#CCCCCC'
          }
        },
        axisLabel: {
          interval: 0,
          formatter: function (value) {//让x轴上的文字竖直方向显示
            return value.split('').join('\n')
          },
          textStyle: {
            color: '#666666',
            fontSize: 12
          }
        }
      }
    ],

    yAxis: [
      {
        type: 'value',
        axisLabel: {
          formatter: '{value}',
          color: '##666666',
          textStyle: {
            color: '#666666',
            fontSize: 14
          }
        },
        name: unit.value,

        nameLocation: 'end',
        nameTextStyle: {
          color: '#999999',
          fontSize: 14
          // padding: [0, 20, 0, 0]
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#CCCCCC'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#CCCCCC',
            type: 'dashed'
          }
        }
      }
    ],
    series: [
      {
        type: 'bar',
        data: yList,
        barWidth: '14rem',
        itemStyle: {
          normal: {
            color: function (params) {
              let index = params.dataIndex
              return colorList[index]
            },
            barBorderRadius: [30, 30, 0, 0]
          }
        },
        label: {
          normal: {
            show: false,
            position: 'top',
            verticalAlign: 'center',
            textStyle: {
              color: '#333333',
              fontSize: 14,
              fontWeight: 400
            }

          }
        }
      }
    ]
  })
}
</script>
<template>
  <div id="areaDataEcharts" :style="{ height: echartsHeight }"></div>
</template>
<style lang="scss" scoped>
#areaDataEcharts {
  width: 100%;
  height: 26.25vh;

}
</style>
