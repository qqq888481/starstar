// http://47.122.41.94:8080/Production/PM25_H8_AHI/202301/202301301000_COOH/130100000000/130100000000_transparent.png
export default class Tip {
  constructor(jwd) {
    this.jwd = jwd //贴图四至
    this.url = ''
    this.lon = ''
    this.lat = ''
    this.legendData = ''
    this.value = '--'
    this.isLable = 0 //0只显示数值；1只显示label；2数字和label都显示。
  }
  setUrl(picurl) {
    this.url = picurl
  }

  async getValue(lon, lat, legendData, isLable = 0) {
    this.value = '--'
    this.lon = lon
    this.lat = lat
    this.legendData = legendData
    this.isLable = isLable
    let result = await this.getrgb()
    return result
  }

  getrgb() {
    return new Promise(resolve => {
      const _this = this
      let img = new Image()
      img.crossOrigin = ''
      let canvas = document.createElement('canvas')
      img.src = _this.url
      img.onload = function () {
        canvas.width = img.width
        canvas.height = img.height
        let context = canvas.getContext('2d')
        context.drawImage(this, 0, 0, img.width, img.height)
        let x = parseInt(((_this.lon - _this.jwd[0]) / (_this.jwd[2] - _this.jwd[0])) * canvas.width)
        let y = parseInt(canvas.height - ((_this.lat - _this.jwd[1]) / (_this.jwd[3] - _this.jwd[1])) * canvas.height)
        // console.log(x, y)
        let imageData = context.getImageData(x, y, canvas.width, canvas.height)
        let color = []
        // 索引值获取方式：纵坐标*图像宽度+横坐标
        color.push(imageData.data[0])
        color.push(imageData.data[1])
        color.push(imageData.data[2])
        color.push(imageData.data[3])
        if (0 < x < canvas.width && 0 < y < canvas.height && color[3] !== 0 && color[3]) {
          if (!_this.legendData) {
            _this.colorToValue2(color) //生态格局评估
          } else {
            _this.colorToValue(color, _this.legendData)
          }
        } else {
          // console.log(color)
          console.log('不在范围内')
          _this.value = '--'
        }
        resolve(_this.value)
      }
    })
  }

  colorToValue(value, legendData) {
    const colorObj = this.arrToObj(value)
    if (this.isLable === 1) {
      //只显示标签内容，比如重要性
      let curLable = '--'
      for (let i = 0; i < legendData.color.length; i++) {
        const obj = this.strToObj(legendData.color[i])
        if (colorObj.r == obj.r && colorObj.g == obj.g && colorObj.b == obj.b) {
          curLable = legendData.label[i]
        }
      }
      this.value = curLable
      return
    }

    for (let i = 0; i < legendData.color.length - 1; i++) {
      const obj = this.strToObj(legendData.color[i])
      const nextObj = this.strToObj(legendData.color[i + 1])

      let min = {}
      let max = {}

      if (nextObj.r > obj.r) {
        min.r = obj.r
        max.r = nextObj.r
      } else {
        max.r = obj.r
        min.r = nextObj.r
      }
      if (nextObj.g > obj.g) {
        min.g = obj.g
        max.g = nextObj.g
      } else {
        max.g = obj.g
        min.g = nextObj.g
      }
      if (nextObj.b > obj.b) {
        min.b = obj.b
        max.b = nextObj.b
      } else {
        max.b = obj.b
        min.b = nextObj.b
      }

      if (
        min.r <= colorObj.r &&
        colorObj.r <= max.r &&
        min.g <= colorObj.g &&
        colorObj.g <= max.g &&
        min.b <= colorObj.b &&
        colorObj.b <= max.b
      ) {
        //暂未发现同时满足条件的2个值存在

        // if (
        //   min.r !== max.r &&
        //   ((colorObj.r === min.r && colorObj.g !== min.g) || (colorObj.r === max.r && colorObj.g !== max.g))
        // ) {
        //   //规避了同时落在两个区间的一种情况，依据：（rgb三通道比例一致）
        //   //r最大最小值不一致，目标值r等于最大值，所以g和b也得为最大值才符合
        //   console.log(2222)
        //   continue
        // }

        const scale = this.getScale(obj, nextObj, colorObj)
        const number = Number(legendData.value[i])
        const nextNumber = Number(legendData.value[i + 1])
        const curNumber = (number + (nextNumber - number) * scale).toFixed(4)
        if (this.isLable === 2) {
          const label = legendData.label[i]
          this.value = curNumber + ',' + label
        } else {
          this.value = curNumber
        }
      }
    }
  }
  colorToValue2(value) {
    const valuestr = `rgb(${value[0]},${value[1]},${value[2]})`
    //生态系统格局评估，图例是直接贴的图
    const arr = [
      {
        name: '森林',
        color: 'rgb(38,115,0)'
      },
      {
        name: '灌丛',
        color: 'rgb(85,255,0)'
      },
      {
        name: '草地',
        color: 'rgb(152,230,0)'
      },
      {
        name: '湿地',
        color: 'rgb(0,92,230)'
      },
      {
        name: '农田',
        color: 'rgb(255,234,190)'
      },
      {
        name: '城镇',
        color: 'rgb(223,115,255)'
      },
      {
        name: '荒漠',
        color: 'rgb(130,46,106)'
      },
      {
        name: '其他',
        color: 'rgb(230,152,0)'
      }
    ]
    const data = arr.filter(item => item.color === valuestr)[0]
    const name = data ? data.name : '--'
    this.value = name
  }

  // rgb字符串转成对象
  strToObj(str) {
    let regex = /\((.+?)\)/g
    const str1 = str.match(regex)[0].replace('(', '').replace(')', '')
    const arr = str1.split(',')
    const obj = {
      r: Number(arr[0]),
      g: Number(arr[1]),
      b: Number(arr[2])
    }
    return obj
  }
  arrToObj(arr) {
    const obj = {
      r: Number(arr[0]),
      g: Number(arr[1]),
      b: Number(arr[2])
    }
    return obj
  }
  getScale(number, nextNumber, value) {
    // rgb值转成int，这样就可以只算一次比例了，不用rgb三通道各自算了
    const numberInt = this.argbToInt(number.r, number.g, number.b)
    const nextNumberInt = this.argbToInt(nextNumber.r, nextNumber.g, nextNumber.b)
    const valueInt = this.argbToInt(value.r, value.g, value.b)
    const scale = (valueInt - numberInt) / (nextNumberInt - numberInt)
    return scale
  }
  //rgb转int
  argbToInt(r, g, b) {
    let color = (0xff << 24) | (r << 16) | (g << 8) | b
    return color
  }
}
