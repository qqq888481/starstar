<script setup>
/**
 * 生态系统服务功能相应产品的重要性评估
 */
import { onMounted, onBeforeUnmount, onUnmounted, reactive, ref, computed, watch, toRefs, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ecologyStore } from '@/stores/ecology.js'
const store = ecologyStore()
let myChart
let objData = ref(null)
let sumData = ref(null)
onMounted(() => {
  myChart = echarts.init(document.getElementById('evlationEcharts'))
  window.addEventListener('resize', function () {
    myChart?.resize()
  })
})
watch(
  () => store.evalutionData,
  () => {
    if (JSON.stringify(store.evalutionData) != '{}') {
      let yList = []
      let rateList = []
      yList.push(
        store.evalutionData.veryImportant.toFixed(0),
        store.evalutionData.important.toFixed(0),

        store.evalutionData.generalImportant.toFixed(0)
      )
      sumData = parseFloat(store.evalutionData.important.toFixed(0)) + parseFloat(store.evalutionData.veryImportant.toFixed(0)) + parseFloat(store.evalutionData.generalImportant.toFixed(0));

      rateList.push(
        ((parseFloat(store.evalutionData.veryImportant.toFixed(0)) / sumData) * 100).toFixed(2) + '%',
        ((parseFloat(store.evalutionData.important.toFixed(0)) / sumData) * 100).toFixed(2) + '%',

        ((parseFloat(store.evalutionData.generalImportant.toFixed(0)) / sumData) * 100).toFixed(2) + '%',
      )
      objData.value = { '重要': { value: yList[1], rate: rateList[1] }, '极重要': { value: yList[0], rate: rateList[0] }, '一般重要': { value: yList[2], rate: rateList[2] } }
      initEcharts(['极重要', '重要', '一般重要'], yList, ['#4E6C39', '#6CB246', '#EBEDB7'])
    } else {
      initEcharts([], [], [])
    }
  }
)
const resize = size => {
  document.getElementById('evlationEcharts').style.height = size
  document.getElementById('evlationEcharts').style.width = '420rem'
  myChart?.resize()
}
defineExpose({
  resize
})
onBeforeUnmount(() => {
  myChart?.dispose()
})
const initEcharts = (xList, yList, colorList) => {
  myChart?.clear()
  myChart?.setOption({
    tooltip: {
      trigger: 'item',
      show: false
      // formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      show: true,
      orient: 'bottom',
      left: '40.69%',
      y: 'center',
      itemHeight: 14,
      itemWidth: 14,
      itemGap: 30,
      icon: 'rect',
      textStyle: {
        fontSize: 14,
        color: '#000000',
        rich: {
          name: {
            fontWeight: 400,
            color: '#000000',
            fontSize: 14,
            fontFamily: ' Microsoft YaHei-Regular, Microsoft YaHei',
            width: 78
          },
          value: {
            fontWeight: 'bold',
            color: '#000000',
            fontSize: 14,
            fontFamily: ' Microsoft YaHei-Regular, Microsoft YaHei',
            width: 76
          },
          rate: {
            fontWeight: 'bold',
            color: '#3074E2',
            fontSize: 14,
            fontFamily: ' Microsoft YaHei-Regular, Microsoft YaHei',

          }
        }
      },
      formatter: function (name) {
        return `{name|${name}}{value|${objData.value[name].value}km²}{rate|${objData.value[name].rate}}`
      },

      data: xList
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
    color: colorList,

    series: [
      {
        // name: "访问来源",
        stack: 'a',
        type: 'pie',
        radius: ['41.67%', '78%'],
        roseType: 'area',
        // radius: ['16%', '31%'],
        // startAngle: 200,
        avoidLabelOverlap: true,
        center: ['20.6%', '50%'],
        label: {
          show: true,
          position: 'center',
          formatter: '{total|' + sumData + '}' + '\n\r' + '{unit|km²}',
          rich: {
            total: {
              fontSize: 14,
              fontFamily: 'Microsoft YaHei-Bold, Microsoft YaHei',
              fontWeight: 'bold',
              color: '#000000'
            },
            unit: {
              fontSize: 10,
              fontFamily: 'Microsoft YaHei-Bold, Microsoft YaHei',
              fontWeight: 400,
              color: '#000000'
            }
          }

        },

        data: [
          { value: yList[0], name: '极重要' },
          { value: yList[1], name: '重要' },

          { value: yList[2], name: '一般重要' }
        ]
      }
    ]
  })
}
</script>
<template>
  <div id="evlationEcharts"></div>
</template>
<style lang="scss" scoped>
#evlationEcharts {
  width: 100%;
  height: 17.18vh;
}
</style>
