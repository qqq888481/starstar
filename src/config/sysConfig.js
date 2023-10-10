import { createFromIconfontCN } from '@ant-design/icons-vue'
import html2canvas from 'html2canvas'

// 地图页面token维护
const tokenAry = [
  // '233469364eaf123a2fef6cfd06446abe',
  // 'dcb6a7cd36edf171f05d5ce5b60ac4c9',
  // '69983287df4ca1479edd2813a35c615f',
  // '1694548784e3fe8666ef0d327f37df03'
  '4536c450dc6df09ff57fdeca50e67ee5',
  'aa9b4734d63df456bdc12c5434c4c045',
  '82bcbf221eb3c27ca03b4b5c0bc5c13f',
]
export const myToken = tokenAry[Math.floor(Math.random() * tokenAry.length)]

export const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_2518166_r24unir521.js'
})

export function downloadFile(data, type, fileName) {
  //文件流下载文件
  let blob = new Blob([data], { type: type })
  // 获取heads中的filename文件名
  let downloadElement = document.createElement('a')
  // 创建下载的链接
  let href = window.URL.createObjectURL(blob)
  downloadElement.href = href
  console.log(href)
  // 下载后文件名
  downloadElement.download = fileName
  document.body.appendChild(downloadElement)
  // 点击下载
  downloadElement.click()
  // 下载完成移除元素
  document.body.removeChild(downloadElement)
  // 释放掉blob对象
  window.URL.revokeObjectURL(href)
}

export function downloadEchartsDomImg(dom, type, title, size = [100, 100]) {
  let picInfo = dom.getDataURL({
    type: 'png',
    pixelRatio: 1.5, // 放大两倍下载。解决生成图片在移动端模糊问题
    backgroundColor: '#fff'
  }) // 获取到的是一串base64信息
  if (type == 'png' || type == 'jpg') {
    const elink = document.createElement('a')
    elink.download = title + '.' + type
    elink.style.display = 'none'
    elink.href = picInfo
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href) // 释放URL 对象
    document.body.removeChild(elink)
  } else if (type == 'svg') {
    let svg0 = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg0.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svg0.setAttribute('version', '1.1')
    svg0.setAttribute('height', size[1])
    svg0.setAttribute('width', size[0])
    let img3 = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    // base64编码写入href
    img3.href.baseVal = picInfo
    img3.setAttribute('height', size[1])
    svg0.appendChild(img3)
    let h = svg0.outerHTML
    //给图片对象写入base64编码的svg流
    let data = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(h)))
    const elink = document.createElement('a')
    elink.download = title + '.svg'
    elink.style.display = 'none'
    elink.href = data
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href) // 释放URL 对象
    document.body.removeChild(elink)
  }
}

export function printEchartsDom(domId) {
  html2canvas(domId ? document.querySelector(domId) : document.body).then(canvas => {
    const dataURL = canvas.toDataURL('image/png')
    const dom = document.getElementById('printIframe')
    dom.contentWindow.document.body.innerHTML = ''
    dom.contentWindow.document.write(
      '<html><head><style media="print">@page { margin: auto 0mm;} img{width:100%;}</style></head><body><img src=' +
        dataURL +
        '></body></html>'
    )
    setTimeout(_ => {
      dom.contentWindow.print()
    }, 0)
  })
}

export function allScreenShow(dom) {
  if (dom.requestFullscreen) {
    dom.requestFullscreen()
  } else if (dom.mozRequestFullScreen) {
    dom.mozRequestFullScreen()
  } else if (dom.webkitRequestFullScreen) {
    dom.webkitRequestFullScreen()
  }
}
