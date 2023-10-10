import Axios from 'axios'
import { city } from './data/AreaCity'
import { County } from './data/AreaCounty'
// 根据剩余容量取颜色
export function getColor(target, info) {
  let value
  if (target === 'cod') {
    if (info === undefined || !info.codSurplusCapacity || info.codSurplusCapacity === null) {
      return '#cccccc'
    } else {
      value = Number(info.codSurplusCapacity)
    }
  } else {
    if (info.nhSurplusCapacity === null) {
      return '#cccccc'
    } else {
      value = Number(info.nhSurplusCapacity)
    }
  }
  if (value < -1200) {
    return '#FF8C00'
  } else if (value >= -1200 && value < -600) {
    return '#FFA500'
  } else if (value >= -600 && value < 300) {
    return '#FFFF00'
  } else if (value >= 300 && value < 700) {
    return '#FFD700'
  } else if (value >= 700 && value < 1000) {
    return '#00FF00'
  } else if (value >= 1000 && value < 1300) {
    return '#ADFF2F'
  } else if (value >= 1300 && value < 1700) {
    return '#1E90FF'
  } else if (value >= 1700) {
    return '#00BFFF'
  } else {
    return '#87CEEB'
  }
}

export function getColorMonth(target, info) {
  let value
  if (target === 'cod') {
    if (info === undefined || !info.codSurplusCapacity || info.codSurplusCapacity === null) {
      return '#cccccc'
    } else {
      value = Number(info.codSurplusCapacity)
    }
  } else {
    if (info.nhSurplusCapacity === null) {
      return '#cccccc'
    } else {
      value = Number(info.nhSurplusCapacity)
    }
  }
  if (value < 1000) {
    return '#FF8C00'
  } else if (value >= 1000 && value < 1800) {
    return '#FFA500'
  } else if (value >= 1800 && value < 5000) {
    return '#FFFF00'
  } else if (value >= 5000 && value < 14000) {
    return '#FFD700'
  } else if (value >= 14000 && value < 17000) {
    return '#00FF00'
  } else if (value >= 17000 && value < 18000) {
    return '#ADFF2F'
  } else if (value >= 18000 && value < 21000) {
    return '#1E90FF'
  } else if (value >= 21000) {
    return '#00BFFF'
  } else {
    return '#87CEEB'
  }
}

export function getColorRiver(target, info) {
  let value
  if (target === 'cod') {
    if (info === undefined || !info.codSurplusCapacity || info.codSurplusCapacity === null) {
      return '#cccccc'
    } else {
      value = Number(info.codSurplusCapacity)
    }
  } else {
    if (info.nhSurplusCapacity === null) {
      return '#cccccc'
    } else {
      value = Number(info.nhSurplusCapacity)
    }
  }
  if (value < -1300) {
    return '#FF8C00'
  } else if (value >= -1300 && value < -200) {
    return '#FFA500'
  } else if (value >= -200 && value < 0) {
    return '#FFFF00'
  } else if (value >= 0 && value < 100) {
    return '#FFD700'
  } else if (value >= 100 && value < 300) {
    return '#00FF00'
  } else if (value >= 300 && value < 500) {
    return '#ADFF2F'
  } else if (value >= 500 && value < 1000) {
    return '#1E90FF'
  } else if (value >= 1000) {
    return '#00BFFF'
  } else {
    return '#87CEEB'
  }
}

export function getColorRiverMonth(target, info) {
  let value
  if (target === 'cod') {
    if (info === undefined || !info.codSurplusCapacity || info.codSurplusCapacity === null) {
      return '#cccccc'
    } else {
      value = Number(info.codSurplusCapacity)
    }
  } else {
    if (info.nhSurplusCapacity === null) {
      return '#cccccc'
    } else {
      value = Number(info.nhSurplusCapacity)
    }
  }
  if (value < 300) {
    return '#FF8C00'
  } else if (value >= 300 && value < 500) {
    return '#FFA500'
  } else if (value >= 500 && value < 700) {
    return '#FFFF00'
  } else if (value >= 700 && value < 1250) {
    return '#FFD700'
  } else if (value >= 1250 && value < 1500) {
    return '#00FF00'
  } else if (value >= 1500 && value < 2000) {
    return '#ADFF2F'
  } else if (value >= 2000 && value < 2900) {
    return '#1E90FF'
  } else if (value >= 2900) {
    return '#00BFFF'
  } else {
    return '#87CEEB'
  }
}

export function _getColor(info) {
  const value = Number(info)
  if (value < -200) {
    return '#d10000'
  } else if (value >= -200 && value < -100) {
    return '#ff5000'
  } else if (value >= -100 && value < 0) {
    return '#ffa000'
  } else if (value >= 0 && value < 100) {
    return '#dbff2b'
  } else if (value >= 100 && value < 200) {
    return '#82fe82'
  } else if (value >= 200 && value < 400) {
    return '#02feff'
  } else if (value >= 400 && value < 800) {
    return '#0071fe'
  } else if (value >= 800) {
    return '#2440ff'
  } else {
    return '#cccccc'
  }
}

// 指标名称转化
export function getName(name) {
  if (name === 'cod') {
    return 'COD'
  }
  if (name === 'nh3n') {
    return 'NH3-N'
  }
}

//济南边界
export function loadJiNanBorder(callback) {
  Axios.all([
    Axios.get('./data/jiNanQx.json'),
    Axios.get('./data/AreaCity.json'),
    Axios.get('./data/AreaCounty.json')
  ]).then(
    Axios.spread((r1, r2, r3) => {
      //-------js-----
      // const r2 = {}
      // r2.data = city
      // console.log('%c Line:192 🥥 r2', 'color:#3f7cff', r2)
      // const r3 = {}
      // r3.data = County
      //-------jsend-----
      const instances = []
      for (let index = 0; index < r2.data.features.length; index++) {
        const element = r2.data.features[index]
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: Cesium.Cartesian3.fromDegreesArray(element.geometry.coordinates[0].flat()),
              width: 2.0
            }),
            attributes: {
              color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#dc143c'))
            },
            id: element.properties.ID
          })
        )
      }

      const instance = new Cesium.GeometryInstance({
        geometry: new Cesium.GroundPolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArray(r2.data.features[0].geometry.coordinates[0].flat()),
          width: 4.0
        }),
        attributes: {
          color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#dc143c'))
        }
      })
      r3.data.features.forEach(element => {
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: Cesium.Cartesian3.fromDegreesArray(element.geometry.coordinates[0].flat()),
              width: 4.0
            }),
            attributes: {
              color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#e9faff'))
            }
          })
        )
      })

      instances.push(instance)

      const result = new Cesium.GroundPolylinePrimitive({
        geometryInstances: instances,
        appearance: new Cesium.PolylineColorAppearance(),
        asynchronous: false
      })
      callback(result)
      return result
    })
  )
}

//区县名称
export function loadLabel(viewer) {
  Axios.get('./data/allCityCenter.json').then(r => {
    const data = r.data
    const labels = viewer.scene.primitives.add(new Cesium.LabelCollection())
    for (let item of data) {
      labels.add({
        position: new Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 3.0),
        text: item.NAME,
        id: item.ID,
        font: '16px Helvetica',
        fillColor: Cesium.Color.PAPAYAWHIP,
        // fillColor: Cesium.Color.fromCssColorString('#dc143c'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE
      })
    }
  })
}
