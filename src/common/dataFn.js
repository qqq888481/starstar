//处理时间
export function formatTime(timeData) {
  if (Object.keys(timeData).length !== 0) {
    const { firstissue, lastissue } = timeData
    const time1 = `${firstissue.substring(0, 4)}-${firstissue.substring(4, 6)}-${firstissue.substring(
      6,
      8
    )} ${firstissue.substring(8, 10)}:${firstissue.substring(10, 12)}`

    const time2 = `${lastissue.substring(0, 4)}-${lastissue.substring(4, 6)}-${lastissue.substring(
      6,
      8
    )} ${lastissue.substring(8, 10)}:${lastissue.substring(10, 12)}`
    return [time2, time1]
  } else {
    return []
  }
}

export function formatHourTime(timeData) {
  const time1 = `${timeData.substring(0, 4)}-${timeData.substring(4, 6)}-${timeData.substring(6, 8)} 00:00`

  const time2 = `${timeData.substring(0, 4)}-${timeData.substring(4, 6)}-${timeData.substring(6, 8)} 23:59`
  return [time2, time1]
}
export function getHourTime(timeData) {
  const time1 = `${timeData.substring(0, 4)}-${timeData.substring(4, 6)}-${timeData.substring(
    6,
    8
  )}  ${timeData.substring(8, 10)}`

  return time1
}
//取得tifData的name和时间
export function getName(record) {
 
  if (record.mosaic_file) {
    const str = record.mosaic_file
    const name = str.substring(0, str.length - 23).toLowerCase()
  
    const info1 = str.substring(str.length - 23)
    const info2 = info1.substring(0, 19)
    const info3 = `${info2.slice(0, 4)}-${info2.slice(4)}`
    const info4 = `${info3.slice(0, 7)}-${info3.slice(7)}`
    const info5 = `${info4.slice(0, 13)}:${info4.slice(13)}`
    const info6 = `${info5.slice(0, 16)}:${info5.slice(16)}`
    const info7 = `${info6.slice(0, 19)}.${info6.slice(19)}`
    const time = info7
    return { name, time }
  }
  return { name: '', time: '' }
}
//探针使用
export function formatDegree(value) {
  /// <summary>将度转换成为度分秒</summary>
  value = Math.abs(value)
  let v1 = Math.floor(value) // 度
  let v2 = Math.floor((value - v1) * 60) // 分
  let v3 = Math.round(((value - v1) * 3600) % 60) // 秒
  return v1 + '°' + (v2 < 10 ? '0' + v2 : v2) + "'" + (v3 < 10 ? '0' + v3 : v3) + '"'
  // return value;
}
//获取区域Map对象
export function loopArea(value, mapObject) {
  for (let i = 0; i < value.length; i++) {
    const element = value[i]
    mapObject.set(element.value, element)
    if (element.children) {
      loopArea(element.children, mapObject)
    }
  }
}
//根据issue字段获取日期
export function getNeedTime(cycle, value) {
  let data
  switch (cycle) {
    case 'COOH':
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}  ${value.substr(8, 2)}时`
      break
    case 'COOD':
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)} `
      break
    case 'COFD':
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)} `
      break
    case 'COAW':
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)} `
      break
    case 'COTD':
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)} `
      break
    case 'COAM':
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}`
      break
    case 'COAQ':
      data = `${value.substr(0, 4)}-${monthToQuarter(value.substr(4, 2))}`
      break
    case 'COAY':
      data = `${value.substr(0, 4)}`
      break
    default:
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}  ${value.substr(8, 2)}:${value.substr(
        10,
        2
      )}`
      break
  }
  return data
}
// 月份转季度
export function monthToQuarter(m) {
  let month = m + ''
  let Q
  switch (month) {
    case '01':
    case '02':
    case '03':
      Q = 'Q1'
      break
    case '04':
    case '05':
    case '06':
      Q = 'Q2'
      break
    case '07':
    case '08':
    case '09':
      Q = 'Q3'
      break
    case '10':
    case '11':
    case '12':
      Q = 'Q4'
      break
    default:
      Q = month
      break
  }
  return Q
}
//判断为空函数(注意，0不为空)
export function isEmpty(val) {
  // null or undefined
  if (val === null || val === undefined) return true

  if (typeof val === 'boolean') return false

  if (typeof val === 'number') return false

  if (val instanceof Error) return val.message === ''

  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case '[object String]':
    case '[object Array]':
      return !val.length

    // Map or Set or File
    case '[object File]':
    case '[object Map]':
    case '[object Set]': {
      return !val.size
    }
    // Plain Object
    case '[object Object]': {
      return !Object.keys(val).length
    }
  }

  return false
}

//地区列表
export function loop(list, option) {
  for (let i = 0; i < list.length; i++) {
    const element = list[i]
    if (element.value) {
      option.push({
        value: element.value,
        label: element.label
      })
    }
    if (element.children) {
      loop(element.children, option)
    }
  }
}
//趋势统计区域级联下拉框
export function loopCascader(list, option) {
  for (let i = 0; i < list.length; i++) {
    const element = list[i]
    const charr = []
    if (element.regionid !== ZBAreaValue) {
      for (let j = 0; j < element.children.length; j++) {
        const c = element.children[j]
        charr.push({
          value: c.regionid,
          label: c.fullname
        })
      }
      if (element.regionid) {
        option.push({
          value: element.regionid,
          label: element.fullname,
          children: charr
        })
      }
    }
  }
}

//时间戳转北京时间
export function formatDate(oldDate) {
  // 方式1 转换为'yyyy-MM-dd HH:mm:ss'
  function add0(num) {
    return num < 10 ? '0' + num : num
  } // 个位数的值在前面补0
  const date = new Date(oldDate)
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  const h = date.getHours()
  // const m = date.getMinutes()
  // const s = date.getSeconds()

  // const dateString =
  // 	Y +
  // 	'-' +
  // 	add0(M) +
  // 	'-' +
  // 	add0(D) +
  // 	'  ' +
  // 	add0(h) +
  // 	':' +
  // 	add0(m) +
  // 	':' +
  // 	add0(s)
  const dateString = Y + '-' + add0(M) + '-' + add0(D) + '  ' + add0(h)

  return dateString

  // 方式2 转换为'yyyy/MM/dd HH:mm:ss'
  // return new Date(oldDate).toLocaleString()
}

//获取当前季度
export function getQuarter() {
  let currMonth = new Date().getMonth() + 1
  let currQuarter = Math.floor(currMonth % 3 === 0 ? currMonth / 3 : currMonth / 3 + 1)
  let curYear = new Date().getFullYear()
  return { curYear, currQuarter }
}

//根据季度获取年份和月份
export function getDateByQuarter(data) {
  const year = data.substr(0, 4)
  const quarter = data.substr(-1)
  return { year, quarter }
}
//丢失精度问题，两数相乘
export const accMul = (arg1, arg2) => {
  let m = 0
  const s1 = arg1.toString()
  const s2 = arg2.toString()
  try {
    m += s1.split('.')[1].length
  } catch (e) {}
  try {
    m += s2.split('.')[1].length
  } catch (e) {}
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m)
}

//节流
export function throttle(callback, delay = 1000) {
  // console.log(new Date()) //查看间隔时间
  let timer
  return function () {
    if (timer) return
    callback()
    timer = setTimeout(() => {
      timer = null
    }, delay)
  }
}
// 通过js的内置对象JSON来进行数组对象的深拷贝
export function deepClone2(obj) {
  let _obj = JSON.stringify(obj)
  let objClone = JSON.parse(_obj)
  return objClone
}

/*加载边界
element为每个区县的数据
*/
export function loadBorder(element, viewer) {
  drawLabel(viewer, element)
  drawLine(viewer, element)
}

//区县边界
function drawLine(viewer, element) {
  console.log('%c Line:8 🥖 element', 'color:#93c0a4', element)
  const instances = []
  const info = element.geometry.rings[0]

  if (element.geometry.type === 'MultiPolygon') {
    for (let c = 0; c < element.geometry.rings.length; c++) {
      instances.push(
        new Cesium.GeometryInstance({
          geometry: new Cesium.GroundPolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArray(element.geometry.rings[c][0].flat()),
            width: 4.0
          }),
          attributes: {
            color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#1bf2f5'))
          }
          // id: element.properties.PAC,
        })
      )
    }
  } else {
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
  }
  const result = new Cesium.GroundPolylinePrimitive({
    geometryInstances: instances,
    appearance: new Cesium.PolylineColorAppearance(),
    asynchronous: false
  })
  result.type = 'border'
  viewer.scene.primitives.add(result)
  setCenterLon(element, viewer)
}
//区县名字
function drawLabel(viewer, element) {
  console.log('%c Line:57 🌰 element', 'color:#ea7e5c', element)
  const labels = viewer.scene.primitives.add(new Cesium.LabelCollection())
  labels.add({
    position: Cesium.Cartesian3.fromDegrees(element.attributes.lon, element.attributes.lat, 2.61),
    text: element.attributes.NAME,
    font: '14px Source Han Sans CN', //字体样式
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 374212.5412589345)
  })
}
//视角定位
function setCenterLon(element, viewer) {
  const centerPosition = {
    lat: element.attributes.lat,
    lon: element.attributes.lon
  }
  viewer.setView([centerPosition.lon, centerPosition.lat, 2e5], 1)
}
