import axios from 'axios' //引入axios
// import { myMessage } from '@/components/0-main/MessageModel/message.js' //全局提示框
import { message } from 'ant-design-vue';
//创建axios实例，请求超时时间为20秒
const axiosSet = axios.create({
	baseURL: import.meta.env.VITE_VUE_APP_WATERTARGET_API,
	timeout: 20000,
})

// 请求发起前拦截
// productShow.interceptors.request.use((config) => {
//     config.headers['Authorization'] = getNewToken()
//     return config;
// })

function judge(res,successCallback){//正确返回处理方法
    let code = res.data.code
    if(code==200){
        successCallback(res.data.data||res.data.content)
    }else{
        message.info('操作失败')
        console.log(res.data)
    }
}

function axiosAllData(res,successCallback){//axios all方法返回数据
    successCallback(res)
}

function downLoadFile(res,successCallback){//正确返回处理方法
    successCallback(res.data)
}
export { axiosSet ,judge,downLoadFile,axiosAllData} //导出
//或者单独的导出export default instance对象
