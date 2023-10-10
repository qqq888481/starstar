import { isEmpty, getColorIndex } from '@/common/yaogan/dataFn.js'
import * as echarts from 'echarts'
import Down from '@/assets/yaogan/eco/s.png'
import Up from '@/assets/yaogan/eco/sup.png'

/**
 *
 * @desc折线图
 * 使用页面：生态遥感统计页面、格局评估统计页面、服务评估统计页面、质量评估统计分析
 */
let color = ['#FFFBB1', '#E7CCE2', '#31AD69', '#9ACE7F', '#E2A195', '#C59A8C', '#E56766']
export function setLineOption(xData, yData, name, label, unit, colorarr) {
  let option = []
  if (!xData || !yData) {
    xData = []
    yData = []
  }
  const isNull = yData.flat().every(item => item === '--') //是否每项都为空

  let datas = []
  if (label && label.length > 0) {
    label.map((item, index) => {
      datas.push({
        name: item,
        type: 'line',
        data: yData[index],
        symbol: 'circle', //将小圆点改成实心 不写symbol默认空心
        symbolSize: 10, //小圆点的大小
        itemStyle: {
          borderWidth: 5,
          color: colorarr && colorarr.length !== 0 ? colorarr[index] : color[index]
        }
      })
    })
  } else {
    datas = [
      {
        data: yData,
        type: 'line',
        symbol: 'circle', //将小圆点改成实心 不写symbol默认空心
        symbolSize: 12, //小圆点的大小
        itemStyle: {
          color: '#FFC498'
        }
      }
    ]
  }

  option = {
    grid: {
      left: 0,
      right: 0,
      bottom: '5%',
      top: 35,
      containLabel: true
      // show: true
      // borderwidth: 1,
      // borderColor: '#B3B5BF'  //echarts边框
    },
    graphic: {
      type: 'text', // 类型：文本
      left: 'center',
      top: 'middle',
      silent: true, // 不响应事件
      invisible: (!isNull && xData.length > 0) || (!isNull && yData.length > 0), // 有数据就隐藏
      style: {
        fill: '#9d9d9d',
        fontWeight: 'bold',
        text: '暂无数据',
        fontFamily: 'Microsoft YaHei',
        fontSize: '25px'
      }
    },
    textStyle: {
      fontFamily: 'MicrosoftYaHei',
      color: '#666666'
    },
    legend: {
      show: label && name !== 'service' ? true : false, //服务评估面积组成图例用dom写的
      type: 'scroll',
      data: label,
      selectedMode: 'multiple',
      itemWidth: 18,
      itemHeight: 12,
      textStyle: {
        color: '#666666',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50,50,50,0.7)',
      // formatter: '{b}' + '<br/>' + name + ' {c}',
      axisPointer: {
        label: {
          backgroundColor: '#6a7985'
        }
      },
      textStyle: {
        color: '#fff'
      },
      valueFormatter: value => {
        if (unit === undefined || unit === null) {
          unit = ''
        }
        return !isEmpty(value) && value !== '--' ? value + ' ' + unit : value
      }
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: {
        lineStyle: {
          color: '#666666' //x坐标轴颜色
        }
      }
    },
    yAxis: {
      type: 'value',
      name: !isNull ? unit : '',
      nameTextStyle: {
        color: '#666666',
        nameLocation: 'start'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(179,181,191,0.3)',
          width: 1,
          type: 'dashed'
        }
      },
      // min: 'dataMin'
      scale: true //坐标轴不从0开始
    },
    series: datas
  }
  return option
}

/**
 *
 * @desc柱状图
 * 使用页面：生态遥感统计页面、格局评估统计页面、服务评估统计页面、质量评估统计分析
 */
