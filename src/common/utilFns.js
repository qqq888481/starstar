import Axios from 'axios'
import dayjs from 'dayjs'

// 环境根据等级，返回颜色
export function nameToColor(name) {
  let color
  if (name === '优') {
    color = [0, 228, 0]
  } else if (name === '良') {
    color = [255, 255, 0]
  } else if (name === '轻度' || name === '轻度污染' || name === '轻') {
    color = [255, 126, 0, 1]
  } else if (name === '中度' || name === '中度污染') {
    color = [255, 0, 0, 1]
  } else if (name === '重度' || name === '重度污染') {
    color = [153, 0, 76, 1]
  } else if (name === '严重' || name === '严重污染') {
    color = [126, 0, 35, 1]
  } else {
    color = [0, 228, 0]
  }
  return color
}

// 通过js的内置对象JSON来进行数组对象的深拷贝
export function deepClone2(obj) {
  let _obj = JSON.stringify(obj)
  let objClone = JSON.parse(_obj)
  return objClone
}

// 导出json文件 data:数据  filename：test.json
export function saveJSON(data, filename) {
  if (!data) {
    alert('保存的数据为空')
    return
  }
  if (!filename) filename = 'json.json'
  if (typeof data === 'object') {
    data = JSON.stringify(data, undefined, 4)
  }
  let blob = new Blob([data], { type: 'text/json' })
  let e = document.createEvent('MouseEvents')
  let a = document.createElement('a')
  a.download = filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}

// 获取url参数
export const getUrlParam = function (name) {
  const reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i')
  const r = window.location.href.substr(1).match(reg)
  if (r != null) {
    return decodeURI(r[2])
  }
  return undefined
}

// 时间格式化
// YYYY-MM-DD HH:mm:ss和antd一致
// 传入时间2021-01-01 12:00:00，或为false为当前时间
// 需要增加的小时数
export const formatDate = function (fmt = 'YYYY-MM-DD HH:mm:ss', date = false, addHour = 0) {
  if (typeof date !== 'object') {
    date = !date ? new Date() : new Date(date)
    date.setTime(date.getTime() + addHour * 3600 * 1000)
  }
  let o = {
    'M+': date.getMonth() + 1, // 月份
    'D+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return fmt
}

// 生成随机数范围
export const random = function (min, max) {
  if (arguments.length === 2) {
    return Math.floor(min + Math.random() * (max + 1 - min))
  } else {
    return null
  }
}

// 图片加载
export const imgLoadAll = function (arr, callback) {
  const arrImg = []
  for (let value of arr) {
    const img = new Image()
    img.src = value
    img.onload = function () {
      arrImg.push(this)
      if (arrImg.length === arr.length) {
        callback && callback(arrImg)
      }
    }
  }
}

// 经纬度转度分秒
export function formatDegree(value) {
  const isMinus = parseFloat(value) < 0 ? '-' : ''
  value = Math.abs(value)
  const v1 = Math.floor(value) // 度
  const v2 = Math.floor((value - v1) * 60) // 分
  const v3 = Math.round(((value - v1) * 3600) % 60) // 秒
  return isMinus + v1 + '°' + (v2 < 10 ? '0' + v2 : v2) + "'" + (v3 < 10 ? '0' + v3 : v3) + '"'
}

// URL是否有效
export const urlIsValid = function (url, callback) {
  Axios.get(url)
    .then(res => {
      if (res.status === 200) {
        if (res.data === '') {
          callback(false)
        } else {
          callback(true)
        }
      } else {
        callback(false)
      }
    })
    .catch(res => {
      callback(false)
    })
}

// 选中状态
export function changeActive(dom, className, isAddClass) {
  const childNodes = dom.parentNode.childNodes

  for (let element of childNodes) {
    element.classList.remove(className)
  }

  if (isAddClass) {
    dom.classList.add(className)
  }
}

// 创建图例
export function createLegend(data, id) {
  const canvas = document.getElementById(id)

  const ctx = canvas.getContext('2d')
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  canvas.width = width
  canvas.height = height
  const { color, value } = data

  const drawWidth = 20
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(0, 0, width, height)

  const sX = 5
  const sY = 5
  const yStep = (height - sY * 2) / value.length
  for (let index = 0; index < color.length; index++) {
    const rgb = color[index]
    ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'
    ctx.fillRect(sX, sY + index * yStep, drawWidth, yStep)
  }

  for (let index = 0; index < value.length; index++) {
    ctx.font = '12px Arial'
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'middle'
    ctx.fillText(value[index], sX + drawWidth + 5, sY + index * yStep + 0.5 * yStep)
  }
}

// 下载资源
// 如果是图片的话，特殊处理
export function downloadResource(src, name, isPic = false) {
  const nameAry = name.split('.')
  const type = nameAry[nameAry.length - 1]

  if (type === 'jpg' || type === 'png' || type === 'bmp' || type === 'jpeg' || type === 'gif' || isPic) {
    // 下载图片地址和图片名
    const image = new Image()
    // 解决跨域 Canvas 污染问题
    image.setAttribute('crossOrigin', 'anonymous')
    image.onload = function () {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, image.width, image.height)
      const url = canvas.toDataURL('image/png') // 得到图片的base64编码数据
      const a = document.createElement('a') // 生成一个a元素
      const event = new MouseEvent('click') // 创建一个单击事件
      a.download = name || 'photo' // 设置图片名称
      a.href = url // 将生成的URL设置为a.href属性
      a.dispatchEvent(event) // 触发a的单击事件
    }
    image.src = src
  } else {
    window.location.href = src
  }
}

