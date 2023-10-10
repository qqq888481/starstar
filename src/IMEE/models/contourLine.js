import { getHeitByHpa, HPA_HEIT_ZOOM } from '../utils/mathUtil'

export default class ContourLine {
	constructor(cesiumViewer, lineWidth, lineColor = [255, 255, 255, 255]) {
		this.viewer = cesiumViewer
		this.lineWidth = lineWidth

		this.lineColor = lineColor
		this.isLoadData = false
		this.lineDataInfo = {
			IsGround: true,
			Heit: 0,
			Item: '',
			Values: [],
			LonMin: 0,
			LonMax: 0,
			DLon: 0,
			LatMin: 0,
			LatMax: 0,
			DLat: 0,
			LineAry: [],
			Scale: 1,
		}
		this.listLines = []
		this.listLabels = []

		this.heightZoom = 0
	}

	loadDataInfo(dataInfo, heit, heightZoom = HPA_HEIT_ZOOM) {
		// dataInfo={Item,Bound,Values,Info}
		// Item：要素标识 "HPA"时闭合的无洞区域中心要标识 "L"或 "H"标识
		// Bound=[5]: 0-LonMin 1-LonMax 2-LatMin 3-LatMax 4-Scale
		// Values=[]：插值数值数组
		// Info=[] 非"HPA"时-每个要素{Value+Line[N]} Value标识该线数值 Line经纬度位置点数组
		// "HPA"时-每个要素{Value+High+HasHoles+Line[N]} High标识1-高程0-低程 HasHoles标识1-有洞0-无洞
		this.removeAll()
		this.isLoadData = false
		this.lineDataInfo.Item = ''
		this.lineDataInfo.IsGround = heit === 0 || !heit
		this.lineDataInfo.Heit = heit
		this.lineDataInfo.Values = []
		this.lineDataInfo.LineAry = []
		if (
			!dataInfo.Item ||
			dataInfo.Values.length < 1 ||
			dataInfo.Info.length < 1
		) {
			return
		}

		this.heightZoom = heightZoom
		this.lineDataInfo.Item = dataInfo.Item
		this.lineDataInfo.Values = dataInfo.Values
		this.lineDataInfo.Colors = dataInfo.Colors

		this.lineDataInfo.LonMin = dataInfo.Bound[0]
		this.lineDataInfo.LonMax = dataInfo.Bound[1]
		this.lineDataInfo.LatMin = dataInfo.Bound[2]
		this.lineDataInfo.LatMax = dataInfo.Bound[3]
		this.lineDataInfo.DLon = this.lineDataInfo.LonMax - this.lineDataInfo.LonMin
		this.lineDataInfo.DLat = this.lineDataInfo.LatMax - this.lineDataInfo.LatMin
		if (dataInfo.Bound[4]) {
			this.lineDataInfo.Scale = 1.0 / dataInfo.Bound[4]
		} else {
			this.lineDataInfo.Scale = 1.0
		}

		const scale = this.lineDataInfo.Scale
		for (let i = 0; i < dataInfo.Info.length; i++) {
			const lineInfo = dataInfo.Info[i]
			const size = lineInfo.Line.length / 2
			const aLine = {
				Value: lineInfo.Value,
				Line: [],
				PtLabelLon: 0,
				PtLabelLat: 0,
				PtLabelHeit: heit === 0 ? 0 : getHeitByHpa(heit) * this.heightZoom,
			}
			let lon = 0
			let lat = 0
			for (let j = 0; j < size; j++) {
				lon += lineInfo.Line[2 * j + 0]
				lat += lineInfo.Line[2 * j + 1]
				if (this.lineDataInfo.IsGround) {
					aLine.Line.push(
						lineInfo.Line[2 * j + 0] * scale,
						lineInfo.Line[2 * j + 1] * scale
					)
				} else {
					aLine.Line.push(
						lineInfo.Line[2 * j + 0] * scale,
						lineInfo.Line[2 * j + 1] * scale,
						getHeitByHpa(heit) * this.heightZoom
					)
				}
			}
			if (aLine.Line.length > 0) {
				if (
					!lineInfo.HasHoles &&
					dataInfo.Item === 'PR' &&
					lineInfo.Line[0] === lineInfo.Line[2 * (size - 1) + 0] &&
					lineInfo.Line[1] === lineInfo.Line[2 * (size - 1) + 1]
				) {
					aLine.LH = lineInfo.High ? 'H' : 'L'
					aLine.LHLon = (lon * scale) / size
					aLine.LHLat = (lat * scale) / size
				}
				const indexHalf = Math.floor(size / 2)
				aLine.PtLabelLon = lineInfo.Line[2 * indexHalf + 0] * scale
				aLine.PtLabelLat = lineInfo.Line[2 * indexHalf + 1] * scale

				this.lineDataInfo.LineAry.push(aLine)
			}
		}

		this.isLoadData = true
	}

