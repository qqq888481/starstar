import { getShowDate, formatDateStr, isEmpty, get_Time } from '@/common/yaogan/dataFn.js'
/**
 *
 * @desc接口数据处理函数
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
  const list = []
  const issueList1 = []
  const regionList1 = []
  for (let regionItem of data) {
    let obj
    regionList1.push(regionItem.regionName)
    for (let issueItem of regionItem.regionDataList) {
      for (let item of issueItem.issueDataList) {
        obj = { ...item, regionId: regionItem.regionId, regionName: regionItem.regionName, issue: issueItem.issue }
        issueList1.push(issueItem.issue)
        list.push(obj)
      }
    }
  }
  const issueList = [...new Set(issueList1)] //数组去重
  const regionList = [...new Set(regionList1)] //数组去重
  return { list, issueList, regionList }
}

//构成比例
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
export const radioColumns = []
for (let item of radioList) {
  radioMap.set(item.name, item.value)
  radioColumns.push({
    title: item.name + '比例',
    key: item.value + 'coverage_percent'
  })
  radioColumns.push({
    title: '同比(%)',
    key: item.value + 'tbValue'
  })
}
export function getComRatioEntity(data) {
  const list = []
  const issueList1 = []
  const regionList1 = []

  for (let reginItem of data) {
    for (let issueItem of reginItem.regionDataList) {
      let obj = { issue: issueItem.issue, regionName: reginItem.regionName, regionId: reginItem.regionId }

      for (let item of issueItem.issueDataList) {
        const key = radioMap.get(item.cosystem_type)
        const coveragekey = key + 'coverage_percent'
        const tbValuekey = key + 'tbValue'
        if (key) {
          obj[coveragekey] = item.coverage_percent
          obj[tbValuekey] = item.tbValue
        }
      }
      issueList1.push(issueItem.issue)
      regionList1.push(reginItem.regionName)
      list.push(obj)
    }
  }

  const issueList = [...new Set(issueList1)] //数组去重
  const regionList = [...new Set(regionList1)] //数组去重
  return { list, issueList, regionList }
}

//变化方向
export const legendList = typelist
export function getChangeDirectionEntity(data) {
  //处理结果：表格数据、xdataMap，ydataMap

  const list = []
  const xMap = new Map()
  const yMap = new Map()

  const issueDataList = data[0]?.regionDataList[0]?.issueDataList
  if (issueDataList && issueDataList.length > 0) {
    for (let type of legendList) {
      const xData = legendList.filter(item => item !== type) //x轴对应data
      const yData = []
      const curTypeData = issueDataList.find(value => value.type_before === type)
      if (curTypeData) {
        for (let element of curTypeData.changeList) {
          let obj = { ...element }
          list.push(obj)
          const index = xData.findIndex(type => type === element.type_after)
          yData[index] = !isEmpty(element.change_coverage) ? element.change_coverage : '--'
        }
      }
      xMap.set(type, xData)
      yMap.set(type, yData)
    }
  }
  return { list, xMap, yMap }
}

//斑块数
export function getPlaqueNumEntity(data) {
  const list = []
  const issueList1 = []
  const regionList1 = []
  for (let regionItem of data) {
    let obj
    regionList1.push(regionItem.regionName)
    for (let issueItem of regionItem.regionDataList) {
      for (let item of issueItem.issueDataList) {
        obj = { ...item, regionId: regionItem.regionId, regionName: regionItem.regionName, issue: issueItem.issue }
        issueList1.push(issueItem.issue)
        list.push(obj)
      }
    }
  }
  const issueList = [...new Set(issueList1)] //数组去重
  const regionList = [...new Set(regionList1)] //数组去重
  return { list, issueList, regionList }
}

//聚集度指数,边界密度、动态度
export function getAggIndexEntity(data) {
  const list = []
  const issueList1 = []
  const regionList1 = []
  for (let r = 0; r < data.length; r++) {
    const reginItem = data[r]
    regionList1.push(reginItem.regionName)
    for (let item of reginItem.regionDataList) {
      const obj = { number: r + 1, regionId: reginItem.regionId, regionName: reginItem.regionName, ...item }
      issueList1.push(item.issue)
      list.push(obj)
    }
  }
  const issueList = [...new Set(issueList1)] //数组去重
  const regionList = [...new Set(regionList1)] //数组去重

  return { list, issueList, regionList }
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
