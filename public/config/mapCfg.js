const MapCfg = {
  layers: [
    {
      id: 'wsf_boundary',
      name: '自定义底图',
      type: 'shpLayer',
      url: 'http://61.50.111.214:18283/IMEE-GlobeServer/weifang/wms',
      layerName: 'wsf:wsf_boundary',
      show: false,
      need: false,
      isLabel: false
    },
    {
      id: 'tdt-img',
      name: '天地图影像图',
      url: 'http://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=',
      show: true,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      need: 'img-label',
      isLabel: false
    },
    {
      id: 'img-label',
      name: '影像图标注',
      url: 'http://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=',
      show: false,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      isLabel: true
    },
    {
      id: 'tdt-ter',
      name: '天地图地形图',
      url: 'http://t{s}.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=',
      show: false,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      need: 'ter-label',
      isLabel: false
    },
    {
      id: 'ter-label',
      name: '地形图标注',
      url: 'http://t{s}.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=',
      show: false,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      isLabel: true
    },
    {
      id: 'tdt-vec',
      name: '天地图交通图',
      url: 'http://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=',
      show: false,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      need: 'vec-label',
      isLabel: false
    },
    {
      id: 'vec-label',
      name: '交通图标注',
      url: 'http://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=',
      show: false,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      isLabel: true
    },
    {
      id: 'vec-label',
      name: '交通图标注',
      url: 'http://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=',
      show: false,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      isLabel: true
    }
    // {
    //   id: 'sdpubmap',
    //   name: '电子地图',
    //   url: 'http://100.132.1.183:10120/tdt-api/tileservice/sdpubmap?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=sdvec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={myLevel}&TILEROW={y}&TILECOL={x}&&FORMAT=image%2Fpng',
    //   show: false,
    //   type: 'intranet',
    //   isLabel: false
    // },
    // {
    //   id: 'sdrasterpubmap',
    //   name: '影像地图',
    //   url: 'http://100.132.1.183:10120/tdt-api/tileservice/sdrasterpubmap?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=sdvec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={myLevel}&TILEROW={y}&TILECOL={x}&&FORMAT=image%2Fpng',
    //   show: false,
    //   type: 'intranet',
    //   need: 'sdrasterpubmapdj',
    //   isLabel: false
    // },
    // {
    //   id: 'sdrasterpubmapdj',
    //   name: '影像地图标注',
    //   url: 'http://100.132.1.183:10120/tdt-api/tileservice/sdrasterpubmapdj?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=sdvec&STYLE=default&TILEMATRIXSET=c&TILEMATRIX={myLevel}&TILEROW={y}&TILECOL={x}&&FORMAT=image%2Fpng',
    //   show: false,
    //   type: 'intranet',
    //   isLabel: true
    // }
  ],
  terrainAry: [
    {
      id: 'cesium',
      type: 'cesium',
      isShow: false
    },
    {
      id: 'tdt',
      type: 'tdt',
      url: 'https://t{s}.tianditu.gov.cn/',
      isShow: false,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
    },
    {
      id: 'self',
      type: 'self',
      url: 'http://192.168.11.92:8055/terrain',
      isShow: false
    }
  ]
}
const MAXHEIGHT = 500000 // 相机靠近地面的最大距离
