<script setup>
/**
 * 济南市各区县产品的详细数据
 */
import { onMounted, onBeforeUnmount, onUnmounted, reactive, ref, computed, watch, toRefs, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ecologyStore } from '@/stores/ecology.js'
const store = ecologyStore()

let myChart
let unitHeight = ref(null)
onMounted(() => {
  myChart = echarts.init(document.getElementById('gradedEcharts'))
  unitHeight.value = -(document.getElementById('gradedEcharts').clientHeight * 0.74)
  window.addEventListener('resize', function () {
    myChart?.resize()
    // console.log(document.getElementById('gradedEcharts').clientHeight, '可视化高度')
    unitHeight.value = -(document.getElementById('gradedEcharts').clientHeight * 0.74)
    // console.log(unitHeight.value)
  })
})
watch(
  () => store.evalutionData,
  () => {
    let yList = []
    if (JSON.stringify(store.evalutionData) != '{}') {
      yList.push(
        store.evalutionData.changeLower.toFixed(2),
        store.evalutionData.changeBetter.toFixed(2),
        store.evalutionData.noChange.toFixed(2),
      )
      initEcharts(yList, ['变差', '变好', '不变'], ['#FFC46C', '#1EB8D7', '#D94039'])
    } else {
      initEcharts([], [], [])
    }
  }
)
const resize = size => {
  document.getElementById('gradedEcharts').style.height = size
  document.getElementById('gradedEcharts').style.width = '420rem'
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
  var colorArray = [
    {
      top: "rgba(213,43,36,1)", //黄
      bottom: "rgba(213,43,36,0.2)",
    },
    {
      top: "rgba(0,174,210)", //绿
      bottom: "rgba(0,174,210,0.2)",
    },
    {
      top: "rgba(255,184,78,1)", //蓝
      bottom: "rgba(255,184,78,0.2)",
    },

  ];
  myChart.setOption(
    {

      tooltip: {
        show: true,
        formatter: function (params) {
          return `<span>${params.name}</span><br/><span>${params.marker}${params.value}km²</span>`

        }
      },
      grid: {
        left: "11.52%",
        top: "14.67%",
        right: "5%",
        bottom: "28.67%",

      },
      graphic: {
        type: 'text', // 类型：文本
        left: '44%',
        top: 'middle',
        silent: true, // 不响应事件
        invisible: xList.length > 0, // 有数据就隐藏
        style: {
          fill: '#9d9d9d',
          // fontWeight: 'bold',
          text: '暂无数据',
          fontFamily: 'Microsoft YaHei',
          fontSize: '14px'
        }
      },
      xAxis: {
        type: "value",
        show: true,

        axisTick: {
          show: true
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
        },
        axisLabel: {
          show: true,
          interval: 0,
          textStyle: {
            color: '#666666',
            fontSize: 12
          }
        },
        name: 'km²',
        // nameGap: 13,
        // nameLocation: 'top',
        nameLocation: 'center',
        nameTextStyle: {
          color: '#999999',
          fontSize: 14,
          padding: [unitHeight.value, 0, 0, 340]
        },

      },
      yAxis: [
        {
          type: "category",
          axisLabel: {
            formatter: '{value}',
            color: '##666666',
            textStyle: {
              color: '#666666',
              fontSize: 12
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#CCCCCC'
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: 'yellow',
              type: 'dotted',

            }
          },
          data: yList
        },
      ],
      series: [
        {
          name: "km²",
          type: "bar",
          label: {
            normal: {
              show: true,
              position: "right",
              formatter: "{c}",
              textStyle: {
                color: "white", //color of value
              },
            },
          },
          itemStyle: {
            normal: {
              show: true,
              color: function (params) {

                return {
                  type: "linear",
                  colorStops: [
                    {
                      offset: 0,
                      color: colorArray[params.dataIndex].bottom,
                    },
                    {
                      offset: 1,
                      color: colorArray[params.dataIndex].top,
                    },
                  ],
                  //globalCoord: false
                };
              },
              barBorderRadius: [0, 70, 70, 0],
              borderWidth: 0,
              borderColor: "#333",
            },
          },
          barGap: "0%",
          barCategoryGap: "50%",
          data: xList,
        },
      ],
    }

  )


  // myChart.setOption({
  //   tooltip: {
  //     trigger: 'axis',
  //     axisPointer: {
  //       type: 'shadow'
  //     },
  //     triggerOn: 'mousemove',
  //     formatter: function (params) {
  //       return `<span>${params[0].name}</span><br/><span>${params[0].marker}${parseFloat(params[0].value)}km²</span>`
  //     }
  //   },
  //   grid: {
  //     top: '20%',
  //     bottom: '21%',
  //     left: '13%',
  //     right: '5%'
  //   },
  //   graphic: {
  //     type: 'text', // 类型：文本
  //     left: '44%',
  //     top: 'middle',
  //     silent: true, // 不响应事件
  //     invisible: xList.length > 0, // 有数据就隐藏
  //     style: {
  //       fill: '#9d9d9d',
  //       // fontWeight: 'bold',
  //       text: '暂无数据',
  //       fontFamily: 'Microsoft YaHei',
  //       fontSize: '14px'
  //     }
  //   },
  //   xAxis: [
  //     {
  //       type: 'category',
  //       data: xList,

  //       axisTick: {
  //         show: false
  //       },
  //       axisLine: {
  //         lineStyle: {
  //           color: '#CCCCCC'
  //         }
  //       },
  //       axisLabel: {
  //         interval: 0,
  //         rotate: 0,
  //         textStyle: {
  //           color: '#999999',
  //           fontSize: 14
  //         }
  //       }
  //     }
  //   ],

  //   yAxis: [
  //     {
  //       axisLabel: {
  //         formatter: '{value}',
  //         color: '#999999',
  //         textStyle: {
  //           color: '#999999',
  //           fontSize: 14
  //         }
  //       },
  //       name: 'km²',

  //       nameTextStyle: {
  //         color: '#999999',
  //         fontSize: 14,
  //         padding: [0, 30, 0, 0]
  //       },
  //       axisLine: {
  //         show: false
  //       },
  //       splitLine: {
  //         lineStyle: {
  //           color: '#CCCCCC',
  //           type: 'dashed'
  //         }
  //       }
  //     }
  //   ],
  //   series: [
  //     {
  //       type: 'bar',
  //       data: yList,
  //       barWidth: '14rem',
  //       itemStyle: {
  //         normal: {
  //           color: function (params) {
  //             let index = params.dataIndex
  //             return colorList[index]
  //           },
  //           barBorderRadius: [30, 30, 0, 0]
  //         }
  //       },
  //       label: {
  //         normal: {
  //           show: false,
  //           position: 'top',
  //           verticalAlign: 'center',
  //           textStyle: {
  //             color: '#333333',
  //             fontSize: 14,
  //             fontWeight: 400
  //           }
  //         }
  //       }
  //     }
  //   ]
  // })
}
</script>
<template>
  <div id="gradedEcharts"></div>
</template>
<style lang="scss" scoped>
#gradedEcharts {
  width: 100%;
  height: 17.9vh;
}
</style>