export function setBarOption(xData, yData, label, unit, colorarr = [], stackName = '', name = '') {
  let option = []
  if (!xData || !yData) {
    xData = []
    yData = []
  }
  const isNull = yData.flat().every(item => item === '--') //是否每项都为空

  let datas = []
  if (label && label.length > 0) {
    label.map((item, index) => {
      datas.push({
        name: item,
        data: yData[index],
        type: 'bar',
        stack: stackName, //堆叠
        barWidth: 20,
        itemStyle: {
          borderWidth: 5,
          color: colorarr && colorarr.length !== 0 ? colorarr[index] : color[index]
        }
      })
    })
  } else {
    datas = [
      {
        data: yData,
        type: 'bar',
        barWidth: '25'
      }
    ]
  }

  option = {
    grid: {
      left: 0,
      right: 0,
      bottom: '8%',
      top: 50,
      containLabel: true
      // show: true,
      // borderwidth: 1,
      // borderColor: '#B3B5BF'
    },
    legend: {
      show: label && name !== 'service' ? true : false, //服务评估面积组成图例用dom写的
      type: 'scroll',
      data: label,
      itemWidth: 18,
      itemHeight: 12,
      selectedMode: label ? false : 'multiple',
      textStyle: {
        color: '#666666',
        fontSize: 14
      }
    },
    graphic: {
      type: 'text', // 类型：文本
      left: 'center',
      top: '50%',
      silent: true, // 不响应事件
      invisible: (!isNull && xData.length > 0) || (!isNull && yData.length > 0), // 有数据就隐藏
      style: {
        fill: '#9d9d9d',
        fontWeight: 'bold',
        text: '暂无数据',
        fontFamily: 'Microsoft YaHei',
        fontSize: '25px'
      }
    },
    dataZoom: [
      {
        type: 'inside' //缩放事件
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        label: {
          backgroundColor: '#6a7985'
        }
      },
      valueFormatter: value => {
        if (unit === undefined || unit === null) {
          unit = ''
        }
        return !isEmpty(value) && value !== '--' ? value + ' ' + unit : value
      }
    },
    color: ['#01C5D2'],
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#666666',
          width: 1,
          type: 'solid'
        }
      },
      axisTick: {
        //坐标轴刻度
        show: false
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: 'rgba(179,181,191,0.3)',
          width: 1,
          type: 'dashed'
        }
      },
      axisLabel: {
        interval: 0 //不省略
        // rotate: 20 //文字倾斜
      }
    },
    yAxis: {
      type: 'value',
      name: !isNull ? unit : '',
      nameTextStyle: {
        color: '#666666',
        nameLocation: 'start'
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: '#666666',
          width: 1,
          type: 'solid'
        }
      },
      axisTick: {
        show: false //坐标轴刻度不显示，一个小横杠
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(179,181,191,0.3)',
          width: 1,
          type: 'dashed'
        }
      }
    },

    series: datas
  }
  return option
}

/**
 *
 * @desc雷达图
 * 使用页面：格局评估统计页面
 */
export function setRadarOption(xData, yData, unit) {
  const indicator = []
  xData.map(item => indicator.push({ name: item }))
  let option = []
  if (!yData) {
    return option
  }
  option = {
    grid: {
      left: 20,
      top: 10
    },
    tooltip: {
      //雷达图的tooltip不会超出div。也可以设置position属性，position定位的tooltip 不会随着鼠标移动而位置变化，不友好
      confine: true,
      enterable: true, //鼠标是否可以移动到tooltip区域内
      backgroundColor: 'rgba(50,50,50,0.7)',
      textStyle: {
        color: '#fff'
      },
      valueFormatter: value => {
        return isNaN(value) ? '-' : value + ' ' + unit
      }
    },
    // legend: {
    //   top: 40,
    //   right: 20,
    //   show: label ? true : false,
    //   type: 'scroll',
    //   data: label,
    //   itemWidth: 18,
    //   itemHeight: 12,
    //   textStyle: {
    //     color: '#666666',
    //     fontSize: 14
    //   }
    // },
    radar: {
      shape: 'polygon',
      indicator: indicator
      // startAngle: 135 //平的
    },
    series: [
      {
        name: '转移面积：',
        type: 'radar',
        symbol: 'circle',
        symbolSize: 10, // 拐点的大小
        itemStyle: {
          normal: {
            color: '#FFFBB1' //点颜色
          }
        },
        areaStyle: {
          normal: {
            color: '#FFFBB1',
            opacity: 0.5
          }
        },
        lineStyle: {
          width: 2,
          color: '#FFFBB1'
        },
        data: [
          {
            value: yData
          }
        ]
      }
    ]
  }
  return option
}

/**
 *
 * @desc水球图
 * 使用页面：质量评估右侧面板
 */
