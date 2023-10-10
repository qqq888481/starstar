import {axiosSet ,judge} from "../../service.js";   

export function getDistrictMail(data,callback) {//获取首页黄河断面点位置数据
  return axiosSet({
    url: '/api/complianceEvaluation/countRegionStandardInfo',
    method: 'post',
    data:data
  })
  .then(res=>judge(res,callback))
}