// const mimeMap = {
// 	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// 	zip: 'application/zip',
// 	xls: 'application/vnd.ms-excel',
// }
// 文件流转blob对象下载，数据可能会是乱码，需要在头里加		responseType: 'arraybuffer',
// MIME 的类型
export function downloadFile(data, fileName, type) {
  let fileType
  if (type === 'xls' || type === 'xlsx') {
    fileType = 'application/vnd.ms-excel'
  }

  const blob = new Blob([data], { type: fileType })
  const a = document.createElement('a')
  const url = window.URL.createObjectURL(blob)
  const filename = fileName
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

const aqi = [50, 100, 150, 200, 300, 500]
const pm25 = [35, 75, 115, 150, 250, 350]
const pm10 = [50, 150, 250, 350, 420, 500]
const so2hour = [150, 500, 650, 800]
const no2hour = [100, 200, 700, 1200, 2340, 3090]
const cohour = [5, 10, 35, 60, 90, 120]
const o3hour = [160, 200, 300, 400, 800, 1000]

const colorAry = [
  {
    name: '优',
    color: '#00B050'
  },
  {
    name: '良',
    color: '#FFFF00'
  },
  {
    name: '轻度',
    color: '#FFC000'
  },
  {
    name: '中度',
    color: '#FF0000'
  },
  {
    name: '重度',
    color: '#7030A0'
  },
  {
    name: '严重',
    color: '#800000'
  }
]

export function getAirColor(ele, value) {
  let result = 5
  let valueAry
  switch (ele) {
    case 'aqi':
      valueAry = aqi
      break
    case 'pm25':
      valueAry = pm25
      break
    case 'pm10':
      valueAry = pm10
      break
    case 'so2':
      valueAry = so2hour
      break
    case 'no2':
      valueAry = no2hour
      break
    case 'co':
      valueAry = cohour
      break
    case 'o3':
      valueAry = o3hour
      break
    default:
      break
  }

  for (let index = 0; index < valueAry.length; index++) {
    const element = valueAry[index]
    if (value < element && element > (valueAry[index - 1] || 0)) {
      result = index
      break
    }
  }

  return colorAry[result]
}

// 环境6参转下标展示
export function eleToShow(ele) {
  let result
  switch (ele) {
    case 'aqi':
      result = 'AQI'
      break
    case 'pm25':
      result = 'PM₂.₅'
      break
    case 'pm10':
      result = 'PM₁₀'
      break
    case 'so2':
      result = 'SO₂'
      break
    case 'no2':
      result = 'NO₂'
      break
    case 'co':
      result = 'CO'
      break
    case 'o3':
      result = 'O₃'
      break
    default:
      break
  }

  return result
}

// 函数防抖[func 函数,wait 延迟执行毫秒数]
// 等你动完，再执行最后一次
const debounceTimeoutMap = new Map()
export function debounce(func, wait, id) {
  const context = this
  const args = arguments
  const debounceTimeout = debounceTimeoutMap.get(id)
  if (debounceTimeout) clearTimeout(debounceTimeout)

  debounceTimeoutMap.set(
    id,
    setTimeout(function () {
      func.apply(context, args)
    }, wait)
  )
}

export function getCookie(name) {
  var prefix = name + '='
  var start = document.cookie.indexOf(prefix)

  if (start === -1) {
    return null
  }

  var end = document.cookie.indexOf(';', start + prefix.length)
  if (end === -1) {
    end = document.cookie.length
  }

  var value = document.cookie.substring(start + prefix.length, end)

  return unescape(value)
}

export function getTimeLabelAry(time, before, after) {
  const addNum = before + after
  const threeBefore = dayjs(time).subtract(before, 'days').format('YYYY-MM-DD')
  let timeAry = []
  for (let i = 0; i < addNum; i++) {
    const num = i
    const today = dayjs(threeBefore).add(num, 'days').format('YYYY-MM-DD 00:00:00')
    for (let j = 0; j < 24; j++) {
      const time = dayjs(today).add(j, 'hours').format('YYYY-MM-DD HH:mm')
      timeAry.push(time)
    }
  }
  return timeAry
}

export function getDateAry(time, before, after) {
  const addNum = before + after
  const weekDay = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const threeBefore = dayjs(time).subtract(before, 'days').format('YYYY-MM-DD')
  let dateAry = []
  for (let i = 0; i < addNum; i++) {
    const num = i
    const today1 = dayjs(threeBefore).add(num, 'days').format('YYYY-MM-DD 00:00:00')
    const today2 = dayjs(threeBefore).add(num, 'days').format('YYYY-MM-DD 24:00:00')
    const date3 = dayjs(threeBefore).add(num, 'days').format('MM-DD')
    const week = dayjs(today1).day()
    let hours = []
    for (let j = 0; j < 24; j++) {
      const time = dayjs(today1).add(j, 'hours').format('YYYY-MM-DD HH')
      hours.push(time)
    }
    dateAry.push({
      time1: today1,
      time2: today2,
      name: `${weekDay[week]}(${date3})`,
      hours: hours
    })
  }
  return dateAry
}

//济南边界
export function loadJiNanBorder(callback) {
  Axios.all([Axios.get('./data/jiNanQx.json'), Axios.get('./data/jiNanFull.json')]).then(
    Axios.spread((r1, r2) => {
      const instances = []
      for (let index = 0; index < r2.data.features.length; index++) {
        const element = r2.data.features[index]
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: Cesium.Cartesian3.fromDegreesArray(element.geometry.coordinates[0][0].flat()),
              width: 2.0
            }),
            attributes: {
              color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#c8dcb7'))
            },
            id: element.properties.PAC
          })
        )
      }

      const instance = new Cesium.GeometryInstance({
        geometry: new Cesium.GroundPolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArray(r2.data.features[0].geometry.coordinates[0][0].flat()),
          width: 4.0
        }),
        attributes: {
          color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#e9faff'))
        }
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

