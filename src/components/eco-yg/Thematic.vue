<!--  
  专题图组件
-->
<script setup>
import { reactive, ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { getNeedTime, formatDateStr } from '@/common/yaogan/dataFn.js'
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RetweetOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  RedoOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { ecologyStore } from '@/stores/ecology.js'
import Request from '@/views/1-ecology/1-eco-yaogan/statistics/request'
const store = ecologyStore()
const props = defineProps({
  pageType: {
    type: String,
    default: 'eco'
  },
  defalutValue: {
    //如果是生态评估，值为当前产品的id
    type: String,
    default: ''
  }
})
const emit = defineEmits(['exit'])
const picRef = ref()
const containRef = ref()
const rowId = ref() //选中行的id
let scale = ref(0.4) //初始缩放比例
let zoomVal = 1
const indicatorState = reactive({
  value: store.curProduct?.id || '3533621704982609920',
  name: computed(() => {
    let name
    let arr = indicatorState.options.filter(item => item.value === indicatorState.value)
    arr.length > 0 && (name = arr[0]?.label)
    return name
  }),
  options: computed(() => {
    const option = []
    for (let item of store.productList) {
      option.push({
        label: item.name,
        value: item.id
      })
    }
    return option
  })
})
const curCycle = computed(() => {
  const curData = store.productList.filter(item => item.id === indicatorState.value)
  if (curData.length > 0) {
    return curData[0]?.cycle
  }
})

const regionState = reactive({
  value: store.curArea?.regionid || '370100000000',
  options: computed(() => {
    const option = []
    store.areaList.map(item => {
      option.push({
        label: item.districtname,
        value: item.regionid
      })
    })
    return option
  })
})

const defaultType = computed(() => {
  //设置服务评估初始值
  if (store.mapShowStyle === '2') {
    return '1'
  }
  if (store.mapShowStyle === '2.1') {
    return '1.1'
  }
})
const typeState = reactive({
  value: defaultType.value,
  options: [
    {
      label: '量级',
      value: '1'
    },
    {
      label: '重要性',
      value: '1.1'
    }
  ]
})
const date = reactive({
  value: store.curTime || ['2022-04-01 ', '2022-07-31 '],
  type: computed(() => {
    if (curCycle.value === 'COAY') {
      return 'year'
    }
    return 'month'
  })
})
const table = reactive({
  columns: [
    {
      title: '全部',
      dataIndex: 'issue',
      key: 'issue'
    }
  ],
  rowKey: record => {
    return record.issueFiles[0]?.productInfoId
  },
  pagi: {
    position: ['bottomCenter'],
    total: 0,
    showLessItems: true,
    showSizeChanger: false,
    pageSize: 3,
    simple: true,
    current: 1,
    onChange: (page, pageSize) => {
      table.pagi.current = page
    }
    // responsive: true,
    // size: 'small'
  },
  list: [],
  selectedRowKeys: [],
  check: data => {
    if (data) {
      return data.length > 0
    }
    return false
  }
})
const query = () => {
  const startTime = formatDateStr(date.value[0], curCycle.value)
  const endTime = formatDateStr(date.value[1], curCycle.value)
  const type = getType() //根据产品不同传不同type
  const data = {
    productId: props.defalutValue ? props.defalutValue : indicatorState.value,
    startTime,
    endTime,
    cycle: curCycle.value,
    regionId: regionState.value,
    types: type,
    pageNum: table.pagi.current,
    pageSize: 1000
  }
  Request.queryFilesByProductIdAndTime(data, res => {
    if (res) {
      table.list = res.list
    } else {
      table.list = []
      clickUrl.url = ''
    }
    table.pagi.total = Number(res.total)
  })
}
const isType = computed(() => {
  let val = false
  if (props.pageType === 'service') {
    val = true
  }
  return val
})
//选择行
const rowSelection = computed(() => {
  return {
    selectedRowKeys: table.selectedRowKeys,
    onSelect: (record, selected) => {
      if (selected) {
        table.selectedRowKeys.push(record.issueFiles[0]?.productInfoId)
      } else {
        const keys = table.selectedRowKeys
        const index = keys.indexOf(record.issueFiles[0]?.productInfoId)
        table.selectedRowKeys = [...keys.slice(0, index), ...keys.slice(index + 1)]
      }
      console.log(table.selectedRowKeys)
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      //全选事件
      const arr = []
      if (selected) {
        for (let ele of table.list) {
          arr.push(ele.issueFiles[0]?.productInfoId)
        }
      }
      table.selectedRowKeys = arr
    }
  }
})
//点击行
const customRow = record => {
  return {
    onClick: () => {
      rowId.value = record.issue
      clickUrl.url = getThematicPic(record.issueFiles)
      clickUrl.name = record.issue
    }
  }
}

const slider = reactive({
  value: 1,
  onChange: value => {
    slider.value = value
  }
})
const clickUrl = reactive({
  name: '',
  url: ''
})
//滑轮滚动时执行
const scaleImg = e => {
  e.preventDefault()
  zoomVal += e.wheelDelta / 600
  if (zoomVal >= 0.2) {
    picRef.value.style.transform = `scale(${zoomVal})`
  } else {
    zoomVal = 0.2
  }
}
const click = data => {
  switch (data) {
    case 'in':
      picRef.value.style.transform = `scale(${zoomVal + 0.1})`
      zoomVal += 0.1
      break
    case 'out':
      if (zoomVal - 0.1 >= 0.2) {
        zoomVal -= 0.1
      }
      picRef.value.style.transform = `scale(${zoomVal - 0.1 >= 0.2 ? zoomVal - 0.1 : 0.2})`
      break
    case 'undo':
      picRef.value.style.transform = `scale(${scale.value})`
      zoomVal = scale.value
      picRef.value.style.left = 'auto'
      picRef.value.style.top = 'auto'
      break
    case 'full':
      click('undo')
      zoomVal = 0.4
      picRef.value.style.transform = `scale(${0.4})`
      containRef.value.requestFullscreen()
      // 添加 resize 绑定事件
      window.addEventListener('resize', getFullScreen, false)
      break
    case 'download':
      // const areaname = picAreaValue.value === '130100000000' ? '石家庄市' : '石家庄及其周边'
      // const tempName = props.name ? props.name + siteTime(clickUrl.name) + areaname : ''
      const tempName = indicatorState.name + clickUrl.name
      Request.downloadThematic(clickUrl.url, tempName)
      break
    case 'GIF':
      if (!table.selectedRowKeys?.length) {
        message.warn({
          content: '请至少选择一条记录！',
          duration: 1,
          onClick: () => message.destroy()
        })
      } else if (table.selectedRowKeys?.length > 10) {
        message.warn({
          content: '最多选择十条记录！',
          duration: 1,
          onClick: () => message.destroy()
        })
      } else {
        message.info({
          content: '下载中，请稍候', //提示的内容
          duration: 1, //提示的时长
          onClick: () => message.destroy() //点击的时候关闭
        })
        getType() //根据产品不同传不同type
        const type = typeState.value
        Request.gifDownload(regionState.value, table.selectedRowKeys, 1 * 1000, type)
      }
      break
    default:
      break
  }
}
const exit = () => {
  emit('exit', '')
}

//图片拖拽移动事件
function mouseMove(data) {
  if (data) {
    let disX = 0
    let disY = 0

    data.onmousedown = e => {
      e = e || window.event
      disX = e.clientX - data.offsetLeft
      disY = e.clientY - data.offsetTop
      data.onmousemove = em => {
        em = em || window.event
        const oLeft = em.clientX - disX
        const oTop = em.clientY - disY
        data.style.left = `${oLeft}px`
        data.style.top = `${oTop}px`
      }
      data.onmouseup = () => {
        data.onmousemove = null //清除 onmousemove 事件
        data.onmouseup = null
      }
      return false
    }
    data.onmouseleave = () => {
      data.onmousemove = null
      data.onmouseup = null
    }
  }
}
//获取当前是否为退出全屏状态，是的话重置初始化图片并移除监听事件
function getFullScreen() {
  let fullScreen =
    parent.document.webkitIsFullScreen ||
    parent.document.fullscreen ||
    parent.document.mozFullScreen ||
    parent.document.msFullscreenElement
  if (fullScreen === undefined) {
    fullScreen = false
  }
  if (!fullScreen) {
    click('undo')
    window.removeEventListener('resize', getFullScreen)
  }
}

//根据productFileInfo的数据项获取专题图src
function getThematicPic(recordInfo) {
  if (recordInfo) {
    // let url = picUrl + recordInfo[0]?.relativePath
    let url = recordInfo[0]?.relativePath
    return url
  }
}
function getType() {
  if (props.pageType === 'eco') {
    //生态遥感展示的是分级专题图
    typeState.value = '1.1'
  } else if (props.pageType === 'service') {
    console.log(11111)
  } else {
    //格局评估、质量评估
    typeState.value = '1'
  }
  return [typeState.value]
}

onMounted(() => {
  query()
})

watch(
  () => clickUrl.url,
  () => {
    mouseMove(picRef.value)
    click('undo')
  }
)
watch(
  () => table.list,
  () => {
    if (table.list.length > 0) {
      const index = table.list.findIndex(item => {
        return item.issue === store.curData?.issue
      })
      if (index > -1) {
        customRow(table.list[index]).onClick() //默认显示时间轴选择的日期的专题图
      } else {
        customRow(table.list[0]).onClick()
      }
    }
  }
)
</script>

<template>
  <div id="ecoThematic">
    <div class="search-d">
      <div class="seach-list">
        <div v-show="!defalutValue">
          监测指标：<a-select
            v-model:value="indicatorState.value"
            style="width: 180px"
            :options="indicatorState.options"
          ></a-select>
        </div>
        <div v-show="isType">
          评估类型：<a-select
            v-model:value="typeState.value"
            style="width: 180px"
            :options="typeState.options"
          ></a-select>
        </div>
        <div>
          选择行政区：<a-select
            v-model:value="regionState.value"
            style="width: 120px"
            :options="regionState.options"
          ></a-select>
        </div>
        <div>
          选择时间：<a-range-picker v-model:value="date.value" :picker="date.type" :valueFormat="'YYYY-MM-DD '" />
        </div>
        <a-button @click="query">查询</a-button>
        <!-- <a-button class="reset-btn">重置</a-button> -->
      </div>

      <div class="btn-group">
        <div @click="exit"><img src="@/assets/yaogan/eco/close.png" alt="" /></div>
      </div>
    </div>
    <div class="ecopage-main">
      <a-table
        :rowKey="table.rowKey"
        :row-selection="rowSelection"
        :columns="table.columns"
        :data-source="table.list"
        :pagination="table.pagi"
        :sticky="table.check(table.list)"
        :custom-row="customRow"
        :row-class-name="record => (record.issue === rowId ? 'clickRow' : null)"
      >
        <template v-slot:bodyCell="{ text, record, index, column }">
          {{ text ? getNeedTime(curCycle, text) : '--' }}
          <img :src="getThematicPic(record.issueFiles)" alt="" class="mini-pic" />
        </template>
      </a-table>
      <div class="eco-pic">
        <div class="container" ref="containRef" @wheel="scaleImg">
          <img alt="" class="mypic" ref="picRef" :src="clickUrl.url" :style="{ transform: `scale(${scale}) ` }" />
        </div>

        <div class="footer">
          <a-tooltip placement="left" title="放大">
            <a-button @click="() => click('in')"> <zoom-in-outlined /></a-button>
          </a-tooltip>
          <a-tooltip placement="left" title="缩小">
            <a-button @click="() => click('out')"> <zoom-out-outlined /></a-button>
          </a-tooltip>
          <a-tooltip placement="left" title="恢复">
            <a-button @click="() => click('undo')">
              <redo-outlined class="rotate" />
            </a-button>
          </a-tooltip>
          <a-tooltip placement="left" title="全屏">
            <a-button @click="() => click('full')">
              <fullscreen-outlined />
            </a-button>
          </a-tooltip>
          <a-tooltip placement="left" title="下载">
            <a-button @click="() => click('download')">
              <download-outlined />
            </a-button>
          </a-tooltip>
          <a-tooltip placement="left" title="GIF下载">
            <a-button @click="() => click('GIF')" class="btn"> GIF</a-button>
          </a-tooltip>
          <!-- <div class="gif">
             <a-row> 
                <a-col :span="12">
                  <a-slider
                    :min="0.1"
                    :max="2"
                    :step="0.1"
                    :value="typeof slider.value === 'number' ? slider.value : 0"
                    @change="slider.onChange"
                  />
                </a-col>
                <a-col :span="4">
                  <a-input-number
                    id="inputNumber"
                    size="small"
                    :value="slider.value"
                    :min="0.1"
                    :max="2"
                    :step="0.1"
                    style="
                       {
                        margin: 0 16px;
                      }
                    "
                    @change="slider.onChange"
                  />
                </a-col>
              </a-row>
            <a-tooltip placement="left" title="GIF下载">
              <a-button @click="() => click('GIF')" class="btn"> GIF</a-button>
            </a-tooltip>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#ecoThematic {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 14;
  background-color: #eef1fa;
  overflow: hidden;
  padding: 16rem;
  .search-d {
    height: 64rem;
    background: #ffffff;
    border-radius: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0rem 16rem;
    .seach-list {
      display: flex;
      gap: 25rem;
    }
    .btn-group {
      cursor: pointer;
    }
    .ant-btn {
      background: #f8f9ff;
      border: 1px solid #cdd3ec;
      border-radius: 3rem;
      color: #666666;
    }
    .ant-btn:hover {
      color: #fff;
      background-color: #3074e2;
    }
    // :deep(.ant-btn:focus) {
    //   background-color: #f8f9ff;
    //   color: #666666;
    // }
    .reset-btn {
      margin: 0 10rem;
    }
  }
  .ecopage-main {
    margin-top: 12rem;
    height: calc(100% - 64rem - 12rem);
    display: grid;
    grid-template-columns: 216rem auto;
    column-gap: 12rem;
    .ant-spin-nested-loading,
    .ant-spin-container {
      height: 100%;
      background: #ffffff;
      border-radius: 5rem;
      padding-left: 5rem;
    }
    .ant-table-pagination {
      position: absolute;
      bottom: 10rem;
      width: 100%;
      // flex-wrap: nowrap;
    }
    .ant-pagination-item-active {
      background: #3074e2;
      border-radius: 3rem;
      font-size: 14rem;
      font-family: Microsoft YaHei, sans-serif;
      font-weight: 400;
      color: #ffffff;
      a {
        color: #ffffff;
      }
    }

    .ant-table-cell {
      font-weight: 400;
      color: #606266;
      .mini-pic {
        width: 145rem;
        height: 150rem;
      }
    }
    .ant-table-selection-column {
      vertical-align: top;
    }
    .ant-table-thead > tr > th {
      background: #ffffff;
      border: none;
      font-size: 14rem;
      font-family: Microsoft YaHei, sans-serif;
      font-weight: 400;
      color: #606266;
      padding: 25rem 6rem 10rem;
    }

    .ant-table-tbody > tr > td {
      padding: 10rem 6rem;
      border: none;
    }

    .ant-table-tbody > tr.ant-table-row-selected > td {
      background: #ffffff;
    }
    .clickRow > td {
      background-color: #e7e4e4;
    }

    .eco-pic {
      background: #ffffff;
      width: 100%;
      height: 100%;
      position: relative;
      display: grid;
      grid-template-columns: auto 60rem;
      // align-items: center;
      justify-items: center;

      .container {
        height: 100%;
        width: 100%;
        position: relative;

        overflow: hidden;
        display: grid;
        align-items: center;
        justify-items: center;

        .mypic {
          position: absolute;
          width: 100%;
          // transform: scale(0.44);改成内联动态设置
        }
      }

      .footer {
        display: grid;
        grid-template-rows: repeat(5, 34rem);
        grid-row-gap: 10rem;

        padding-top: 32rem;

        .ant-btn {
          width: 34rem;
          height: 32rem;
          background: #e8f1fb;
          border-radius: 3rem;
          color: #8a90a7ff;
          font-weight: bold;
          font-size: 16rem;

          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
        }
        .rotate {
          transform: rotate(230deg);
        }
      }

      .gif {
        padding: 1rem 10rem;
        background: #e8f1fb;
        border-radius: 3rem;
        display: grid;
        grid-template-columns: 5fr 30rem;
        align-items: center;

        .ant-slider-step {
          background: #6d85a0;
        }
        .ant-row {
          align-items: center;
        }

        .btn {
          font-family: Microsoft YaHei, sans-serif;
          height: 20rem;
          font-weight: bold;
          color: #ffffff;
          background: #6d85a0;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>
