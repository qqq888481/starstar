<script setup>
import { reactive, ref, watch, onMounted, onUnmounted, toRefs, onBeforeUnmount, computed } from 'vue'
import { ecologyStore } from '@/stores/ecology.js'
import * as echarts from 'echarts'
let myChart
const store = ecologyStore()

/**
 * 将rgb转为rgba
 */
const rgbTorgba = (color, opacity) => {
  let r, g, b
  let rgbaAttr = color.match(/[\d.]+/g)
  if (rgbaAttr.length >= 3) {
    let r, g, b
    r = rgbaAttr[0]
    g = rgbaAttr[1]
    b = rgbaAttr[2]
    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')'
  }
}

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
        return `<span>${params[0].name}</span><br/><span>${params[0].marker}${params[0].value}%</span>`
      }
    },
    grid: {
      top: '15%',
      bottom: '17%'
    },
    graphic: {
      type: 'text', // 类型：文本
      left: '40%',
      top: 'middle',
      silent: true, // 不响应事件
      invisible: xList.length > 0, // 有数据就隐藏
      style: {
        fill: '#9d9d9d',
        // fontWeight: 'bold',
        text: '暂无数据',
        fontFamily: 'Microsoft YaHei',
        fontSize: '12px'
      }
    },
    xAxis: [
      {
        type: 'category',
        data: xList,
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.12)'
          }
        },
        axisLabel: {
          show: false
        }
      }
    ],

    yAxis: [
      {
        axisLabel: {
          formatter: '{value}',
          color: '#999999'
        },
        name: '单位: %',
        nameTextStyle: {
          color: '#999999',
          fontSize: 14
        },
        axisLine: {
          show: false
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
            // color: function (params) {
            //   let index = params.dataIndex
            //   return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            //     {
            //       offset: 0,
            //       color: colorList[index][1]
            //     },
            //     {
            //       offset: 1,
            //       color: colorList[index][0]
            //     }
            //   ])
            // },
            color: function (params) {
              let index = params.dataIndex
              return colorList[index]
            },

            barBorderRadius: [30, 30, 0, 0]
            // shadowColor: "rgba(0,160,221,1)",
            // shadowBlur: 4,
          }
        },
        label: {
          normal: {
            show: false,
            lineHeight: 30,
            width: 80,
            height: 30,
            backgroundColor: 'rgba(0,160,221,0.1)',
            borderRadius: 200,
            position: ['-8', '-60'],
            distance: 1,
            formatter: ['    {d|●}', ' {a|{c}}     \n', '    {b|}'].join(','),
            rich: {
              d: {
                color: '#3CDDCF'
              },
              a: {
                color: '#fff',
                align: 'center'
              },
              b: {
                width: 1,
                height: 30,
                borderWidth: 1,
                borderColor: '#234e6c',
                align: 'left'
              }
            }
          }
        }
      }
    ]
  })
}

watch(
  () => [store.legendData, store.panelData],
  (newVal, oldVal) => {
    if (!newVal[0] || !newVal[1]) {
      return
    }
    if (newVal[0].color && newVal[1]?.levelZb.length) {
      let xList = []
      let yList = []
      let colorList = []
      newVal[1].levelZb.map((item, index) => {
        if (index === newVal[1].levelZb.length - 1) {
          xList.push({ value: '[' + newVal[0].value[index] + ',' + newVal[0].value[index + 1] + ']' })
        } else {
          xList.push({ value: '[' + newVal[0].value[index] + ',' + newVal[0].value[index + 1] + ')' })
        }

        yList.push(item.zb)
        colorList.push(newVal[0].color[index])
      })
      initEcharts(xList, yList, colorList)
    }
  }
)
watch(
  () => store.panelShow,
  () => {
    if (!store.panelShow) {
      initEcharts([], [], [])
    }
  }
)
onMounted(() => {
  myChart = echarts.init(document.getElementById('myEchart'))
})
onBeforeUnmount(() => {
  myChart?.dispose()
})
</script>
<template>
  <div id="myEchart" class="container"></div>
</template>
<style lang="scss" scoped>
.container {
  height: 250rem;
  width: 100%;
  padding-left: 16rem;
  padding-right: 16rem;
}
</style>
