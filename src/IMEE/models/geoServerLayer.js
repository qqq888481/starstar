const {
	ImageryLayer,
	WebMapServiceImageryProvider,
	Cartesian2,
	when,
	SingleTileImageryProvider,
} = Cesium

function getTifStyle(layerName, shpName = false) {
	return `<?xml version="1.0" encoding="UTF-8"?>
	<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
	xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
	xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" 
	xmlns:fes="http://www.opengis.net/fes/2.0"
	>
	
	<NamedLayer>
	<Name>${layerName}</Name>
	<UserStyle>
	<Name>style</Name>
			<FeatureTypeStyle>
			<Rule>
			<RasterSymbolizer>
			<Opacity>1.0</Opacity>
			<ColorMap type="ramp">
			<ColorMapEntry color="#00b050" quantity="0" opacity="0.5" /><ColorMapEntry color="#ffff00" quantity="35" opacity="0.5" /><ColorMapEntry color="#ffc000" quantity="75" opacity="0.5" /><ColorMapEntry color="#ff0000" quantity="115" opacity="0.5" /><ColorMapEntry color="#7030a0" quantity="150" opacity="0.5" /><ColorMapEntry color="#800000" quantity="250" opacity="0.5" /><ColorMapEntry color="#800000" quantity="500" opacity="0.5" />
			</ColorMap>
			</RasterSymbolizer>
			</Rule>
			<VendorOption name="composite">multiply</VendorOption>
			<VendorOption name="composite-base">true</VendorOption>
			</FeatureTypeStyle>
	
		</UserStyle>
	
		</NamedLayer>
	${
		shpName
			? `<NamedLayer>
	<Name>${shpName}</Name>
	<UserStyle>
	<Name>shp</Name>
			<FeatureTypeStyle>
					<Rule>
					<PolygonSymbolizer>
				 <Fill>
			 <CssParameter name="fill">#ffffff</CssParameter>
				 </Fill>
			 </PolygonSymbolizer>
				</Rule>
				<VendorOption name="composite">destination-in</VendorOption>
		</FeatureTypeStyle>
		</UserStyle>

		</NamedLayer>`
			: ''
	}
	
	
		</StyledLayerDescriptor>`
}

// this.myGeoServerLayer = new GeoServerLayer(
// 	{
// 		url: `https://www.jneep.net/IMEE-GlobeServer/jinan/wms`,
// 		layerName: `jinan:pm25_h8_ahi_cooh`,
// 	},
// 	`2021-09-18T17:00:00.000Z`,
// 	this.viewer,
// 	'tif',
// 	{
// 		layerName: 'bj',
// 		url: 'https://www.jneep.net/IMEE-GlobeServer/jinan/wms',
// 		layers: 'jinan:jinanadd',
// 		cqlFilter: '',
// 	}
// )
/*
 * 加载服务
 * info.：服务的信息
 * layers：发布服务的名
 * */
export default class GeoServerLayer extends ImageryLayer {
	constructor(info, time, viewer, id, borderInfo = false) {
		const wmsProvider = new WebMapServiceImageryProvider({
			url: info.url,
			layers: borderInfo
				? `${info.layerName},${borderInfo.layers}`
				: info.layerName,
			parameters: {
				service: 'WMS',
				format: 'image/png',
				transparent: true,
				time,
				sld_body: getTifStyle(info.layerName, borderInfo.layers),
				interpolations: 'bilinear',
			},
			getFeatureInfoParameters: {
				time,
			},
		})

		super(wmsProvider)

		this.viewer = viewer
		this.id = id
		this.info = info
		this.time = time
		this.borderInfo = borderInfo
		this.pickState = 0 // 0未创建，1拾取中，2关闭中
		if (this.borderInfo) {
			this.viewer.loadShp(
				this.borderInfo.layerName,
				this.borderInfo.url,
				this.borderInfo.layers,
				this.borderInfo.cqlFilter
			)
		}
		this.viewer.imageryLayers.add(this)
	}

	startPick(callback) {
		if (this.pickState === 1) {
			return
		}
		this.pickState = 1

		this.viewer.addEvent(this.id, `LEFT_CLICK`, res => {
			const cartographic = res.cartographic

			if (cartographic) {
				let xy = new Cartesian2()
				const level = this.viewer.getLevel(cartographic.height)

				if (this.imageryProvider.ready) {
					xy = this.imageryProvider.tilingScheme.positionToTileXY(
						cartographic,
						level,
						xy
					)

					if (this.borderInfo) {
						const shpLayer = this.viewer.layersMap.get(
							this.borderInfo.layerName
						).imageryProvider
						const shpPromise = shpLayer.pickFeatures(
							xy.x,
							xy.y,
							level,
							cartographic.longitude,
							cartographic.latitude
						)

						const promise = this.imageryProvider.pickFeatures(
							xy.x,
							xy.y,
							level,
							cartographic.longitude,
							cartographic.latitude
						)

						when(shpPromise, function (Info) {
							if (Info.length > 0) {
								when(promise, function (layerInfo) {
									callback(layerInfo, res)
								})
							} else {
								callback(Info, res)
							}
						})
					} else {
						const promise = this.imageryProvider.pickFeatures(
							xy.x,
							xy.y,
							level,
							cartographic.longitude,
							cartographic.latitude
						)

						when(promise, function (layerInfo) {
							callback(layerInfo, res)
						})
					}
				}
			}
		})
	}

	openPick() {
		this.pickState = 1
		this.viewer.changeEvent(this.id, `LEFT_CLICK`, true)
	}

	closePick() {
		this.pickState = 2
		this.viewer.changeEvent(this.id, `LEFT_CLICK`, false)
	}

	removePick() {
		this.pickState = 0
		this.viewer.removeEvent(this.id, `LEFT_CLICK`)
	}

	changeShow(show) {
		this.show = show
		if (!show && this.pickState === 1) {
			this.closePick()
		}

		if (this.borderInfo) {
			this.viewer.changeLayerShow(this.borderInfo.layerName, show)
		}
	}

	destroy() {
		this.viewer.imageryLayers.remove(this)
		this.removePick()
		if (this.borderInfo) {
			this.viewer.removeLayer(this.borderInfo.layerName)
		}
	}
}
