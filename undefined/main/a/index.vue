<script setup>
import Viewer from '@/IMEE/viewer'
import ShowMapPic from '@/IMEE/models/showMapPic.js'
import Request from './request'
import { myToken } from '@/config/sysConfig'
import { onMounted, ref } from 'vue'
import PicCompute from '@/IMEE/models/picCompute'

let viewer, myShowMapPic

onMounted(() => {
  Request.getJson('./config/mapCfg.json', r => {
    viewer = new Viewer(
      'mapContainer',
      [117.00079518689907, 36.726179411717865, 8000000, 0, -90, 0],
      false,
      r,
      myToken,
      0
    )

    viewer.initFn(() => {
      viewer.addEvent('test', 'LEFT_CLICK', r => {
        console.warn(r)
      })
      myShowMapPic = new ShowMapPic(viewer, 'myShowMapPic')

      const myPicCompute = new PicCompute()
      myPicCompute.lonlatPicToMerPic(
        './data/pic.png',
        73.66666666666667,
        3.8666666666666667,
        135.03333333333333,
        53.55,
        r => {
          // console.warn(r.url);
          // myShowMapPic.setUrl(
          //   r.url,
          //   [73.66666666666667, 3.8666666666666667, 135.03333333333333, 53.55]
          // );

          myPicCompute.merPicToLonlatPic(
            r.url,
            8200535.8217710545,
            430762.4638076509,
            15031841.90678486,
            7085388.165494998,
            r1 => {
              myShowMapPic.setUrl(r1.url, [73.66666666666667, 3.8666666666666667, 135.03333333333333, 53.55])
            }
          )
        }
      )

      // myShowMapPic.setUrl('./data/pic.png', [73.66666666666667, 3.8666666666666667, 135.03333333333333, 53.55])
      // viewer.dataSources.add(
      // 	Cesium.GeoJsonDataSource.load(
      // 		'./data/test.json'
      // 	)
      // );
      // Request.getJson('./data/test.json', r1 => {
      // 	console.warn(r1.features[0].geometry.coordinates);
      // 	for (const [iterator, index] of r1.features[0].geometry.coordinates) {
      // 		console.warn(index);
      // 		viewer.entities.add({
      // 			polyline: {
      // 				positions: Cesium.Cartesian3.fromDegreesArray(iterator.flat(Infinity)),
      // 				width: 5,
      // 				arcType: Cesium.ArcType.RHUMB,
      // 				material: Cesium.Color.GREEN,
      // 			},
      // 		});
      // 	}
      // })

      // const dataAry = []
      // Request.getJson('./data/china.json', r1 => {
      // 	console.warn(r1);

      // 	Request.getJson('./data/168.json', r2 => {
      // 		console.warn(r2);

      // 		for (let i = 0; i < r2.data.length; i++) {
      // 			const element168 = r2.data[i];
      // 			let flag = false
      // 			for (let index = 0; index < r1.features.length; index++) {
      // 				const element = r1.features[index];
      // 				if (element.properties.name === element168) {
      // 					dataAry.push(element)
      // 					flag = true
      // 					continue
      // 				}
      // 			}
      // 			if (!flag) {
      // 				console.warn(element168);
      // 			}

      // 		}
      // 	})
      // })
      // setTimeout(() => {
      // 	console.warn(dataAry);
      // }, 3000)
    })
  })
})

let isShow = true
const test = () => {
  isShow = !isShow
  myShowMapPic.changeShow(isShow)
}
</script>

<template>
  <div id="A">
    <div id="mapContainer" />
    <span className="test" @click="test">测试</span>
  </div>
</template>

<style lang="scss">
#A {
  width: 100%;
  height: 100%;

  position: absolute;
  overflow: hidden;

  #mapContainer {
    canvas {
      width: 100%;
      height: 100%;

      position: absolute;
    }
  }

  .test {
    margin-top: 50rem;
    position: absolute;
  }
}
</style>