	removeAll() {
		for (let i = 0; i < this.listLines.length; i++) {
			if (this.lineDataInfo.IsGround) {
				this.viewer.scene.groundPrimitives.remove(this.listLines[i])
			} else {
				this.viewer.entities.remove(this.listLines[i])
			}
			this.listLines[i] = undefined
		}
		for (let i = 0; i < this.listLabels.length; i++) {
			this.viewer.entities.remove(this.listLabels[i])
			this.listLabels[i] = undefined
		}
		this.listLines = []
		this.listLabels = []
	}

	changeShow(isShow) {
		this.changeShowLine(isShow)
		this.changeShowLabel(isShow)
	}

	changeShowLine(isShow) {
		for (let i = 0; i < this.listLines.length; i++) {
			this.listLines[i].show = isShow
		}
	}

	changeShowLabel(isShow) {
		for (let i = 0; i < this.listLabels.length; i++) {
			this.listLabels[i].show = isShow
		}
	}

	renderLine() {
		if (!this.isLoadData) {
			return
		}
		this.removeAll()
		for (let i = 0; i < this.lineDataInfo.LineAry.length; i++) {
			const aLine = this.lineDataInfo.LineAry[i]

			const lineAry = aLine.Line
			const lineValue = aLine.Value
			const ptLabelLon = aLine.PtLabelLon
			const ptLabelLat = aLine.PtLabelLat
			const ptLabelHeit = aLine.PtLabelHeit

			this.lineColor =
				this.lineDataInfo.Colors[this.lineDataInfo.Values.indexOf(lineValue)]

			let line
			if (this.lineDataInfo.IsGround) {
				line = this.viewer.scene.groundPrimitives.add(
					new Cesium.GroundPolylinePrimitive({
						geometryInstances: new Cesium.GeometryInstance({
							geometry: new Cesium.GroundPolylineGeometry({
								positions: Cesium.Cartesian3.fromDegreesArray(lineAry),
								width: this.lineWidth,
							}),
						}),
						appearance: new Cesium.PolylineMaterialAppearance({
							material: new Cesium.Material({
								fabric: {
									type: 'Color',
									uniforms: {
										color: Cesium.Color.fromBytes(
											this.lineColor[0],
											this.lineColor[1],
											this.lineColor[2],
											this.lineColor[3] || 255
										),
									},
								},
							}),
						}),
					})
				)
			} else {
				line = this.viewer.entities.add({
					polyline: {
						positions: Cesium.Cartesian3.fromDegreesArrayHeights(lineAry),
						width: this.lineWidth,
						material: Cesium.Color.fromBytes(
							this.lineColor[0],
							this.lineColor[1],
							this.lineColor[2],
							this.lineColor[3] || 255
						),
					},
				})
			}
			line.lineType = 'CONTOUR'
			line.lineValue = lineValue
			this.listLines.push(line)

			// TODO 标注value默认位置 lineValue/ptLabelLon/ptLabelLat/ptLabelHeit
			let label = this.viewer.entities.add({
				position: Cesium.Cartesian3.fromDegrees(
					ptLabelLon,
					ptLabelLat,
					ptLabelHeit
				),
				label: {
					text: lineValue + '',
					font: '10px Helvetica',
					horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
					pixelOffset: new Cesium.Cartesian2(0.0, 0.0),
					//   translucencyByDistance: new Cesium.NearFarScalar(1e5, 1.0, 5e6, 0.01),
					fillColor: Cesium.Color.WHITE,
					showBackground: false,
					backgroundColor: Cesium.Color.BLACK.withAlpha(0.1),
					outlineColor: Cesium.Color.BLACK,
				},
			})
			this.listLabels.push(label)

			if (this.lineDataInfo.Item === 'PR' && aLine.LH) {
				// TODO 标注高低压
				label = this.viewer.entities.add({
					position: Cesium.Cartesian3.fromDegrees(
						aLine.LHLon,
						aLine.LHLat,
						ptLabelHeit
					),
					label: {
						text: aLine.LH,
						font: '15px Helvetica',
						horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
						pixelOffset: new Cesium.Cartesian2(0.0, 0.0),
						// translucencyByDistance: new Cesium.NearFarScalar(1e5, 1.0, 5e6, 0.01),
						fillColor: aLine.LH === 'H' ? Cesium.Color.RED : Cesium.Color.BLUE,
						showBackground: true,
						outlineColor: Cesium.Color.BLACK,
					},
				})
				this.listLabels.push(label)
			}
		}
	}
}
