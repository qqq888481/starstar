/**
 *
 * @desc接口数据处理函数  旧处理方式，主要是格局评估有点击事件的情况
 *
 */

//生态遥感统计数据处理
export function getEcoStaticEntity(data) {
  const issueList = [] //期次列表
  const datalist = []
  const dataAllList = []
  if (!data || data.length === 0) {
    return { issueList, datalist }
  }
  data.map(item => {
    issueList.push(item.issue)
    for (let value of item.dataList) {
      const avgstr = `avg${item.issue}`
      const yoystr = `yoy${item.issue}`
      const obj = { regionName: value.regionName, regionId: value.regionId }
      obj[avgstr] = value.indexValue
      obj[yoystr] = value.tb
      dataAllList.push(obj)
    }
  })
  dataAllList.map(item => {
    const index = datalist.findIndex(val => val.regionId === item.regionId)
    if (index === -1) {
      datalist.push(item)
    } else {
      const curData = datalist[index]
      datalist[index] = { ...curData, ...item }
    }
  })

  return { issueList, datalist }
}

//-------------------------------生态格局评估统计start-----------------------------------------------
// 面积变化率
const typelist = ['森林', '灌丛', '草地', '湿地', '农田', '城镇', '荒漠', '其他']
export function getTypeEntity(data) {
  console.log('%c Line:43 🥥 data', 'color:#f5ce50', data)
  const list = []
  const issueList = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]

    typelist.map(t => {
      const obj = { number: i + 1, regionId: item.regionId, regionName: item.regionName, type: t }
      for (let element of item.regionDataList) {
        if (issueList.indexOf(element.issue) === -1) {
          issueList.push(element.issue)
        }
        const typeobj = element.issueDataList.filter(value => value.cosystem_type === t)[0]
        const key1 = 'area' + element.issue
        const key2 = 'carea' + element.issue
        const key3 = 'rateca' + element.issue
        if (typeobj) {
          obj[key1] = parseFloat(typeobj.coverage.toFixed(4))
          obj[key2] = parseFloat(typeobj.change_coverage.toFixed(4))
          obj[key3] = parseFloat(typeobj.change_persent.toFixed(4))
        } else {
          obj[key1] = ''
          obj[key2] = ''
          obj[key3] = ''
        }
      }
      list.push(obj)
    })
  }

  return { list, issueList }
}
//变化方向
export const changeLablelist = typelist
export function getChangeDirectionEntity(data) {
  console.log(data)
  if (!data || !data[0]) {
    return
  }
  const regionName = data[0].regionName
  const regionId = data[0].regionId
  const issueDataList = data[0].regionDataList[0]?.issueDataList
  const labelList = [] //变化前value
  const datalist = []
  const echartData = [] //雷达图数据
  const echartMap = new Map() //key为index
  const indicatorMap = new Map() //key为index
  for (let v = 0; v < issueDataList.length; v++) {
    const value = issueDataList[v]
    const chartArr = []
    const indicatorArr = []
    labelList.push(value.type_before)
    for (let label of changeLablelist) {
      if (label !== value.type_before) {
        //排除自身，然后去返回的list面去找各变化方向对应值
        const changeArr = value.changeList.filter(item => label === item.type_after)
        indicatorArr.push(label)
        const item = changeArr[0]
        if (changeArr.length > 0) {
          datalist.push({
            regionId,
            regionName,
            type: item.type_before,
            direction: item.type_after,
            change_coverage: parseFloat(item.change_coverage.toFixed(4)),
            change_coverage_percent: parseFloat(item.change_coverage_percent.toFixed(4)),
            end_percent: parseFloat(item.end_percent.toFixed(4)),
            start_percent: parseFloat(item.start_percent.toFixed(4))
          })
          chartArr.push(parseFloat(item.change_coverage.toFixed(4))) //echart图显示的是变化面积
        } else {
          //如果接口数据没有变化方向对应值，就补--
          datalist.push({
            regionId,
            regionName,
            type: value.type_before,
            direction: label,
            change_coverage: '--',
            change_coverage_percent: '--',
            end_percent: '--',
            start_percent: '--'
          })
          chartArr.push('--')
        }
      }
    }
    echartMap.set(v, chartArr)
    indicatorMap.set(v, indicatorArr)
    echartData.push({
      name: value.type_before,
      value: chartArr
    })
  }

  return {
    echartData,
    labelList, //type_before数组，用来渲染按钮列表
    datalist, //表格展示数据
    echartMap, //每项对应的echarts数据
    indicatorMap //每个echarts的指标
  }
}

//动态度
export function getDynamicsEntity(data) {
  console.log(data)
  const arr = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    arr.push({
      number: i + 1,
      regionName: item.regionName,
      regionId: item.regionId,
      change_percent: item.regionDataList[0] ? parseFloat(item.regionDataList[0].change_percent.toFixed(4)) : ''
    })
  }
  return arr
}

