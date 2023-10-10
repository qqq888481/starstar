<script setup>
/*
图例组件
传入：图例数据,是否包含产品名
传出：
 */
import { onUnmounted, computed } from 'vue'
import { yaoganStore } from '@/stores/yaogan.js'
// import { eleToShow } from '@/views/1-ecology/0-yg/common/myComFn.js'

const props = defineProps({
  hasName: false,
  widthValue: {
    type: String,
    default: ''
  }
})
const store = yaoganStore()
const curProduct = computed(() => store.curProduct)
const isShowSite = computed(() => store.isShowSite)
const siteChecked = computed(() => store.siteChecked)
let dataSource

const legendArr = computed(() => {
  dataSource = JSON.parse(JSON.stringify(store.legendData)) //深拷贝
  if (dataSource.color.length !== 0) {
    if (dataSource.label.length > 0) {
      let width = 35 * 13
      let spanWidth = width / dataSource.label.length
      const arr = []
      let templabel
      if (dataSource.label[0]?.indexOf('VOCs') !== -1) {
        //臭氧前体物的情况
        templabel = ['VOCs控制区(<1)', '共同控制区(1-2)', '共同控制区(2-4)', '共同控制区(4-8)', 'NOx控制区(>8)']
      } else {
        //沙尘判识、沙尘云图
        templabel = JSON.parse(JSON.stringify(dataSource.label))
      }

      for (let i = 0; i < templabel.length; i++) {
        arr.push({
          width: spanWidth,
          value: templabel[i],
          color: dataSource.color[i]
        })
      }
      const background = ``

      const a = {
        length: templabel.length - 1,
        isLiner: false,
        unit: dataSource.unit,
        width,
        background: background,
        data: arr
      }
      return a
    } else {
      //调整color值为rgba格式
      for (let i = 0; i < dataSource.color.length; i++) {
        const str = dataSource.color[i]
        const a = str.slice(0, 3)
        const b = str.slice(3, str.lastIndexOf(','))
        const c = str.substring(str.length - 1, str.lastIndexOf(',') + 1) //把透明度 截取出来计算成0-1的值
        dataSource.color[i] = a + 'a' + b + ',' + (c / 255).toFixed(2) + ')'
      }

      let width
      let spanWidth
      let num = 3

      if (dataSource.unit === '') {
        //需要展示的数据没有单位时，一般是文字，比如沙层、高层云、中层云
        if (dataSource.color.length + 1 > 12) {
          //图例显示的数据保证不超过13条，超过需要裁减
          for (let i = 0; i < dataSource.color.length; i++) {
            // if (num - 3 >= dataSource.color.length - 12) {
            //   break;
            // }
            if (i % 3 === 1) {
              dataSource.color.splice(i, 1)
              dataSource.value.splice(i, 1)
            }
          }
          width = 35 * 13
          spanWidth = width / dataSource.color.length
        } else {
          width = 35 * 13
          spanWidth = width / dataSource.color.length
        }
      } else {
        if (dataSource.color.length + 1 > 12) {
          for (let i = 0; i < dataSource.color.length; i++) {
            if (i % 2 === 1) {
              num++
              dataSource.color.splice(i, 1)
              dataSource.value.splice(i, 1)
            }
          }
          width = 35 * 13
          spanWidth = (width - dataSource.unit.length * 3) / (dataSource.color.length - num)
        } else {
          width = 35 * 13
          spanWidth = (width - dataSource.unit.length * 3) / (dataSource.color.length - (num + 3))
        }
      }

      const arr = [
        {
          width: dataSource.unit.length * 3,
          value: dataSource.unit,
          color: dataSource.color[0]
        }
      ]
      let string = dataSource.color[0]

      for (let i = 0; i < dataSource.color.length; i++) {
        arr.push({
          width: spanWidth,
          value: dataSource.value[i],
          color: dataSource.color[i]
        })
        string += `,${dataSource.color[i]}`
      }
      const background = `linear-gradient(to right,${string})` //渐变

      const a = {
        length: dataSource.color.length,
        isLiner: true,
        unit: dataSource.unit,
        title: dataSource.title,
        width,
        background: background,
        data: arr
      }
      // legendArr.value = { ...a }
      return a
    }
  } else {
    const a = {
      length: 0,
      isLiner: false,
      title: dataSource.title,
      unit: '',
      width: '',
      background: '',
      data: []
    }
    return a
  }
})
function eleToShow(ele) {
  if (!ele) return '--'
  ele = ele.toLowerCase()
  let result
  switch (ele) {
    case 'aqi':
      result = 'AQI'
      break
    case 'pm25':
    case 'pm2.5':
    case 'stnpm25':
    case 'pm25遥感监测':
      result = 'PM₂.₅'
      break
    case 'pm10':
    case 'pm10遥感监测':
    case 'stnpm10':
      result = 'PM₁₀'
      break
    case 'so2':
    case 'so2遥感监测':
    case 'stnso2':
      result = 'SO₂'
      break
    case 'no2':
    case 'no2遥感监测':
    case 'stnno2':
      result = 'NO₂'
      break
    case 'co':
    case 'co遥感监测':
    case 'stnco':
      result = 'CO'
      break
    case 'o3':
    case 'o3遥感监测':
    case 'stno3':
      result = 'O₃'
      break
    case 'ch4':
    case 'ch4遥感监测':
      result = 'CH₄'
      break
    case 'co2':
    case 'co2遥感监测':
      result = 'CO₂'
      break
    case 'hcho':
    case 'hcho遥感监测':
      result = 'HCHO'
      break
    default:
      result = ele
      break
  }
  return result
}

