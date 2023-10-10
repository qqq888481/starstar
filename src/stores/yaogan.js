import { defineStore } from 'pinia'

export const yaoganStore = defineStore('yaogan', {
  state: () => {
    return {
      productList: [], //遥感产品列表
      interpolationList: [], //插值列表
      curProduct: null, //当前产品
      legendData: { value: [], color: [], label: [], title: '', unit: '' }, //图例数据
      tifData: null, //当前产品的tif数据
      clipData: null,
      opacityData: 0.6, //透明度
      areaData: null, //当前地区详细信息
      curAreaValue: null, // 当前地区数据具体value值,130100000000 石家庄
      picAreaValue: '130100000000', // 展示图片用的地区value，下属区都贴的石家庄的图
      chooseItem: null, //操作栏选中的项目，专题图、下载等
      thematicVisible: false, //专题图弹窗显隐
      dqStatisticsVisible: false, //单期统计弹窗显隐
      trendStatisticsVisible: false, //趋势统计弹窗显隐
      reanalysisVisible: false, //再分析弹窗显隐
      reportVisible: false, //报告弹窗显隐
      comparativeVisible: false, //卷帘弹窗显隐
      barClickData: null, //当前展示的详细数据
      isPlay: false,
      isShowHot: false, //热点网格面板是否展开
      isShowSite: false, //站点面板是否展开
      siteChecked: '1,2,3,4', //站点数据,国控站1 省控站2 市控站3 微站4
      sitePicChecked: false, //插值图复选框
      siteCheckedObj: null, //当前插值产品
      hotState: {
        siteChecked: true,
        tipChecked: false,
        hasFeedback: true,
        noFeedback: true
      }, //热点网格复选框
      LocationChecked: false, //企业位置复选框
      curHourIssue: '', //当前小时期次
      curProductInfoId: '', //当前小时期次ProductInfoId
      ZBProductArr: [
        '3305217113740681216', //真彩云图
        '3305208420726874112' //沙尘合成
        // '3305215739351146496', //沙尘判识
        // '3305216220387483648', //沙尘云图
      ] //只有石家庄周边的产品
    }
  },
  actions: {
    setProductList(value) {
      this.productList = value
    },
    setInterpolationList(value) {
      this.interpolationList = value
    },
    setCurProduct(value) {
      this.curProduct = value
    },
    setLegendData(value) {
      this.legendData = value
    },
    initLegendData() {
      this.legendData = {
        value: [],
        color: [],
        label: [],
        title: '',
        unit: ''
      }
    },
    setTifData(value) {
      this.tifData = value
    },
    setClipData(value) {
      this.clipData = value
    },
    setOpacityData(value) {
      this.opacityData = value
    },
    setAreaData(value) {
      this.areaData = value
    },
    setCurAreaValue(value) {
      this.curAreaValue = value
    },
    setPicAreaValue(value) {
      this.picAreaValue = value
    },
    setChooseItem(value) {
      this.chooseItem = value
    },
    changVisible([type, value]) {
      this.thematicVisible = false
      this.dqStatisticsVisible = false
      this.trendStatisticsVisible = false
      this[type] = value
    },
    setBarClickData(value) {
      this.barClickData = value
    },
    setIsPlay(value) {
      this.isPlay = value
    },
    setSiteChecked(value) {
      this.siteChecked = value
    },
    setSitePicChecked(value) {
      this.sitePicChecked = value
    },
    setSiteCheckedObj(value) {
      this.siteCheckedObj = value
    },
    setHotState(value) {
      this.hotState = value
    },
    setLocationChecked(value) {
      this.LocationChecked = value
    },
    setIsShowSite(value) {
      this.isShowSite = value
    },
    setIsShowHot(value) {
      this.isShowHot = value
    },
    setCurHourIssue(value) {
      this.curHourIssue = value
    },
    setCurProductInfoId(value) {
      this.curProductInfoId = value
    }
  }
})