//潍坊边界
export function loadWeiFangBorder(callback) {
  Axios.all([Axios.get('./data/WeiFangCity.json'), Axios.get('./data/WeiFangFull.json')]).then(
    Axios.spread((r1, r2) => {
      const instances = []
      for (let index = 0; index < r2.data.features.length; index++) {
        const element = r2.data.features[index]
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: Cesium.Cartesian3.fromDegreesArray(element.geometry.coordinates[0][0].flat()),
              width: 2.0
            }),
            attributes: {
              color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#c8dcb7'))
            },
            id: element.properties.PAC
          })
        )
      }

      const instance = new Cesium.GeometryInstance({
        geometry: new Cesium.GroundPolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArray(r1.data.features[0].geometry.coordinates[0][0].flat()),
          width: 4.0
        }),
        attributes: {
          color: new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#1bf2f5'))
        }
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

function myImage() {
  return new Image()
}
const imgMap = new Map()

export function getTexImg(texUrl, callBack) {
  if (imgMap.has(texUrl)) {
    callBack(imgMap.get(texUrl))
  } else {
    const image = myImage()
    image.crossOrigin = 'anonymous'
    image.src = texUrl
    image.onload = function () {
      imgMap.set(texUrl, image)
      callBack(image)
    }
  }
}

// 复制指定内容到剪贴板
export function copyText(text) {
  navigator.clipboard?.writeText && navigator.clipboard.writeText(text)
}