onUnmounted(() => {})
// watch(legendArr, () => {
// 	console.log(legendArr.value)
// })
</script>

<template>
  <div class="Legend">
    <div class="site-legnd" v-show="isShowSite && siteChecked">
      <img src="@/assets/yaogan/image/tuli.png" alt="" />
    </div>
    <template v-if="legendArr.length !== 0">
      <div
        class="legend"
        :style="{
          background: legendArr.background,
          width: widthValue ? widthValue + 'rem' : legendArr.width + 'rem',
          gridTemplateColumns: hasName ? `auto repeat(${legendArr.length}, 1fr)` : ` repeat(${legendArr.length}, 1fr)`
        }"
      >
        <template v-if="legendArr.unit">
          <template v-for="(item, index) in legendArr.data" :key="index">
            <template v-if="index === 0">
              <span className="unit" v-show="hasName">
                <!-- {{
								curProduct && item.value
									? `${eleToShow(curProduct.name)}(${item.value})`
									: item.value
							}} -->
                {{ `${eleToShow(legendArr.title)}(${item.value})` }}
              </span>
            </template>
            <template v-else>
              <span :style="{ width: item.width }">{{ item.value }}</span>
            </template>
          </template>
        </template>
        <template v-else>
          <template v-for="(item, index) in legendArr.data" :key="index">
            <span
              :style="{
                textAlign: 'center',
                background: item.color,
                fontSize: '12px',
                paddingLeft: '3px'
              }"
              >{{ item.value }}</span
            >
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.Legend {
  position: absolute;
  bottom: 45px;
  width: 450rem;
  right: 18rem;
  z-index: 3;
  .site-legnd {
    position: absolute;
    right: 0rem;
    bottom: 33rem;
    img {
      height: 25rem;
    }
  }
  .legend {
    overflow: hidden;
    padding: 0;
    z-index: 3;
    transition: 0.3s opacity;
    margin-bottom: 5px;
    border-radius: 20px;
    color: #fff;
    display: grid;
    // align-items: center;
    text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
    .unit {
      width: fit-content;
      // float: left;
      font-size: 0.1rem;
      padding: 0px 5px;
      background: rgb(68, 68, 68);
      // display: flex;
      // align-items: center;
    }

    span {
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
