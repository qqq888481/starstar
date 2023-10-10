import { getHeitByHpa, HPA_HEIT_ZOOM, getTexImg } from '../utils/mathUtil'
import emptyPic from '../assets/empty.png'

/*
 * id:id；str
 * url:图片资源；url
 * range:图片4角坐标；[118, 32, 133, 45]
 * */
export default class ShowMapPic {
  constructor(viewer, id) {
    this.viewer = viewer
    this.rectangle = null
    this.isShow = true
    this.id = id
    this.alpha = 1
    this.setUrl(emptyPic, [0, 0, 1, 1])
  }

  // [68.0, 9.6, 135.0, 60.25]
  setUrl(url, range, show = true, hPa = 0, alpha = 1, heightZoom = HPA_HEIT_ZOOM) {
    if (this.rectangle) {
      this.url = url
      this.hPa = hPa === 0 ? 0 : hPa
      this.range = range
      this.alpha = alpha
      this.viewer.changeEntityShow(this.id, show)
    } else {
      getTexImg(url, res => {
        this.url = res
        this.hPa = hPa
        this.alpha = alpha
        this.range = range

        const myEntity =
          this.hPa === 0
            ? {
                id: this.id,
                show: show,

                rectangle: {
                  coordinates: new Cesium.CallbackProperty(() => {
                    return Cesium.Rectangle.fromDegrees(...this.range)
                  }, false),
                  material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(() => {
                      return this.url
                    }, false),
                    transparent: true,
                    color: new Cesium.CallbackProperty(() => {
                      return Cesium.Color.WHITE.withAlpha(this.alpha)
                    }, false)
                  })
                }
              }
            : {
                id: this.id,
                show: show,
                rectangle: {
                  coordinates: new Cesium.CallbackProperty(() => {
                    return Cesium.Rectangle.fromDegrees(...this.range)
                  }, false),
                  material: new Cesium.ImageMaterialProperty({
                    image: new Cesium.CallbackProperty(() => {
                      return this.url
                    }, false),
                    transparent: true,
                    color: new Cesium.CallbackProperty(() => {
                      return Cesium.Color.WHITE.withAlpha(this.alpha)
                    }, false)
                  }),
                  // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                  height: new Cesium.CallbackProperty(() => {
                    return this.hPa === 0 ? 0 : getHeitByHpa(this.hPa) * heightZoom
                  }, false)
                }
              }

        this.rectangle = this.viewer.addEntity(myEntity)
        // this.rectangle.show = false
      })

      // this.viewer.changeEntityShow(this.id, true)
    }
  }

  // 改变图片透明度  [0,1]
  changeAlpha(value = 1) {
    if (value < 0) {
      value = 0
    } else if (value > 1) {
      value = 1
    }

    this.alpha = value
  }

  changeShow(isShow) {
    this.viewer.changeEntityShow(this.id, isShow)
    this.isShow = isShow
  }

  destroy() {
    this.viewer.removeEntity(this.id)
    this.rectangle = null
  }
}
