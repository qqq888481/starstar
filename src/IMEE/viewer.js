import './style/viewer.scss'
import html2canvas from 'html2canvas'
import { NineLineData } from './utils/NineLine'
import chinaJson from './assets/china.json'
import axios from 'axios'
import { gcj02towgs84 } from './utils/transform'

function createColorCanvas(color) {
  let width = 1,
    height = 1
  let canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  let ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.globalAlpha = 0.1
  ctx.fillRect(0, 0, width, height)
  return canvas.toDataURL()
}

// Cesium.Ion.defaultAccessToken =
// 	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MDQxOTQyYi1iNmI0LTQ4NzUtODgzNy1iMjcwODE4ZGZlNTkiLCJpZCI6MTY1OTMsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzA3Nzc5OTh9.a8wdusd6lqGbpsKpcvCFARaStzVlCRXrPldVJflZHxE'

const MINHEIGHT = 650 // 相机靠近地面的最小距离

export default class Viewer extends Cesium.Viewer {
  constructor(
    domId,
    initPostion = [118, 32, 8e6, 0, -90, 0],
    is3D = true,
    // mapCfg = undefined,
    token = '',
    duration = 1
  ) {
    super(domId, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      contextOptions: {
        id: 'cesiumCanvas', // must
        webgl: {
          // 图片输出专用
          preserveDrawingBuffer: true,
          alpha: true
        }
      },
      imageryProvider: new Cesium.SingleTileImageryProvider({
        url: createColorCanvas('#FFF'),
        rectangle: Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0)
      }),
      // skyBox: false,
      // skyAtmosphere: false,
      sceneMode: is3D ? Cesium.SceneMode.SCENE3D : Cesium.SceneMode.SCENE2D
    })
    this.webMercatorProjection = new Cesium.WebMercatorProjection() //lyj

    this.token = token

    // this.scene.globe.showGroundAtmosphere = false
    this.scene.globe.baseColor = Cesium.Color.fromCssColorString('#97B6E1') // 设置地球颜色
    this.scene.backgroundColor = Cesium.Color.fromBytes(1, 1, 1, 1)

    this._initPostion = initPostion
    this.mapCfg = MapCfg

    this.entitiesMap = new Map()
    this.layersMap = new Map()
    this.dataSourcesMap = new Map()

    this.layerInfoAry = [] // 底图的数组，用于外面切换图层
    this.is3D = is3D
    this.nineLinePrimitives = []

    this._handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas)
    this._eventObj = {
      MOUSE_MOVE: new Map(),
      LEFT_UP: new Map(),
      LEFT_DOWN: new Map(),
      RIGHT_CLICK: new Map(),
      WHEEL: new Map(),
      LEFT_CLICK: new Map()
    }
    // this.scene.screenSpaceCameraController.minimumZoomDistance = MINHEIGHT // 相机的高度的最小值
    this.scene.screenSpaceCameraController.maximumZoomDistance = MAXHEIGHT //相机高度的最大值
    this._initLayer()
    this._initTerrain()
    this.initViewer(duration)
    // 添加九段线
    this._addNineLine()
    // 中国边界
    this.addGeoJson(chinaJson)
    //添加济南水系
    this.jnWaterLine = null
    // this.addJnWaterLine()

    this._cesiumWidget._creditContainer.style.display = 'none'

    this.scene.postProcessStages.fxaa.enabled = false
    // this.scene.globe.maximumScreenSpaceError = 0.5

    this.webMercatorProjection = new Cesium.WebMercatorProjection()

    this._handler.setInputAction(() => {
      this.trackedEntity = undefined
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  }

  // viewer初始化完成之后，执行的回调函数，可优化地图初始化加载性能
  initFn(cb) {
    if (!cb) {
      return
    }
    const helper = new Cesium.EventHelper()
    let times = 0,
      flag = false
    helper.add(this.scene.globe.tileLoadProgressEvent, e => {
      if (!flag) {
        if (times < e) {
          times = e
        } else {
          flag = true
          setTimeout(() => {
            cb()
            helper.removeAll()
          }, 80)
        }
      }
    })
  }

  /*
   * 增加事件
   * */
  addEvent(name, type, callback, enable = true) {
    if (this._eventObj[type].size === 0) {
      switch (type) {
        case 'LEFT_CLICK':
          this._leftClickEvent()
          break
        case 'LEFT_UP':
          this._leftUpEvent()
          break
        case 'LEFT_DOWN':
          this._leftDOWNEvent()
          break
        case 'MOUSE_MOVE':
          this._mouseMoveEvent()
          break
        case 'RIGHT_CLICK':
          this._rightClickEvent()
          break
        case 'WHEEL':
          this._wheelEvent()
          break
      }
    }
    this._eventObj[type].set(name, {
      enable,
      fn: callback
    })
  }

  /*
   * 改变事件是否可用
   * */
  changeEvent(name, type, enable) {
    if (this._eventObj[type].get(name)) {
      this._eventObj[type].get(name).enable = enable
    }
  }

  /*
   * 移除监听事件
   * */
  removeEvent(name, type) {
    this._eventObj[type].delete(name)
    if (this._eventObj[type].size === 0) {
      this._handler.removeInputAction(Cesium.ScreenSpaceEventType[type])
    }
  }

  _wheelEvent() {
    this._handler.setInputAction(evt => {
      if (this._eventObj.WHEEL.size < 1) {
        return
      }

      this._eventObj.WHEEL.forEach(fnObj => {
        if (fnObj && fnObj.enable) {
          fnObj.fn(evt)
        }
      })
    }, Cesium.ScreenSpaceEventType.WHEEL)
  }

  /*
   * 右击事件
   * */
  _rightClickEvent() {
    this._handler.setInputAction(evt => {
      if (this._eventObj.RIGHT_CLICK.size < 1) {
        return
      }
      if (!evt.position) {
        return
      }
      const cartesian = this._Cartesian2ToCartesian3(evt.position, this.is3D)
      if (!cartesian) {
        return
      }
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const mapPosition = this._radiansToDegrees(cartographic)

      this._eventObj.RIGHT_CLICK.forEach(fnObj => {
        if (fnObj && fnObj.enable) {
          fnObj.fn({
            position: mapPosition,
            pickObj: this.scene.pick(evt.position) ? this.scene.pick(evt.position).id : false,
            xy: evt.position
          })
        }
      })
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  /*
   * 鼠标移动事件
   * */
  _mouseMoveEvent() {
    this._handler.setInputAction(evt => {
      if (this._eventObj.MOUSE_MOVE.size < 1) {
        return
      }
      const ray = this.camera.getPickRay(evt.endPosition)
      const cartesian = this.scene.globe.pick(ray, this.scene)

      if (!cartesian) {
        return
      }
      const ellipsoid = this.scene.globe.ellipsoid
      const cartographic = ellipsoid.cartesianToCartographic(cartesian)

      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const mapPosition = {
        latitude,
        longitude
      }
      this._eventObj.MOUSE_MOVE.forEach(fnObj => {
        if (fnObj && fnObj.enable) {
          fnObj.fn({
            position: mapPosition,
            pickObj: this.scene.pick(evt.endPosition) ? this.scene.pick(evt.endPosition) : false
          })
        }
      })
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  _leftClickEvent() {
    this._handler.setInputAction(evt => {
      if (this._eventObj.LEFT_CLICK.size < 1) {
        return
      }
      if (!evt.position) {
        return
      }

      const cartesian = this._Cartesian2ToCartesian3(evt.position, this.is3D)

      if (!cartesian) {
        return
      }
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const mapPosition = this._radiansToDegrees(cartographic)

      this._eventObj.LEFT_CLICK.forEach(fnObj => {
        if (fnObj && fnObj.enable) {
          fnObj.fn({
            cartographic,
            position: mapPosition,
            pickObj: this.scene.pick(evt.position) ? this.scene.pick(evt.position) : false,
            xy: evt.position
          })
        }
      })
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /*
   * 鼠标抬起事件
   * */
  _leftUpEvent() {
    this._handler.setInputAction(evt => {
      if (this._eventObj.LEFT_UP.size < 1) {
        return
      }
      if (!evt.position) {
        return
      }

      const cartesian = this._Cartesian2ToCartesian3(evt.position, this.is3D)

      if (!cartesian) {
        return
      }
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const mapPosition = this._radiansToDegrees(cartographic)

      this._eventObj.LEFT_UP.forEach(fnObj => {
        if (fnObj && fnObj.enable) {
          fnObj.fn({
            cartographic,
            position: mapPosition,
            pickObj: this.scene.pick(evt.position) ? this.scene.pick(evt.position) : false,
            xy: evt.position
          })
        }
      })
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
  }

  /*
   * 鼠标按下事件
   * */
  _leftDOWNEvent() {
    this._handler.setInputAction(evt => {
      if (this._eventObj.LEFT_DOWN.size < 1) {
        return
      }
      if (!evt.position) {
        return
      }

      const cartesian = this._Cartesian2ToCartesian3(evt.position, this.is3D)

      if (!cartesian) {
        return
      }
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const mapPosition = this._radiansToDegrees(cartographic)

      this._eventObj.LEFT_DOWN.forEach(fnObj => {
        if (fnObj && fnObj.enable) {
          fnObj.fn({
            cartographic,
            position: mapPosition,
            pickObj: this.scene.pick(evt.position) ? this.scene.pick(evt.position) : false,
            xy: evt.position
          })
        }
      })
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
  }

  /*
   * 地表弧度坐标转地表经纬度
   * */
  _radiansToDegrees(radians) {
    return {
      longitude: Cesium.Math.toDegrees(radians.longitude),
      latitude: Cesium.Math.toDegrees(radians.latitude),
      height: radians.height
    }
  }

  /*
   * Cartesian2转Cartesian3
   * */
  _Cartesian2ToCartesian3(Cartesian2, is3D) {
    let myCartesian3
    if (is3D) {
      const ray = this.camera.getPickRay(Cartesian2)
      myCartesian3 = this.scene.globe.pick(ray, this.scene)
    } else {
      myCartesian3 = this.camera.pickEllipsoid(Cartesian2, this.scene.globe.ellipsoid)
    }
    return myCartesian3
  }

  /*
   * 恢复
   * flyTime:飞行时间 ，秒，false为直接定位
   * */
  initViewer(duration = 1) {
    this.setView(this._initPostion, duration)
  }

  // 放大
  zoomIn(height = 80000) {
    const curHeight = this.getViewCentre().height

    let zoom = height
    if (curHeight < 1001) {
      return
    }
    if (curHeight < 150000) {
      zoom = 2000
    }
    this.camera.zoomIn(zoom)
  }

  // 缩小
  zoomOut(height = 300000) {
    this.camera.zoomOut(height)
  }

  // 二三维切换
  switchDimension(is3D, time = 0) {
    if (is3D !== '' && is3D === this.is3D) {
      return
    }

    this.is3D ? this.scene.morphTo2D(time) : this.scene.morphTo3D(time)
    this.is3D = is3D
  }

  _initTerrain() {
    const terrainAry = this.mapCfg.terrainAry

    if (!terrainAry) {
      return
    }
    for (const element of terrainAry) {
      if (element.isShow) {
        if (element.type === 'cesium') {
          this.terrainProvider = Cesium.createWorldTerrain()
        } else if (element.type === 'tdt') {
          const terrainUrls = []

          for (const value of element.subdomains) {
            const url = element.url.replace('{s}', value) + 'mapservice/swdx?tk=' + this.token
            terrainUrls.push(url)
          }

          this.terrainProvider = new Cesium.GeoTerrainProvider({
            urls: terrainUrls
          })
        } else {
          this.terrainProvider = new Cesium.CesiumTerrainProvider({
            url: element.url
          })
        }
      }
    }
  }

  _initLayer() {
    const layers = this.mapCfg.layers

    if (layers) {
      this.imageryLayers.removeAll()
      for (const element of layers) {
        let curLayer

        if (element.type === 'shpLayer') {
          curLayer = this.loadShp(element.id, element.url, element.layerName)
          curLayer.show = element.show
          curLayer.name = element.name
          curLayer.id = element.id
          curLayer.need = element.need
          curLayer.isLabel = element.isLabel
        } else if (element.type === 'intranet') {
          //济南公共服务域
          const imageryProvider = new Cesium.UrlTemplateImageryProvider({
            url: element.url,
            tilingScheme: new Cesium.GeographicTilingScheme({
              numberOfLevelZeroTilesX: 2,
              numberOfLevelZeroTilesY: 1
            }),

            customTags: {
              myLevel: function (imageryProvider, x, y, z) {
                return z + 1
              }
            }
          })

          curLayer = this.imageryLayers.addImageryProvider(imageryProvider)
          curLayer.show = element.show
          curLayer.name = element.name
          curLayer.id = element.id
          curLayer.need = element.need
          curLayer.isLabel = element.isLabel
        } else {
          const imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
            url: element.url + this.token,
            subdomains: element.subdomains,
            maximumLevel: 18
          })
          curLayer = this.imageryLayers.addImageryProvider(imageryProvider)
          curLayer.show = element.show
          curLayer.name = element.name
          curLayer.id = element.id
          curLayer.need = element.need
          curLayer.isLabel = element.isLabel
          curLayer.gamma = 0.66
        }
        this.layerInfoAry.push(curLayer)
      }
    } else {
      this.imageryLayers.get(0).name = '影像图'
      this.imageryLayers.get(0).id = 'default'
      this.imageryLayers.get(0).gamma = 0.66
      this.layerInfoAry.push(this.imageryLayers.get(0))
    }
  }

  // 切换地图
  switchLayer(id, need) {
    for (const layer of this.layerInfoAry) {
      layer.show = layer.id === id || layer.id === need
    }
  }

  /*
   * 加载矢量边界服务
   * layerName:自定义图层名
   * url：服务url
   * layers：发布服务的名
   * */
  loadShp(layerName, url, layers, cqlFilter = false) {
    if (this.layersMap.has(layerName)) {
      return
    }

    const parameters = {
      service: 'WMS',
      format: 'image/png',
      transparent: true,
      width: 512,
      height: 512
    }
    if (cqlFilter) {
      Object.assign(parameters, { CQL_FILTER: cqlFilter })
    }

    const provider = new Cesium.WebMapServiceImageryProvider({
      url: url,
      layers: layers,
      parameters,
      enablePickFeatures: true
    })
    const shpLayer = new Cesium.ImageryLayer(provider)

    this.imageryLayers.add(shpLayer)
    this.layersMap.set(layerName, shpLayer)
    return shpLayer
  }

  /*
   * 视角定位
   *postion：位置 [118, 33, 1000000]||[118, 33]
   * isFly:是否飞行
   * duration:飞行动画时间
   * headingPitchRoll:[度，度，度]左右摇头、上下点头
   * */
  setView(postion, duration = 0) {
    this.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        postion[0],
        postion[1],
        postion[2] ? postion[2] : this.camera.positionCartographic.height
      ), // 设置位置
      orientation: {
        heading: Cesium.Math.toRadians(postion[3] || 0),
        pitch: Cesium.Math.toRadians(postion[4] || -90),
        roll: Cesium.Math.toRadians(postion[5] || 0)
      },
      duration
    })
  }

  /*
   * 增加Entity
   * */
  addEntity(entity, needTrack = false) {
    this.removeEntity(entity.id)

    const myEntity = this.entities.add(entity)
    this.entitiesMap.set(entity.id, myEntity)

    if (needTrack) {
      this.trackedEntity = myEntity
    }

    return myEntity
  }

  /*
   * 改变Entity显隐
   * */
  changeEntityShow(id, isShow, needTrack = false) {
    if (this.entitiesMap.has(id)) {
      const myEntity = this.entities.getById(id)
      myEntity.show = isShow

      if (needTrack && isShow) {
        this.trackedEntity = myEntity
      } else {
        this.trackedEntity = undefined
      }
    }
  }

  /*
   * 移除Entity
   * */
  removeEntity(id) {
    if (this.entitiesMap.has(id)) {
      this.entities.removeById(id)
      this.entitiesMap.delete(id)
    }
  }

  /*
   * 移除所有Entity
   * */
  removeAllEntity() {
    this.entities.removeAll()
    this.entitiesMap.clear()
  }

  saveSence(callback, name = '场景', isAll = true) {
    html2canvas(isAll ? document.body : document.getElementById(this.domId)).then(canvas => {
      let image = canvas.toDataURL('image/png')
      const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
      saveLink.href = image
      saveLink.download = name
      const event = document.createEvent('MouseEvents')
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      saveLink.dispatchEvent(event)
      callback(true)
    })
  }

  // 获取视野范围
  getCurBDInfo() {
    // todo 二维场景？
    const widthCanvas = this.scene.canvas.clientWidth
    const heitCanvas = this.scene.canvas.clientHeight
    const ellipsoid = this.scene.globe.ellipsoid
    const _this = this
    function _getLonLat(x, y) {
      const car3 = _this.camera.pickEllipsoid(new Cesium.Cartesian2(x, y), ellipsoid)
      if (car3) {
        const cartographic = Cesium.Cartographic.fromCartesian(car3)
        return {
          lon: Cesium.Math.toDegrees(cartographic.longitude),
          lat: Cesium.Math.toDegrees(cartographic.latitude)
        }
      }
      return null
    }

    const lonlat_center = _getLonLat(widthCanvas / 2, heitCanvas / 2)
    const lonlat_lt = _getLonLat(0, 0)
    const lonlat_rt = _getLonLat(widthCanvas, 0)
    const lonlat_lb = _getLonLat(0, heitCanvas)
    const lonlat_rb = _getLonLat(widthCanvas, heitCanvas)
    const heitCamara = ellipsoid.cartesianToCartographic(this.camera.position).height

    let lonCenter, latCenter, lonMin, lonMax, latMin, latMax
    let isSpan180 = false
    let lonMax2 = 180
    // 中心

    if (lonlat_center) {
      lonCenter = lonlat_center.lon
      latCenter = lonlat_center.lat
    } else {
      lonCenter = 0
      latCenter = 0
    }
    // 左上角
    if (lonlat_lt) {
      lonMin = lonlat_lt.lon
      latMax = lonlat_lt.lat
    } else {
      lonMin = -180
      latMax = 90
    }
    // 右上角
    if (lonlat_rt) {
      lonMax = lonlat_rt.lon
      if (latMax < lonlat_rt.lat) {
        latMax = lonlat_rt.lat
      }
    } else {
      lonMax = 180
    }
    // 左下角
    if (lonlat_lb) {
      if (lonMin > lonlat_lb.lon) {
        lonMin = lonlat_lb.lon
      }
      latMin = lonlat_lb.lat
    } else {
      latMin = -90
    }
    // 右下角
    if (lonlat_rb) {
      if (lonMax < lonlat_rb.lon) {
        lonMax = lonlat_rb.lon
      }
      if (latMin > lonlat_rb.lat) {
        latMin = lonlat_rb.lat
      }
    }

    // todo 简单判断 取中心y点 x=0 --> widthCanvas 出现到180再减小 则跨180度
    if (lonMax < lonMin) {
      isSpan180 = true
      lonMax2 = lonMax
      lonMax = 180
    }

    return {
      LonMin: lonMin,
      LonMax: lonMax,
      LatMin: latMin,
      LatMax: latMax,
      IsSpan180: isSpan180,
      LonMax2: lonMax2,
      MapCenterLon: lonCenter,
      MapCenterLat: latCenter,
      MapCenterAlt: heitCamara,
      Width: widthCanvas,
      Height: heitCanvas
    }
  }

  /*
   * 获取当前视野中心
   * */
  getViewCentre() {
    return this._radiansToDegrees(this.camera._positionCartographic)
  }

  getCamaraAlt() {
    let alt = this.camera.getMagnitude()
    if (this.scene.mode === Cesium.SceneMode.SCENE3D) {
      alt = this.scene.globe.ellipsoid.cartesianToCartographic(this.camera.position).height
    }
    return alt
  }

  /*
   * 增加图层
   * layer：图层
   * */
  addLayer(id, layer) {
    this.removeLayer(id)

    this.layersMap.set(id, layer)
    this.imageryLayers.add(layer)
  }

  /*
   * 改变图层显隐
   * layer：图层
   * */
  changeLayerShow(id, isShow, needTrack = false) {
    const myLayer = this.layersMap.get(id)
    myLayer.show = isShow

    needTrack && this.zoomTo(myLayer)
  }

  /*
   * 移除图层
   * layer：图层
   * */
  removeLayer(id) {
    if (this.layersMap.has(id)) {
      this.imageryLayers.remove(this.layersMap.get(id))
      this.layersMap.delete(id)
    }
  }

  /*
   * 移除所有图层
   * */
  removeAllLayer() {
    this.imageryLayers.removeAll()
    this.layersMap.clear()
  }

  // 根据视野高度，获取层级
  getLevel(height) {
    if (height > 48000000) {
      return 0
    } else if (height > 24000000) {
      return 1
    } else if (height > 12000000) {
      return 2
    } else if (height > 6000000) {
      return 3
    } else if (height > 3000000) {
      return 4
    } else if (height > 1500000) {
      return 5
    } else if (height > 750000) {
      return 6
    } else if (height > 375000) {
      return 7
    } else if (height > 187500) {
      return 8
    } else if (height > 93750) {
      return 9
    } else if (height > 46875) {
      return 10
    } else if (height > 23437.5) {
      return 11
    } else if (height > 11718.75) {
      return 12
    } else if (height > 5859.38) {
      return 13
    } else if (height > 2929.69) {
      return 14
    } else if (height > 1464.84) {
      return 15
    } else if (height > 732.42) {
      return 16
    } else if (height > 366.21) {
      return 17
    } else {
      return 18
    }
  }

  /*
   * 增加DataSource
   * */
  addDataSource(id, dataSource, callback) {
    this.removeDataSource(id)

    this.dataSources.add(dataSource).then(res => {
      this.dataSourcesMap.set(id, res)
      callback && callback(res)
    })
  }

  /*
   * 改变DataSource显隐
   * */
  changeDataSourceShow(id, isShow, needTrack = false) {
    const myDataSource = this.dataSourcesMap.get(id)
    if (myDataSource) {
      myDataSource.show = isShow
    }

    needTrack && this.zoomTo(myDataSource)
  }

  /*
   * 判断是否存在
   * */
  getDataSourceShow(id) {
    const myDataSource = this.dataSourcesMap.get(id)
    if (myDataSource) {
      return myDataSource
    } else {
      return false
    }
  }

  /*
   * 移除DataSource
   * */
  removeDataSource(id) {
    if (this.dataSourcesMap.has(id)) {
      this.dataSources.remove(this.dataSourcesMap.get(id))
      this.dataSourcesMap.delete(id)
    }
  }

  //添加济南水系
  addJnWaterLine() {
    axios.get('./data/river_jinan84.json').then(res => {
      const instances = []
      const arr = res.data.features

      for (let line of arr) {
        const info = line.geometry.coordinates
        let otherPoint = []
        for (let lineArr of info) {
          if (lineArr.length > 2) {
            instances.push(
              new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                  positions: Cesium.Cartesian3.fromDegreesArray(lineArr.flat(Infinity)),
                  width: 2.0
                }),
                attributes: {
                  color: new Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.fromCssColorString('rgb(157,204,255)')
                  )
                }
              })
            )
          } else {
            otherPoint.push(...lineArr)
          }
        }
        if (otherPoint.flat(Infinity).length > 2) {
          instances.push(
            new Cesium.GeometryInstance({
              geometry: new Cesium.GroundPolylineGeometry({
                positions: Cesium.Cartesian3.fromDegreesArray(otherPoint.flat(Infinity)),
                width: 2.0
              }),
              attributes: {
                color: new Cesium.ColorGeometryInstanceAttribute.fromColor(
                  Cesium.Color.fromCssColorString('rgb(157,204,255)')
                )
              }
            })
          )
        }
      }

      this.jnWaterLine = this.scene.primitives.add(
        new Cesium.GroundPolylinePrimitive({
          geometryInstances: instances,
          appearance: new Cesium.PolylineColorAppearance(),
          asynchronous: false
        })
      )
    })
  }

  //删除济南水系
  removeJnWaterLine() {
    if (this.jnWaterLine) {
      this.scene.primitives.remove(this.jnWaterLine)
      this.jnWaterLine = null
    }
  }

  // 添加九段线
  _addNineLine() {
    this.nineLinePrimitives = []
    for (let index = 0; index < NineLineData.length; index++) {
      const line = NineLineData[index].geometry.coordinates
      line.filter(value => {
        return (value.length = 2)
      })
      this.nineLinePrimitives.push(
        this.scene.groundPrimitives.add(
          new Cesium.GroundPolylinePrimitive({
            geometryInstances: new Cesium.GeometryInstance({
              geometry: new Cesium.GroundPolylineGeometry({
                positions: Cesium.Cartesian3.fromDegreesArray(line.flat()),
                width: 3
              })
            }),
            appearance: new Cesium.PolylineMaterialAppearance({
              material: new Cesium.Material({
                fabric: {
                  type: 'Color',
                  uniforms: {
                    color: Cesium.Color.WHITE
                  }
                }
              })
            }),
            show: true
          })
        )
      )
    }
  }

  // 将geojson 数据取出自己画
  addGeoJson(json, level = 2) {
    const instances = []
    for (let index = 0; index < json.features.length; index++) {
      const element = json.features[index]

      for (let j = 0; j < element.geometry.coordinates.length; j++) {
        const info = element.geometry.coordinates[j]

        if (level === 2) {
          instances.push(
            new Cesium.GeometryInstance({
              geometry: new Cesium.GroundPolylineGeometry({
                positions: Cesium.Cartesian3.fromDegreesArray(info.flat()),
                width: 4.0
              }),
              attributes: {
                color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#1bf2f5'))
              }
            })
          )
        } else if (level === 3) {
          for (let k = 0; k < info.length; k++) {
            const info_l3 = info[k]
            instances.push(
              new Cesium.GeometryInstance({
                geometry: new Cesium.GroundPolylineGeometry({
                  positions: Cesium.Cartesian3.fromDegreesArray(info_l3.flat()),
                  width: 4.0
                }),
                attributes: {
                  color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#1bf2f5'))
                }
              })
            )
          }
        }
      }
    }
    this.scene.primitives.add(
      new Cesium.GroundPolylinePrimitive({
        geometryInstances: instances,
        appearance: new Cesium.PolylineColorAppearance(),
        asynchronous: false
      })
    )
  }

  cartesian3ToLonLat(cartesian3) {
    const ellipsoid = this.scene.globe.ellipsoid
    const cartographic = ellipsoid.cartesianToCartographic(cartesian3)
    const lon = Cesium.Math.toDegrees(cartographic.longitude)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)
    const alt = cartographic.height
    const data = {
      lon,
      lat,
      alt
    }
    return data
  }

  // 倾斜摄影
  load3DTiles(tilesetUrl, modelMatrix = null) {
    const tileset = new Cesium.Cesium3DTileset({
      url: tilesetUrl,
      maximumScreenSpaceError: 3,
      cullRequestsWhileMovingMultiplier: 10,
      dynamicScreenSpaceError: true,
      modelMatrix: modelMatrix || Cesium.Matrix4.IDENTITY
    })

    this.scene.primitives.add(tileset)
  }

  print(isAll = true) {
    html2canvas(isAll ? document.body : document.getElementById(this.domId)).then(canvas => {
      const dataURL = canvas.toDataURL('image/png')
      const dom = document.getElementById('iframe')
      // this.$refs.iframe.contentWindow.document.body.innerHTML = '' // 清空上一次打印的内容
      dom.contentWindow.document.write(
        '<html><head><style media="print">@page { margin: auto 0mm;} img{width:100%;}</style></head><body><img src=' +
          dataURL +
          '></body></html>'
      )
      setTimeout(_ => {
        dom.contentWindow.print()
      }, 0)
    })
  }
  // 墨卡托坐标转经纬度坐标
  merToLonlat(x, y) {
    const cartographic = this.webMercatorProjection.unproject(new Cesium.Cartesian3(x, y, 0))
    cartographic.longitude = Cesium.Math.toDegrees(cartographic.longitude)
    cartographic.latitude = Cesium.Math.toDegrees(cartographic.latitude)

    return cartographic
  }
}
