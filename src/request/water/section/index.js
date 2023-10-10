import {axiosSet ,judge,downLoadFile,axiosAllData} from "../../service.js";   
import axios from 'axios' //引入axios
export function getSectionMail(data,callback) {//获取断面头数据
  return axiosSet({
    url: '/api/complianceEvaluation/countStandardInfo',
    method: 'post',
    data:data
  })
  .then(res=>judge(res,callback))
}

export function getSectionTableData(data,callback) {//获取断面表数据
  return axiosSet({
    url: '/api/complianceEvaluation/queryStandardInfoPage',
    method: 'post',
    data:data
  })
  .then(res=>judge(res,callback))
}

export function getSectionAddressList(data,callback) {//获取行政区列表
  return axiosSet({
    url: '/api/basic/listRegions',
    method: 'get',
    data:data
  })
  .then(res=>judge(res,callback))
}

export function getBlowdownStationList(data,callback) {//根据行政区查排污管网站点
  return axiosSet({
    url: '/api/managementSite/queryManagementSiteInfoListByRegionCode',
    method: 'post',
    data:data
  })
  .then(res=>judge(res,callback))
}

export function getBlowdownData(data,callback) {//查询污管网站点数据
  return axiosSet({
    url: '/api/managementSite/queryManagementSiteList',
    method: 'post',
    data:data
  })
  .then(res=>judge(res,callback))
}

export function exportBlowdownData(data,callback) {//导出污管网站点数据
  return axiosSet({
    url: '/api/managementSite/exportManagementSiteList',
    method: 'post',
    data:data,
    responseType: 'blob'
  })
  .then(res=>downLoadFile(res,callback))
}

export function getSectionRiverList(data,callback) {//获取河流列表
  return axiosSet({
    url: '/api/basic/listRiver',
    method: 'get',
    data:data
  })
  .then(res=>judge(res,callback))
}

export function getSectionList(data,callback) {//获取河流下的断面列表
  return axiosSet({
    url: '/api/section/getSectionList',
    method: 'get',
    params:data
  })
  .then(res=>judge(res,callback))
}

export function getWaterWeatherData(data,callback) {//并发获取水质数据和气象数据接口
  axios.all([getWaterPredictionData(data,()=>{}),getWeatherData(data,()=>{})]).then(
    axios.spread((res1,res2)=>axiosAllData([res1.data,res2.data],callback))
  )
}

export function exportWaterWeatherData(data,callback) {//导出水质数据表格数据
  return axiosSet({
    url: '/api/waterForecastResult/exportWaterPredictionData',
    method: 'post',
    data:data,
    responseType: 'blob'
  })
  .then(res=>downLoadFile(res,callback))
}

export function getWaterPredictionData(data,callback) {//水质预报分析接口数据
  return axiosSet({
    url: '/api/waterForecastResult/getWaterPredictionData',
    method: 'post',
    data:data
  })
}

export function getWeatherData(data,callback) {//预报分析气象 降雨量数据
  return axiosSet({
    url: '/api/weatherForecastResult/getWeatherPredictionData',
    method: 'post',
    data:data
  })
}

export function getHydrologyWeatherData(data,callback) {//并发获取水文数据和气象数据接口
  axios.all([getHydrologyData(data,()=>{}),getWeatherData(data,()=>{})]).then(
    axios.spread((res1,res2)=>axiosAllData([res1.data,res2.data],callback))
  )
}

export function exportHydrologyWeatherData(data,callback) {//导出水文数据表格数据
  return axiosSet({
    url: '/api/hydrologyForecastResult/exportHydrologyPredictionData',
    method: 'post',
    data:data,
    responseType: 'blob'
  })
  .then(res=>downLoadFile(res,callback))
}

export function getHydrologyData(data,callback) {//水文预报分析接口数据
  return axiosSet({
    url: "/api/hydrologyForecastResult/getHydrologyPredictionData",
    method: 'post',
    data:data
  })
}


export function getHydrologySectionList(data,callback) {//获取水问河流下的断面列表
  return axiosSet({
    url: '/api/station/getHydroStationInfo',
    method: 'get',
    params:data
  })
  .then(res=>judge(res,callback))
}



export function getEcologyWeatherData(data,callback) {//并发获取水生态数据和气象数据接口
  axios.all([getEcologyData(data,()=>{}),getWeatherData(data,()=>{})]).then(
    axios.spread((res1,res2)=>axiosAllData([res1.data,res2.data],callback))
  )
}

export function exportEcologyWeatherData(data,callback) {//导出水生态数据表格数据
  return axiosSet({
    url: '/api/ecologyForecastResult/exportEcologyPredictionData',
    method: 'post',
    data:data,
    responseType: 'blob'
  })
  .then(res=>downLoadFile(res,callback))
}

export function getEcologyData(data,callback) {//水生态预报分析接口数据
  return axiosSet({
    url: "/api/ecologyForecastResult/getEcologyPredictionData",
    method: 'post',
    data:data
  })
}


export function returnSectionTable(data,callback) {//导出断面表格数据
  return axiosSet({
    url: '/api/complianceEvaluation/exportStandardInfo',
    method: 'post',
    data:data,
    responseType: 'blob'
  })
  .then(res=>downLoadFile(res,callback))
}