export function setLiquidFill(value, desc, color) {
  const rate = value !== '--' ? value / 100 : value //质量的百分比 0.2 = 20% 或 20% = 0.2 * 100 = 200% 或 200% = 0.2 * 1000 = 2000% 等等 或 20% = 0.2 * 10000 = 20000% 等等 或 20% = 0.2 * 100000 = 2000000% 等等 或 20% = 0.2 * 1000000 = 20000000% 等等 或 20% = 0.2 * 10000000 = 20000000% 等等 或 20% = 0.2 * 10000000 = 20000000% 等等 或 20% = 0.2 * 10000000 = 20000000% 等等 或 20% =
  let option = []
  option = {
    series: [
      {
        type: 'liquidFill', //水位图
        // waveAnimation: false,
        radius: '90%', //显示比例
        center: ['50%', '50%'], //中心点
        amplitude: 6, //水波振幅
        data: [rate, rate], // data个数代表波浪数
        itemStyle: {
          normal: {
            //   //在项目中  可能用这个改变球的颜色
            //   color: '#7EBE51'
            shadowColor: 'rgba(22, 22, 22, 0)', //有值的时候有黑背景
            shadowBlur: 10
          }
        },
        color: [
          {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: color[0]
              },
              {
                offset: 1,
                color: color[0]
              }
            ],
            globalCoord: false
          },
          {
            type: 'linear',
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: color[0]
              },
              {
                offset: 1,
                color: color[1]
              }
            ],
            globalCoord: false
          }
        ], //波浪颜色
        backgroundStyle: {
          borderWidth: 5, //内边框宽度
          borderColor: 'rgba(188,224,255,0.31)', //背景内边框
          // shadowColor: 'rgba(255,255,255,0.95)', //阴影
          // shadowBlur: 5, //阴影模糊
          color: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.6,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(255,255,255,0.34)' // 0% 处的颜色
              },
              {
                offset: 1,
                color: 'rgba(188,224,255,0.91)' // 100% 处的颜色
              }
            ],
            globalCoord: false // 缺省为 false
          }
        },
        label: {
          //标签设置
          // show: false,
          position: ['52%', '50%'],
          formatter: params => {
            const value = params.value !== '--' ? parseFloat((params.value * 100).toFixed(2)) : params.value
            if (desc === 'up' || desc === 'down') {
              //同比
              return `${value}{b| %}{img|}`
            } else {
              return `${value}{a|${desc}}`
            }
          }, //显示文本,
          textStyle: {
            fontSize: '28px', //文本字号,
            fontFamily: 'D-DIN',
            color: '#000000', //波浪内部字体颜色
            fontWeight: 'bold',
            rich: {
              a: {
                fontSize: 14,
                fontFamily: 'Microsoft YaHei',
                fontWeight: 'bold',
                padding: [13, 0, 0, 0]
              },
              b: {
                fontSize: 14,
                fontFamily: 'D-DIN',
                fontWeight: 'bold',
                padding: [13, 0, 0, 0]
              },
              img: {
                verticalAlign: 'middle',
                height: 12,
                backgroundColor: {
                  image: value === '--' ? '' : desc === 'up' ? Up : Down
                }
              }
            }
          },
          insideColor: '#000000'
        },
        outline: {
          show: false,
          borderDistance: 10,
          itemStyle: {
            borderWidth: 6,
            // borderColor: 'rgba(188,224,255,0.61)',
            shadowBlur: 10
            // shadowColor: 'rgba(255,255,255,0.95)'
          }
        }
      }
    ]
  }
  return option
}

//质量评估右侧面板柱状图
export function setQualityChart(xData, yData, colorList, unit) {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      // containLabel: true,
      top: '15%',
      bottom: '23%',
      left: '13%',
      right: '5%'
    },
    graphic: {
      type: 'text', // 类型：文本
      left: '40%',
      top: 'middle',
      silent: true, // 不响应事件
      invisible: xData.length, // 有数据就隐藏
      style: {
        fill: '#9d9d9d',
        // fontWeight: 'bold',
        text: '暂无数据',
        fontFamily: 'Microsoft YaHei',
        fontSize: '14px'
      }
    },
    xAxis: {
      data: xData,
      axisLabel: {
        color: '#333',
        //  让x轴文字方向为竖向
        interval: 0,
        formatter: function (value) {
          return value.split('').join('\n')
        }
      }
    },
    yAxis: {
      name: unit,
      nameLocation: 'end',
      nameTextStyle: {
        color: '#999999',
        fontSize: 14,
        padding: [0, 0, -5, -10]
      },
      axisLine: {
        show: true
      },
      splitLine: {
        lineStyle: {
          color: '#CCCCCC',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: yData,
        barWidth: '14rem',
        itemStyle: {
          normal: {
            color: function (params) {
              if (unit === '%') {
                //质量分级占比的取色逻辑，根据x轴取色
                let color = '#C7E0B5'
                const index = colorList.label.findIndex(item => item === params.name)
                if (index !== -1) {
                  color = colorList.color[index]
                }
                return color
              } else {
                //质量均值：根据具体数值大小取色
                let value = params.data
                const index = getColorIndex(colorList.value, value)
                return colorList.color[index]
              }
            },
            barBorderRadius: [30, 30, 0, 0]
          }
        },
        label: {
          normal: {
            show: false,
            position: 'top',
            verticalAlign: 'center',
            distance: 8,
            // formatter: params => {
            //   return `${params.value.toFixed(0)}`
            // }, //显示文本,
            textStyle: {
              color: '#333333',
              fontSize: 14,
              fontWeight: 400
            }
          }
        }
      }
    ]
  }
  return option
}
