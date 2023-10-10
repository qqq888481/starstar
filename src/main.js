import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'
import { createPinia } from 'pinia'

import Antd from 'ant-design-vue'

import 'ant-design-vue/dist/antd.css'
import Axios from 'axios'
import '@/assets/yaogan/iconfont/iconfont.css'
import '@/assets/yaogan/iconfont2/iconfont.css'
import '@/assets/yaogan/iconfont3/iconfont.css'

console.warn(import.meta.env)

// import "animate.css/animate.min.css";
/* 
以下是axios的缓存代码，
调用方法
  Axios.get('http://69385n35u6.zicp.fun:43633/lpdmapi/task/getImgInfo', {
      params: {
        direction: 'bac',
        areaCode: 12575,
        lpdmTime: 2023021812,
        pollType: 'PM25'
      },
      cache: true
    }).then(r => {
      console.warn(r.data)
    })

----------
  Axios.post(
    'http://69385n35u6.zicp.fun:43633/odsAirSiteInfo/getStaData',
    {
      staCode: '18966'
    },
    {
      cache: true
    }
  ).then(r => {
    console.warn(r.data)
  })

*/

let cache = {}
const EXPIRE_TIME = 60000 //1分钟
const CancelToken = Axios.CancelToken
Axios.interceptors.request.use(
  config => {
    if (config.cache) {
      let source = CancelToken.source()
      config.cancelToken = source.token
      let data = cache[config.url + JSON.stringify(config.params)]
      let expire_time = new Date().getTime()
      if (data && expire_time - data.expire < EXPIRE_TIME) {
        source.cancel(data)
      }
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)
Axios.interceptors.response.use(
  response => {
    if (response.config.cache) {
      let data = {
        expire: new Date().getTime(),
        data: response.data
      }
      cache[`${response.config.url}` + JSON.stringify(response.config.params)] = data
    }
    return response
  },
  error => {
    if (Axios.isCancel(error)) return Promise.resolve(error.message.data)
    return Promise.reject(error)
  }
)
createApp(App).use(router).use(Antd).use(createPinia()).mount('#app')
