//全局变量

const isDev = false

//粒子动画数量
const PARTICLE_NUMS = 1000
const interfaceDir = ' http://10.211.128.186:2222/gateway/nature-service' //测试环境
const picUrl = 'http://10.211.128.188:10017/Production' //测试环境

const interfaceDirs = 'http://47.122.41.94:10006/navigator'
const LuodiUrl = 'http://47.122.41.94:8080/upload' //裸地
const windUrl = 'http://47.122.41.94:8080/Production'
const geoserverIP = isDev
  ? 'http://172.29.8.63:10001/IMEE-GlobeServer/zhongshan/wms' //生产服务器
  : 'http://111.200.200.203:36080/IMEE-GlobeServer/zhongshan/wms' //画边界的时候使用

//设置边界是用什么方式添加的
const borderType = 'vector' // 'vector'是JSON文件的方式    serve
// const vectorUrl = './data/AreaCity.json'
//const serveUrl = ''
const isLoadGeo = false //是否用geoserver加载产品

// 地图的初始化经纬度、高度
const initPosition = [117.1, 36.75, 4.3e5, 0, -60, 0] //济南
const initPositionEvalution = [117.5, 36.75, 4.3e5, 0, -60, 0] //服务功能评估济南
const ZBPosition = [114.41842863482712, 38.03741590257156, 1031430.5257048805] //石家庄及其周边中心经纬度

const SJZAreaValue = '130100000000' //石家庄市
const SJZextend = [
  //石家庄四角坐标
  113.51657923826986, 37.43655337821605, 115.362312014488, 38.763596488890926
]
// const ZBAreaValue = '130000000000' // 石家庄及其周边区域id

const FireID = '3305209245360594944' //火点产品id
const LuoDiID = '3305215241134940160' //裸地产品id

const zouhangIP = 'http://47.122.41.94:10006'

//大气一张图测试数据
const JINANIP = 'http://221.214.80.195:1998'
