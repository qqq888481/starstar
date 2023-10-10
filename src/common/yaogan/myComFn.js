/* eslint-disable */
import Axios from 'axios'
//格式：2022-09-07
export function getNeedTime(cycle, value) {
  let data
  switch (cycle) {
    case 'COOH':
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}  ${value.substr(8, 2)}`
      break
    case 'COOD':
      data = `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}`
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

//格式：20220910
export function getStrTime(cycle, value) {
  let data
  switch (cycle) {
    case 'COOH':
      data = `${value.substr(0, 4)}${value.substr(4, 2)}${value.substr(6, 2)}${value.substr(8, 2)}`
      break
    case 'COOD':
      data = `${value.substr(0, 4)}${value.substr(4, 2)}${value.substr(6, 2)}13`
      break
    case 'COFD':
      data = `${value.substr(0, 4)}${value.substr(4, 2)}${value.substr(6, 2)}`
      break
    case 'COAW':
      data = `${value.substr(0, 4)}${value.substr(4, 2)}${value.substr(6, 2)}`
      break
    case 'COTD':
      data = `${value.substr(0, 4)}${value.substr(4, 2)}${value.substr(6, 2)}`
      break
    case 'COAM':
      data = `${value.substr(0, 4)}${value.substr(4, 2)}`
      break
    case 'COAQ':
      data = `${value.substr(0, 4)}${value.substr(4, 2)}`
      break
    case 'COAY':
      data = `${value.substr(0, 4)}`
      break
    default:
      data = `${value.substr(0, 4)}${value.substr(4, 2)}${value.substr(6, 2)}${value.substr(8, 2)}${value.substr(
        10,
        2
      )}`
      break
  }
  return data
}

//格式2022年9月30日
export function getTimeText(value) {
  let data = `${value.substr(0, 4)}年${Number(value.substr(4, 2))}月${Number(value.substr(6, 2))}日 `
  return data
}
/*
 * 获取当前时间
 *days:往前推几天，默认为0
 * */
export function getTime(days = 0) {
  const now = new Date()
  now.setDate(now.getDate() - days)
  const year = now.getFullYear() // 得到年份
  const month = now.getMonth() + 1 // 得到月份
  const date = now.getDate() // 得到日期
  const day = now.getDay() // 得到周几
  const hour = now.getHours() // 得到小时
  const minu = now.getMinutes() // 得到分钟
  const sec = now.getSeconds() // 得到秒
  const MS = now.getMilliseconds() // 获取毫秒
  return [year, getFormatDate(month), getFormatDate(date), getFormatDate(hour), getFormatDate(minu), getFormatDate(sec)]
}

// 日期月份/天的显示，如果是1位数，则在前面加上'0'
function getFormatDate(arg) {
  if (arg === undefined || arg === '') {
    return ''
  }

  let re = arg + ''
  if (re.length < 2) {
    re = '0' + re
  }

  return re
}

// 判断两个对象是否想等

/*
 * 改变dom选中状态
 * parentDom：父节点
 * dom：当前选中的子节点
 * active:选中的classname
 * */
export function changeSelect(parentDom, dom, active) {
  const childNodes = parentDom.childNodes
  for (let i = 0; i < childNodes.length; i++) {
    childNodes[i].classList.remove(active)
  }
  if (dom) {
    dom.classList.add(active)
  }
}

/*
 * 下载流数据
 * data：流数据
 * name：文件的名字
 * */
export function downloadBlob(data, name) {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
  })
  const url = window.URL.createObjectURL(blob)
  const aLink = document.createElement('a')
  aLink.style.display = 'none'
  aLink.href = url
  aLink.download = name
  document.body.appendChild(aLink)
  aLink.click()
  document.body.removeChild(aLink) // 下载完成移除元素
  window.URL.revokeObjectURL(url) // 释放掉blob对象
}

// 一周预报周几
export function myDate() {
  const date = new Date().getDay() + 1
  const array = [
    date,
    Number(date + 1),
    Number(date + 2),
    Number(date + 3),
    Number(date + 4),
    Number(date + 5),
    Number(date + 6)
  ]
  for (let i = 0; i < array.length; i++) {
    if (array[i] % 7 === 1) {
      array[i] = '周一'
    } else if (array[i] % 7 === 2) {
      array[i] = '周二'
    } else if (array[i] % 7 === 3) {
      array[i] = '周三'
    } else if (array[i] % 7 === 4) {
      array[i] = '周四'
    } else if (array[i] % 7 === 5) {
      array[i] = '周五'
    } else if (array[i] % 7 === 6) {
      array[i] = '周六'
    } else if (array[i] % 7 === 0) {
      array[i] = '周日'
    }
  }
  const dateArr = array
  return dateArr
}

// 定义天气对应图片和文字
export function mapArray() {
  const mapArr = new Map()
  mapArr.set('00', { name: '晴', url: img0 })
  mapArr.set('01', { name: '多云', url: img1 })
  mapArr.set('02', { name: '阴', url: img2 })
  mapArr.set('03', { name: '阵雨', url: img3 })
  mapArr.set('04', { name: '雷阵雨', url: img4 })
  mapArr.set('05', { name: '雷阵雨伴有冰雹', url: img5 })
  mapArr.set('06', { name: '雨夹雪', url: img6 })
  mapArr.set('07', { name: '小雨', url: img7 })
  mapArr.set('08', { name: '中雨', url: img8 })
  mapArr.set('09', { name: '大雨', url: img9 })
  mapArr.set('10', { name: '暴雨', url: img10 })
  mapArr.set('11', { name: '大暴雨', url: img11 })
  mapArr.set('12', { name: '特大暴雨', url: img12 })
  mapArr.set('13', { name: '阵雪', url: img13 })
  mapArr.set('14', { name: '小雪', url: img14 })
  mapArr.set('15', { name: '中雪', url: img15 })
  mapArr.set('16', { name: '大雪', url: img16 })
  mapArr.set('17', { name: '暴雪', url: img17 })
  mapArr.set('18', { name: '雾', url: img18 })
  mapArr.set('19', { name: '冻雨', url: img19 })
  mapArr.set('20', { name: '沙尘暴', url: img20 })
  mapArr.set('21', { name: '小到中雨', url: img21 })
  mapArr.set('22', { name: '中到大雨', url: img22 })
  mapArr.set('23', { name: '大到暴雨', url: img23 })
  mapArr.set('24', { name: '暴雨到大暴雨', url: img24 })
  mapArr.set('25', { name: '大暴雨到特大暴雨', url: img25 })
  mapArr.set('26', { name: '小到中雪', url: img26 })
  mapArr.set('27', { name: '中到大雪', url: img27 })
  mapArr.set('28', { name: '大到暴雪', url: img28 })
  mapArr.set('29', { name: '浮尘', url: img29 })
  mapArr.set('30', { name: '扬沙', url: img30 })
  mapArr.set('31', { name: '强沙尘暴', url: img31 })
  mapArr.set('53', { name: '霾', url: img53 })
  mapArr.set('99', { name: '无', url: img99 })
  return mapArr
}

//判断是否为空，不包括0，0为true
export function isEmpty(num) {
  if (!num && num != 0) {
    return true
  } else {
    return false
  }
}
//探针使用
export function formatDegree(value) {
  /// <summary>将度转换成为度分秒</summary>
  value = Math.abs(value)
  var v1 = Math.floor(value) // 度
  var v2 = Math.floor((value - v1) * 60) // 分
  var v3 = Math.round(((value - v1) * 3600) % 60) // 秒
  return v1 + '°' + (v2 < 10 ? '0' + v2 : v2) + "'" + (v3 < 10 ? '0' + v3 : v3) + '"'
  // return value;
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

let borderMap = new Map()
//添加边界
export function loadBorder(regionid, viewer, callback) {
  let instancesArr = []
  if (!borderMap.has(regionid)) {
    console.log('222')
    Axios.all([
      Axios.get('./data/AreaCity.json'), //石家庄
      Axios.get('./data/AreaCounty.json') //各区
    ]).then(
      Axios.spread((r1, r2) => {
        const labels = viewer.scene.primitives.add(new Cesium.LabelCollection())
        for (let index = 0; index < r2.data.features.length; index++) {
          const element = r2.data.features[index]
          borderMap.set(element.properties.ID, element)

          // labels.add({
          // 	position: Cesium.Cartesian3.fromDegrees(
          // 		element.properties.lon,
          // 		element.properties.lat,
          // 		2.61
          // 	),
          // 	text: element.properties.NAME,
          // 	font: '14px Source Han Sans CN', //字体样式
          // 	distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          // 		0,
          // 		374212.5412589345
          // 	),
          // })
          // 画全部区县
          // if (element.geometry.type === 'MultiPolygon') {
          // 	for (let c = 0; c < element.geometry.coordinates.length; c++) {
          // 		instancesArr.push(
          // 			new Cesium.GeometryInstance({
          // 				geometry: new Cesium.GroundPolylineGeometry({
          // 					positions: Cesium.Cartesian3.fromDegreesArray(
          // 						element.geometry.coordinates[c][0].flat()
          // 					),
          // 					width: 2,
          // 				}),
          // 				attributes: {
          // 					color: new Cesium.ColorGeometryInstanceAttribute.fromColor(
          // 						Cesium.Color.fromCssColorString('#B0C4DE')
          // 					),
          // 				},
          // 				// id: element.properties.PAC,
          // 			})
          // 		)
          // 	}
          // } else {
          // 	instancesArr.push(
          // 		new Cesium.GeometryInstance({
          // 			geometry: new Cesium.GroundPolylineGeometry({
          // 				positions: Cesium.Cartesian3.fromDegreesArray(
          // 					element.geometry.coordinates[0].flat()
          // 				),
          // 				width: 2,
          // 			}),
          // 			attributes: {
          // 				color: new Cesium.ColorGeometryInstanceAttribute.fromColor(
          // 					Cesium.Color.fromCssColorString('#B0C4DE')
          // 				),
          // 			},
          // 		})
          // 	)
          // }
        }
        //石家庄边界
        for (let index = 0; index < r1.data.features.length; index++) {
          const element = r1.data.features[index]
          borderMap.set(element.properties.ID, element)
        }

        const { centerPosition, result } = draw(borderMap, regionid)
        callback(centerPosition, result)
        return result
      })
    )
    // const result2 = new Cesium.GroundPolylinePrimitive({
    // 	//全部区县
    // 	geometryInstances: instancesArr,
    // 	appearance: new Cesium.PolylineColorAppearance(),
    // 	asynchronous: false,
    // })
    // result2.type = 'allBoundaries'
    // viewer.scene.primitives.add(result2)
  } else {
    const { centerPosition, result } = draw(borderMap, regionid)
    callback(centerPosition, result)
    return result
  }
}
function draw(borderMap, regionid) {
  const instances = []
  const element = borderMap.get(regionid)
  const info = element.geometry.coordinates[0]
  const centerPosition = {
    lat: element.properties.lat,
    lon: element.properties.lon
  }
  //根据id画区县
  if (element.geometry.type === 'MultiPolygon') {
    for (let c = 0; c < element.geometry.coordinates.length; c++) {
      instances.push(
        new Cesium.GeometryInstance({
          geometry: new Cesium.GroundPolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArray(element.geometry.coordinates[c][0].flat()),
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
  return { centerPosition, result }
}

export function clearBorderMap() {
  // 清空边界Map
  borderMap.clear()
}
// 环境6参转下标展示
export function eleToShow(ele) {
  if (!ele) return '--'
  ele = ele.toLowerCase()
  let result
  switch (ele) {
    case 'aqi':
    case 'stnaqi':
      result = 'AQI'
      break
    case 'pm25':
    case 'pm2.5':
    case 'stnpm25':
      result = 'PM₂.₅'
      break
    case 'pm10':
    case 'stnpm10':
      result = 'PM₁₀'
      break
    case 'so2':
    case 'stnso2':
      result = 'SO₂'
      break
    case 'no2':
    case 'stnno2':
      result = 'NO₂'
      break
    case 'co':
    case 'stnco':
      result = 'CO'
      break
    case 'o3':
    case 'stno3':
      result = 'O₃'
      break
    case 'ch4':
      result = 'CH₄'
      break
    case 'co2':
      result = 'CO₂'
      break
    case 'hcho':
      result = 'HCHO'
      break
    case 'aod':
      result = 'AOD'
      break
    default:
      result = ele
      break
  }
  return result
}
//时间戳转北京时间,到日
export function formatDate(oldDate) {
  // 方式1 转换为'yyyyMMdd'
  function add0(num) {
    return num < 10 ? '0' + num : num
  } // 个位数的值在前面补0
  const date = new Date(oldDate)
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()

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
  const dateString = Y + '-' + add0(M) + '-' + add0(D)

  const str = dateString.split('-').join('')
  return str

  // 方式2 转换为'yyyy/MM/dd HH:mm:ss'
  // return new Date(oldDate).toLocaleString()
}

//字符串转成date对象
export function getDateObj(issue) {
  // 20221103
  if (issue) {
    let str = `${issue.substr(0, 4)}-${issue.substr(4, 2)}-${issue.substr(6, 2)}`
    let date = new Date(Date.parse(str.replace(/-/g, '/')))
    return date
  }
}

//echarts多项合并
export function mergeTop5(data, mergeNum = 5) {
  if (data) {
    //大于六个，保留前五，其余合并为其他
    if (data?.length > mergeNum + 1) {
      data.sort((v1, v2) => {
        return parseFloat(v2.value) - parseFloat(v1.value)
      })
      let temp = []
      let other = 0
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        if (i < mergeNum) {
          temp.push(d)
        } else {
          other += parseFloat(d.value)
        }
      }
      temp.push({
        name: '其他',
        value: other
      })
      return temp
    }
    return data
  } else {
    return []
  }
}
// 通过js的内置对象JSON来进行数组对象的深拷贝
export function deepClone2(obj) {
  var _obj = JSON.stringify(obj)
  var objClone = JSON.parse(_obj)
  return objClone
}
//解决丢失精度问题，两数相乘
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

//十六进制转rgb
export function hexToRgb(hex) {
  return (
    'rgb(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ')'
  )
}
//十六进制转rgba
export function hexToRgba(hex, opacity) {
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  )
}
