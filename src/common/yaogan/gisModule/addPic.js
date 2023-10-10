const { Rectangle, ImageMaterialProperty, Color, CallbackProperty } = Cesium

/*
 * id:id；str
 * url:图片资源；url
 * range:图片4角坐标；[118, 32, 133, 45]
 * */
export default class Pic {
  constructor(viewer) {
    this.viewer = viewer
    this.url = ''
    this.optity = ''
    this.range = []
  }

  add(id, url, range, optity, transparent = 1) {
    this.url = url
    this.optity = optity
    this.range = range
    this.viewer.addEntity({
      id,
      name: 'Red translucent rectangle',
      rectangle: {
        coordinates: new CallbackProperty(() => {
          return Rectangle.fromDegrees(...this.range)
        }, false),
        material: new ImageMaterialProperty({
          image: new CallbackProperty(() => {
            return this.url
          }, false),
          color: new CallbackProperty(() => {
            return Color.WHITE.withAlpha(this.optity)
          }, false),
          transparent: transparent
        })
      }
    })
  }

  change(url, range, optity = 1) {
    this.url = url
    setTimeout(() => {
      this.range = range
      this.optity = optity
    }, 40)

    //改变透明度和url
  }

  remove(id) {
    this.viewer.removeEntity(id)
  }
}