export let radioList = [
  {
    name: '森林',
    value: 'forest'
  },
  {
    name: '灌丛',
    value: 'shrubs'
  },
  {
    name: '草地',
    value: 'grass'
  },
  {
    name: '湿地',
    value: 'wetland'
  },
  {
    name: '城镇',
    value: 'city'
  },
  {
    name: '农田',
    value: 'farm'
  },
  // {
  //   name: '裸地',
  //   value: 'bare'
  // },
  {
    name: '荒漠',
    value: 'desert'
  },
  {
    name: '其他',
    value: 'other'
  }
]
export let radioMap = new Map()
for (let item of radioList) {
  radioMap.set(item.name, item.value)
}
//构成比例
export function getComRatioEntity(data) {
  const datalist = []
  const issueList = []

  for (let e = 0; e < data.length; e++) {
    const element = data[e]
    const obj = {}
    for (let i of element.regionDataList) {
      if (issueList.indexOf(i.issue) === -1) {
        issueList.push(i.issue)
      }
      for (let val of i.issueDataList) {
        if (radioMap.get(val.cosystem_type)) {
          const key = radioMap.get(val.cosystem_type) + i.issue
          const tbkey = radioMap.get(val.cosystem_type) + 'tb' + i.issue
          obj[tbkey] = val.tbValue != '--' ? parseFloat(val.tbValue.toFixed(4)) : ''
          obj[key] = val.coverage != '--' ? parseFloat(val.coverage.toFixed(4)) : ''
        }
      }
    }
    datalist.push({
      number: e + 1,
      regionName: element.regionName,
      regionId: element.regionId,
      ...obj
    })
  }

  return { datalist, issueList, dataSource: data }
}

//斑块数
export function getPlaqueNumEntity(data) {
  const list = []
  const issueList = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    typelist.map(t => {
      const obj = { number: i + 1, regionId: item.regionId, regionName: item.regionName, type: t }
      for (let element of item.regionDataList) {
        if (issueList.indexOf(element.issue) === -1) {
          issueList.push(element.issue)
        }
        const typeobj = element.issueDataList.filter(value => value.cosystem_type === t)[0]
        const key1 = 'coverage' + element.issue //面积
        const key2 = 'plaque_avg' + element.issue //平均斑块数
        const key3 = 'plaque_num' + element.issue //斑块数
        if (typeobj) {
          obj[key1] = parseFloat(typeobj.coverage.toFixed(4))
          obj[key2] = parseFloat(typeobj.plaque_avg.toFixed(4))
          obj[key3] = parseFloat(typeobj.plaque_num.toFixed(4))
        } else {
          obj[key1] = ''
          obj[key2] = ''
          obj[key3] = ''
        }
      }
      list.push(obj)
    })
  }

  return { list, issueList }
}

//聚集度指数
export function getAggIndexEntity(data) {
  const datalist = []
  const issueList = []
  for (let r = 0; r < data.length; r++) {
    const reginItem = data[r]
    const obj = { number: r + 1, regionId: reginItem.regionId, regionName: reginItem.regionName }
    for (let item of reginItem.regionDataList) {
      if (issueList.indexOf(item.issue) === -1) {
        issueList.push(item.issue)
      }
      const key = item.issue
      obj[key] = parseFloat(item.aggregation_index.toFixed(4))
    }
    datalist.push(obj)
  }

  return { datalist, issueList }
}

//边界密度
export function getBoundaryEntity(data) {
  console.log(data)
  const datalist = []
  const issueList = []
  for (let r = 0; r < data.length; r++) {
    const reginItem = data[r]
    const obj = { number: r + 1, regionId: reginItem.regionId, regionName: reginItem.regionName }
    for (let item of reginItem.regionDataList) {
      if (issueList.indexOf(item.issue) === -1) {
        issueList.push(item.issue)
      }
      const key = item.issue
      obj[key] = parseFloat(item.boundary_density.toFixed(4)) //返回数据属性名
    }
    datalist.push(obj)
  }

  return { datalist, issueList }
}

//-------------------------------生态格局评估统计end-----------------------------------------------

/**
 * @desc 生态服务评估统计
 */

export function getServiceEntity(data) {
  const list = []
  for (let regionItem of data) {
    for (let issueItem of regionItem.issueList) {
      let obj
      if (issueItem && issueItem.data) {
        obj = { ...issueItem.data[0], regionName: regionItem.regionName, regionid: regionItem.regionid }
      } else {
        obj = {
          value: '',
          changeValue: '',
          rate: '',
          veryImportant: '',
          important: '',
          generalImportant: '',
          regionName: regionItem?.regionName,
          regionid: regionItem?.regionid,
          issue: issueItem.issue
        }
      }
      list.push(obj)
    }
  }
  return list
}

/**
 * @desc 生态服务评估统计、质量评估统计
 */

export function getQualityEntity(data) {
  const list = []
  for (let regionItem of data) {
    for (let issueItem of regionItem.issueList) {
      let obj
      if (issueItem && issueItem.data) {
        obj = { ...issueItem.data[0], regionName: regionItem.regionName, regionid: regionItem.regionid }
      } else {
        obj = {
          changeValue: '',
          levelMap: [],
          max: '',
          mean: '',
          min: '',
          quality: '',
          rate: '',
          issue: issueItem.issue,
          regionName: regionItem?.regionName,
          regionid: regionItem?.regionid
        }
      }
      list.push(obj)
    }
  }
  return list
}
