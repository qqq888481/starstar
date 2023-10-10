import { city } from './data/AreaCity'
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
  if (record.mosaicFile) {
    const str = record.mosaicFile
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
    mapObject.set(element.regionid, element)
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
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}`
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
    if (element.regionid) {
      option.push({
        value: element.regionid,
        label: element.fullname
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
    if (element.regionid !== '130000000000') {
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

//2023-02-08 -> 年20230000 月20230201
export function formatDateStr(time, cycle) {
  let value = time.replace(/-/g, '')
  let str
  switch (cycle) {
    case 'COAY':
      str = value.substr(0, 4) + '0101' + '0000'
      break
    case 'COAM':
      str = `${value.substr(0, 4)}${value.substr(4, 2)}` + '01' + '0000'
      break
    default:
      str = value
      break
  }
  return str
}

//根据周期2022-07-03 00:00 ->  2022-07-01 00:00:00(月)、2022-01-01 00:00:00（年）
export function formatDate_Str(time, cycle) {
  let value = time
  let str
  switch (cycle) {
    case 'COAY':
      str = value.substr(0, 4) + '-01-01 00:00:00'
      break
    case 'COAM':
      str = `${value.substr(0, 7)}` + '-01 00:00:00'
      break
    default:
      str = value
      break
  }
  return str
}

//202204010000->2022-04-01 00:00
export function get_Time(time) {
  const str = `${time.substring(0, 4)}-${time.substring(4, 6)}-${time.substring(6, 8)} ${time.substring(
    8,
    10
  )}:${time.substring(10, 12)}`
  return str
}

//202101010000->2021 、202101010000->202101
export function getShowDate(cycle, time) {
  let value = time
  let str
  switch (cycle) {
    case 'COAY':
      str = value.substr(0, 4)
      break
    case 'COAM':
      str = `${value.substr(0, 4)}` + `${value.substr(4, 6)}`
      break
    default:
      str = value
      break
  }
  return str
}

/**
 * 区域筛选 => 判断点是否在多边形内，探针用
 * @param checkPoint 点坐标（经纬度）[]
 * @param polygonPoints  区域组成坐标（经纬度） []
 *
 */
export function polygonFilter(checkPoint) {
  //区县数据用的js
  const polygonPoints = city.features[0].geometry.coordinates[0]
  var counter = 0
  var i
  var xinters
  var p1, p2
  var pointCount = polygonPoints.length
  p1 = polygonPoints[0]

  for (i = 1; i <= pointCount; i++) {
    p2 = polygonPoints[i % pointCount]
    if (checkPoint[1] > Math.min(p1[1], p2[1]) && checkPoint[1] <= Math.max(p1[1], p2[1])) {
      if (checkPoint[0] <= Math.max(p1[0], p2[0])) {
        if (p1[1] != p2[1]) {
          xinters = ((checkPoint[1] - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]) + p1[0]
          if (p1[0] == p2[0] || checkPoint[0] <= xinters) {
            counter++
          }
        }
      }
    }
    p1 = p2
  }
  if (counter % 2 == 0) {
    return false
  } else {
    return true
  }
}

//根据值，判断在第几个index，用于设置柱状图颜色
export function getColorIndex(arr, value) {
  let index = -1
  for (let i = 0; i < arr.length - 1; i++) {
    const element = arr[i]
    const next = arr[i + 1]
    if (element <= value && value < next) {
      index = i
    }
  }
  return index
}
