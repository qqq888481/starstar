<template>
  <div id='custom-table-map'></div>
</template>

<script>
import Map from '@/IMEE/viewer.js'
import Axios from 'axios'
import {onMounted,reactive} from 'vue'
import positionIcon from '@/assets/tableForm/position-icon.png'
let viewer = null
export default {
    setup(props,{attrs}) {
        let mapFun = reactive({
            clickPosition:'',//点击的经纬度
            mapFirst(){
                Axios('config/mapCfg.json').then(res=>{
                        viewer = new Map(
                            'custom-table-map',
		                    attrs.mapFirstPosition,
		                    true,
		                    res.data,
                            "f22a461e3e04e5cbb123cc7de88c5a05",
		                    0,
                        )
                })
            },
            starAddEntity(){
                viewer.addEvent('getClickPosition',"LEFT_CLICK",(e)=>{
                    this.addEntity(e)//打点
                })
            },//开始监听点击打点事件,并定义触发事件时的方法
            endAddEntity:()=>{
                viewer.removeEvent('getClickPosition','LEFT_CLICK')              
            },//结束监听打点事件
            addEntity(e){
                this.clickPosition=e.position.longitude+','+e.position.latitude//存储经纬度信息
                viewer.addEntity({
                    id:1,
                    position:new Cesium.Cartesian3.fromDegrees(e.position.longitude,e.position.latitude),
                    show:true,
                    billboard:{
                        // image:require('@/assets/position-icon.png'),
                        image:positionIcon,
                        pixelOffset:new Cesium.Cartesian2(0,-8)//自生偏移量
                    }
                })
            },//添加地图点方法
            refashCamera(){
                viewer.initViewer()
            },//复原视角
            destroy(){
                viewer?.destroy()
                viewer=null
            },//地图销毁
        })
        onMounted(() => {
            mapFun.mapFirst()
        })
        return{
            mapFun
        }
    }
}
</script>

<style lang='scss'>
    #custom-table-map{
        width: 100%;
        height: 100%;
        .cesium-viewer{
            height: 100%;
            width: 100%;
            .cesium-viewer-cesiumWidgetContainer{
                height: 100%;
                width: 100%;
                .cesium-widget {//地图画布大小铺满
                    height: 100%;
                    width: 100%;
                    canvas {
                        height: 100%;
                        width: 100%;
                        position: relative;
                    }
                }
            }
        }
    }
</style>