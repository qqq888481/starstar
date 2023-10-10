<script setup>
/* 
鼠标当前位置(经纬度)、视野高度组件
传入：viewer
传出：
 */
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { debounce } from '@/common/utilFns.js'
// import CesiumNavigation from 'cesium-navigation-es6'
let lon = ref(initPosition[0])
let lat = ref(initPosition[1])

let myView

//拿到viewer值,获取经纬度值
function setViewer(viewer) {
  myView = viewer

  //比例尺
  let navigationOption = {
    // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
    // defaultResetView: CesuiCartographic.fromDegrees(...this._initPostion),
    // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
    enableCompass: false,
    // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
    enableZoomControls: false,
    // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
    enableDistanceLegend: true,
    // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
    enableCompassOuterRing: false
  }
  // new CesiumNavigation(myView, navigationOption) //比例尺配置

  myView.addEvent('location', 'MOUSE_MOVE', res => {
    debounce(
      function () {
        lon.value = res.position.longitude
        lat.value = res.position.latitude
      },
      500,
      'location'
    )
  })
}

const formatDegree = value => {
  /// 将度转换成为度分秒
  // value = Math.abs(value)
  let v1 = Math.floor(value) // 度
  let v2 = Math.floor((value - v1) * 60) // 分
  let v3 = Math.round(((value - v1) * 3600) % 60) // 秒
  return v1 + '°' + (v2 < 10 ? '0' + v2 : v2) + "'" + (v3 < 10 ? '0' + v3 : v3) + '"'
  // return value;
}

onMounted(() => {})

onUnmounted(() => {})
defineExpose({
  setViewer
})
</script>

<template>
  <div id="MapInfo">
    <span class="info">经度：{{ formatDegree(lon) }}</span>
    <span class="info">纬度：{{ formatDegree(lat) }}</span>
  </div>
</template>

<style lang="scss">
#MapInfo {
  z-index: 3;
  position: absolute;
  right: 150rem;
  bottom: 18rem;
  padding: 0 10rem;
  height: 25rem;
  line-height: 25rem;
  width: 315rem; //为了保证和图例一样长
  background-color: rgb(6, 10, 17);
  color: #fff;
  .info {
    margin-right: 30rem;
  }
}
// 比例尺样式
.distance-legend {
  background-color: rgb(6, 10, 17);
  border-radius: 0px;
  right: 18px;
  bottom: 18rem;
  height: 25rem;
  overflow: hidden;
  z-index: 3;
}
</style>
