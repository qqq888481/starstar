import {axiosSet ,judge,downLoadFile} from "../../service.js";   

export function getIndicatorContributionList(data,callback) {//获取断面指标贡献率
  return axiosSet({
    url: '/api/indicatorContributionRate/sectionIndicatorContributionRate',
    method: 'post',
    data:data
  })
  .then(res=>judge(res,callback))
}


export function exportIndicatorData(data,callback) {//导出断面指标贡献率
    return axiosSet({
      url: '/api/indicatorContributionRate/exportSectionIndicatorContributionRate',
      method: 'post',
      data:data,
      responseType: 'blob'
    })
    .then(res=>downLoadFile(res,callback))
}

export function getSectionList(data,callback) {//获取断面列表
    return axiosSet({
      url: '/api/indicatorContributionRate/riverAndSection',
      method: 'post',
      data:data
    })
    .then(res=>judge(res,callback))
  }
  
