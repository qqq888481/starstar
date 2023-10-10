// 图例
import axios from 'axios'
export async function getLegendValue(productName, type = false, slice = false) {
  let legendArr
  await myLegend(productName, type, slice).then(res => {
    if (res) {
      if (productName === 'STN_HOT_GRID') {
        //插值
        legendArr = res.get(type)
      } else {
        legendArr = res.get(productName)
      }
    }
  })
  return legendArr
}
async function myLegend(productName, type, slice) {
  const labelShowArr = [
    'DUST_H8_A,I',
    'DUSTORI_H8_AHI',
    'OFS_S5P_TROPOMI',
    'WATER_CONSERVATION',
    'SOIL_CONSERVATION',
    'BIODIVERSITY_CONSERVATION',
    'WIND_PREVENTION_SAND_FIXATION',
    'FEQ_MODIS_TERRA',
    'SEQ_MODIS_TERRA',
    'GEQ_MODIS_TERRA',
    'CEQ_MODIS_TERRA'
  ]

  const value = []
  const color = []
  const label = []
  const layerName = []
  let unit = ''
  let noData = ''
  let title = ''
  const res = await axios.get('./data/ProductCfg.xml')
  const parser = new DOMParser() //  创建文档对象
  const xmldoc = parser.parseFromString(res.data, 'text/xml')
  const ProdCfg = xmldoc.getElementsByTagName('ProdCfg')

  for (let i = 0; i < ProdCfg.length; i++) {
    for (let j = 0; j < ProdCfg[i].getElementsByTagName('Plugin').length; j++) {
      const Plugin = ProdCfg[i].getElementsByTagName('Plugin')

      layerName.push(Plugin)
      const str = productName.toUpperCase()
      let tifName
      if (slice) {
        tifName = str
      } else {
        const laststr = str.lastIndexOf('_')
        tifName = str.substring(0, laststr)
      }

      if (Plugin[j].getAttribute('PluginName') === tifName) {
        for (let k = 0; k < Plugin[j].getElementsByTagName('ReMaps').length; k++) {
          const ReMaps = Plugin[j].getElementsByTagName('ReMaps')

          if (type) {
            if (ReMaps[k].getAttribute('Type') == type) {
              title = ReMaps[k].getAttribute('Type')
              unit = ReMaps[k].getAttribute('Unit') ? `${ReMaps[k].getAttribute('Unit')}` : ''
              noData = ReMaps[k].getAttribute('FillValue')
              for (let m = 0; m < ReMaps[k].getElementsByTagName('ReMap').length; m++) {
                const ReMap = ReMaps[k].getElementsByTagName('ReMap')

                // if (m === 0) {
                //   value.push(ReMap[m].getAttribute('MaxV'))
                //   // color.push('rgb(255,255,255)')
                //   color.push('rgb(' + ReMap[m].getAttribute('Color') + ')')
                // }

                color.push('rgb(' + ReMap[m].getAttribute('Color') + ')')
                value.push(ReMap[m].getAttribute('MinV'))
                if (m === ReMap.length - 1) {
                  value.push(ReMap[m].getAttribute('MaxV'))
                  // color.push('rgb(255,255,255)')
                  color.push('rgb(' + ReMap[m].getAttribute('Color') + ')')
                }

                if (labelShowArr.includes(tifName)) {
                  label.push(ReMap[m].getAttribute('Label'))
                }
              }
            }
          } else {
            title = Plugin[j].getElementsByTagName('ProdDesp')[0].innerHTML
            unit = ReMaps[0].getAttribute('Unit') ? `${ReMaps[0].getAttribute('Unit')}` : ''
            noData = ReMaps[0].getAttribute('FillValue')
            for (let m = 0; m < ReMaps[k].getElementsByTagName('ReMap').length; m++) {
              const ReMap = ReMaps[k].getElementsByTagName('ReMap')

              // if (m === 0) {
              //   value.push(ReMap[m].getAttribute('MaxV'))
              //   // color.push('rgb(255,255,255)')
              //   color.push('rgb(' + ReMap[m].getAttribute('Color') + ')')
              // }

              color.push('rgb(' + ReMap[m].getAttribute('Color') + ')')
              value.push(ReMap[m].getAttribute('MinV'))
              if (m === ReMap.length - 1) {
                value.push(ReMap[m].getAttribute('MaxV'))
                // color.push('rgb(255,255,255)')
                color.push('rgb(' + ReMap[m].getAttribute('Color') + ')')
              }
              if (labelShowArr.includes(tifName)) {
                label.push(ReMap[m].getAttribute('Label'))
              }
            }
          }
        }

        const obj = { value, color, label, title, unit, noData }
        const legendValue = new Map()
        if (tifName === 'STN_HOT_GRID_') {
          //插值
          legendValue.set(type, obj)
        } else {
          legendValue.set(productName, obj)
        }
        return legendValue
      }
    }
  }
}
