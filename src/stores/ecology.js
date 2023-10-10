import { defineStore } from 'pinia'

export const ecologyStore = defineStore('ecology', {
  state: () => {
    return {
      productList: [], //生态遥感监测产品列表数据
      curProduct: {}, //当前选择的产品信息
      evalutionData: {}, //生态评估右侧面板数据
      areaList: [], //区县列表
      mapShowStyle: '2.1', //重要性或功能评估项
      curArea: {}, //当前选择的区县
      curTime: null, //当前选择的时间
      curTime2: null, //当前选择的时间12进制
      panelValue: null, //当前所要显示的xxx某个产品的指数和面积占比等数据
      panelShow: false, //面板是否要显示
      opacityData: 1.0, //透明度
      timeList: [], //时间轴slider数组
      legendData: [], //当前获取到的图例数据
      issue: null, //当前产品期次,
      curData: {},
      panelData: null, //当前产品的右侧面版数据
      echartsData: {}, //图表数据
      barClickData: null, //当前展示的详细数据
      picAreaValue: null //展示图片用的地区value
    }
  },
  actions: {
    setCurArea(value) {
      this.curArea = value
    },
    setProductList(value) {
      this.productList = value
    },
    setOpacityData(value) {
      this.opacityData = value
    },
    setTimeList(value) {
      this.timeList = value
      return value
    },
    setLegendData(value) {
      this.legendData = value
    },
    setIssue(value) {
      this.issue = value
    },
    setCurData(value) {
      this.curData = value
    },
    setPanelData(value) {
      this.panelData = value
    },
    setEchartsData(value) {
      this.echartsData = value
    },
    setPanelShow(value) {
      this.panelShow = value
    },
    setEvalutionData(value) {
      this.evalutionData = value
    }
  }
})
