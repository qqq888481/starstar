import { colorRgb } from './mathUtil'

const { Color } = Cesium

/*
* [255,255,255,1]
* */
export default class PriColor extends Color.fromBytes {
  constructor(color, alpha) {
    let r, g, b, a
    if (color.indexOf('#') > -1) {
      color = colorRgb(color)
      color[3] = alpha
    }
    super(color[0], color[1], color[2], (color[3] || color[3] === 0) ? (color[3] * 255) : 255)
  }

  colorRgb (value) {
    // 16进制颜色值的正则
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    // 把颜色值变成小写
    let color = value.toLowerCase()
    if (reg.test(color)) {
      // 如果只有三位的值，需变成六位，如：#fff => #ffffff
      if (color.length === 4) {
        let colorNew = '#'
        for (let i = 1; i < 4; i += 1) {
          colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1))
        }
        color = colorNew
      }
      // 处理六位的颜色值，转为RGB
      const colorChange = []
      for (let i = 1; i < 7; i += 2) {
        colorChange.push(parseInt('0x' + color.slice(i, i + 2)))
      }

      return colorChange
    } else {
      return color
    }
  }

}
