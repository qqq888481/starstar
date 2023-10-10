import qiyeImg from '@/assets/yaogan/hot/qiye.png'
import stationIcon from '@/assets/images/ecology/camera.png'
export default class Station {
  constructor(viewer, type) {
    this.viewer = viewer
    this.image = qiyeImg
    this.height = 0
    this.show = false
    this.type = type
    this.myDataSource = null
  }

  draw(datas) {
    this.remove()
    if (datas?.length) {
      this.myDataSource = new Cesium.CustomDataSource(this.type)
      for (const data of datas) {
        const lon = data.longitude
        const lat = data.latitude

        //画entities
        this.myDataSource.entities.add({
          info: data,
          type: this.type,
          id: data.code,
          position: Cesium.Cartesian3.fromDegrees(parseFloat(lon), parseFloat(lat), this.height),
          billboard: {
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1, 1.5e6, 0.1),
            // image: this.drawLabel(),
            image: this.image,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            scale: 1,
            eyeOffset: new Cesium.Cartesian2(0, 0, -1) //偏移量
            // pixelOffset: new Cesium.Cartesian2(0, 24), //偏移量
            // width: 48,
            // height: 48,
          },
          label: {
            //文字标签
            text: data.name,
            font: '200 7px Microsoft YaHei',
            style: Cesium.LabelStyle.FILL,
            fillColor: Cesium.Color.WHITE,
            showBackground: true,
            backgroundColor: new Cesium.Color(0, 0, 0, 0.5),
            backgroundPadding: new Cesium.Cartesian2(6, 3),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, 15), //偏移量
            // eyeOffset: new Cesium.Cartesian2(0, 0, -1), //偏移量
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 8e4)
          }
        })
      }
      this.viewer.dataSources.add(this.myDataSource)
    }
  } //地图点位标签

  //根据经纬度添加icon
  drawIcon(img, lon, lat, height, iconHeight, iconWidth, res) {
    this.viewer.entities.add({
      id: res.id,
      name: res.name,
      position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      billboard: {
        image: stationIcon,
        scale: 1.0
      },
      monitoItems: {
        data: res
      }
    })
  }

  remove() {
    if (this.myDataSource) {
      this.viewer.dataSources.remove(this.myDataSource)
      this.myDataSource = null
    }
  }

  _changeShow(isShow) {
    this.myDataSource.show = isShow
  }
}
