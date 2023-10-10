const CUTXNUM = 50 //x方向多少个方块
const CUTYNUM = 50 //y方向多少个方块
const AccuracyMultiple = 1e10 // 为了解决精度问题，乘的倍数，这是危险的

export default class PicWithHighly {
	constructor(viewer) {
		this.viewer = viewer

		this.width = 0 // 1772
		this.height = 0 // 1183
		this.imgData = null // 数据是从左上角开始的
		this.stepX = 0 //177 x方向间隔像素
		this.stepY = 0 //118 y方向间隔像素

		this.stepLon = 0 //0.06 经度方向间隔
		this.stepLat = 0 //0.06 纬度方向间隔
		this.lonGap = 0 //0.6 经度的跨度
		this.latGap = 0 //0.6 纬度的跨度
		this.lonMin = 0
		this.latMin = 0
		this.lonMax = 0
		this.latMax = 0

		this.dataAry = [] // 存放处理之后的所有方块  {range:[lon,lat,heigth....],img:url}

		this.blockC = document.createElement('CANVAS')
		this.blockCtx = null
	}

	/* 
  url:''
  range:[lonmin,latmin,lonmax,latmax]
  */
	setUrl(url, range) {
		this.dataAry = []
		this.lonMin = range[0]
		this.latMin = range[1]
		this.lonMax = range[2]
		this.latMax = range[3]

		const imgDom = document.createElement('IMG')
		imgDom.src = url
		imgDom.onload = () => {
			this.width = imgDom.width
			this.height = imgDom.height // 图片原始像素宽高
			const c = document.createElement('CANVAS')
			c.width = this.width
			c.height = this.height
			const ctx = c.getContext('2d')
			ctx.drawImage(imgDom, 0, 0)
			this.imgData = ctx.getImageData(0, 0, c.width, c.height)

			this.stepX = parseInt(this.width / CUTXNUM)
			this.stepY = parseInt(this.height / CUTYNUM)
			this.blockC.width = this.stepX
			this.blockC.height = this.stepY
			this.blockCtx = this.blockC.getContext('2d')

			this.lonGap =
				(range[2] * AccuracyMultiple - range[0] * AccuracyMultiple) /
				AccuracyMultiple
			this.latGap =
				(range[3] * AccuracyMultiple - range[1] * AccuracyMultiple) /
				AccuracyMultiple

			this.stepLon = this.lonGap / CUTXNUM
			this.stepLat = this.latGap / CUTYNUM

			// 先行，往下
			for (let row = 0; row < CUTYNUM; row++) {
				// 再横向
				for (let col = 0; col < CUTXNUM; col++) {
					/* 
					pt1---pt2
					|			|
					|			|
					pt3---pt4
					*/
					const pt1 = [
						this.lonMin + col * this.stepLon,
						this.latMax - row * this.stepLat,
					]
					const pt1XYinfo = this._getXY(pt1)
					pt1.push(pt1XYinfo.height)
					const pt2 = [
						this.lonMin + (col + 1) * this.stepLon,
						this.latMax - row * this.stepLat,
					]
					const pt2XYinfo = this._getXY(pt2)
					pt2.push(pt2XYinfo.height)
					const pt3 = [
						this.lonMin + col * this.stepLon,
						this.latMax - (row + 1) * this.stepLat,
					]
					const pt3XYinfo = this._getXY(pt3)
					pt3.push(pt3XYinfo.height)
					const pt4 = [
						this.lonMin + (col + 1) * this.stepLon,
						this.latMax - (row + 1) * this.stepLat,
					]
					const pt4XYinfo = this._getXY(pt4)
					pt4.push(pt4XYinfo.height)

					const item = {
						range: [pt1, pt2, pt4, pt3, pt1],
						img: this._getPic(pt1XYinfo.x, pt1XYinfo.y, imgDom),
					}

					this.dataAry.push(item)
				}
			}
			console.warn(this.dataAry)
			const scene = this.viewer.scene
			let instances = []
			for (let index = 0; index < this.dataAry.length; index++) {
				const element = this.dataAry[index]

				// instances.push(
				// 	new Cesium.GeometryInstance({
				// 		geometry: new Cesium.PolygonGeometry({
				// 			polygonHierarchy: new Cesium.PolygonHierarchy(
				// 				Cesium.Cartesian3.fromDegreesArrayHeights(element.range.flat())
				// 			),
				// 			perPositionHeight: true,
				// 		}),
				// 	})
				// )
				instances = []
				scene.primitives.add(
					new Cesium.Primitive({
						geometryInstances: new Cesium.GeometryInstance({
							geometry: new Cesium.PolygonGeometry({
								polygonHierarchy: new Cesium.PolygonHierarchy(
									Cesium.Cartesian3.fromDegreesArrayHeights(
										element.range.flat()
									)
								),
								perPositionHeight: true,
							}),
						}),
						// appearance: new Cesium.PerInstanceColorAppearance(),
						appearance: new Cesium.MaterialAppearance({
							material: new Cesium.Material({
								fabric: {
									type: 'Image',
									uniforms: {
										image: element.img,
									},
								},
							}),
							flat: true,
							faceForward: true,
						}),
					})
				)
			}

			// scene.primitives.add(
			// 	new Cesium.Primitive({
			// 		geometryInstances: instances,
			// 		// appearance: new Cesium.MaterialAppearance({
			// 		// 	material: new Cesium.Material({
			// 		// 		fabric: {
			// 		// 			type: 'Image',
			// 		// 			uniforms: {
			// 		// 				image: element.img,
			// 		// 			},
			// 		// 		},
			// 		// 	}),
			// 		// 	flat: true,
			// 		// 	faceForward: true,
			// 		// }),
			// 	})
			// )
		}
	}

	_getXY(pt) {
		// 注意，xy都是从0开始的
		let x = parseInt(((pt[0] - this.lonMin) * this.width) / this.lonGap)
		let y = parseInt(
			this.height - ((pt[1] - this.latMin) * this.height) / this.latGap
		)
		x = Math.max(x, 0)
		y = Math.max(y, 0)

		const r = this.imgData.data[(y * this.width + x) * 4]
		const g = this.imgData.data[(y * this.width + x) * 4 + 1]
		const b = this.imgData.data[(y * this.width + x) * 4 + 2]
		const a = this.imgData.data[(y * this.width + x) * 4 + 3]
		return {
			height: r * 5 || 0,
			x,
			y,
		}
	}

	_getPic(minX, minY, imgDom) {
		this.blockCtx.clearRect(0, 0, this.stepX, this.stepY)
		this.blockCtx.drawImage(imgDom, -minX, -minY)
		return this.blockC.toDataURL('image/png')
	}
}

// const scene = viewer.scene
// const instances = []

// let stepLon = 0.01,
//   stepLat = 0.01
// const minLon = 119.3,
//   maxLon = 119.4
// const minLat = 36.5,
//   maxLat = 36.6
// const lonD = Math.floor((maxLon - minLon) / stepLon)
// const latD = Math.floor((maxLat - minLat) / stepLat)
// console.warn(lonD, latD)
// let cols, rows //1772 1181
// let imgData
// function xyToLonLatHeightAry(x, y) {
// const r = imgData.data[y * cols * 4 + x]
// const g = imgData.data[y * cols * 4 + x + 1]
// const b = imgData.data[y * cols * 4 + x + 2]
// const a = imgData.data[y * cols * 4 + x + 3]
//   const height = r * 5

//   return height
// }

// const testImg = document.createElement('IMG')
// testImg.src = './data/test.png'
// testImg.onload = () => {
//   cols = testImg.width
//   rows = testImg.height // 图片原始像素宽高
//   const c = document.createElement('CANVAS')
//   c.width = cols
//   c.height = rows
//   const ctx = c.getContext('2d')
//   ctx.drawImage(testImg, 0, 0)
//   imgData = ctx.getImageData(0, 0, c.width, c.height)

//   const lonLatHeightAry = []
//   for (let lon = minLon, i = 0; i < lonD; lon += stepLon, i++) {
//     for (let lat = maxLat, j = 0; j < latD; lat -= stepLat, j++) {
//       const x = (cols * (lon - minLon)) / (maxLon - minLon)
//       const y = rows - (rows * (lat - minLat)) / (maxLat - minLat)

//       lonLatHeightAry.push([
//         lon,
//         lat,
//         xyToLonLatHeightAry(parseInt(x), parseInt(y)),
//       ])
//     }
//   }
//   for (let index = 0; index < lonLatHeightAry.length; index++) {
//     const x = index % lonD
//     const y = Math.floor(index / lonD)
//     const ele = lonLatHeightAry[index]

//     // 不要最后一行
//     if (y < latD - 1) {
//       if (index % 2 === 0) {
//         instances.push(
//           new Cesium.GeometryInstance({
//             geometry: new Cesium.PolygonGeometry({
//               polygonHierarchy: new Cesium.PolygonHierarchy(
//                 Cesium.Cartesian3.fromDegreesArrayHeights([
//                   ...ele,
//                   ...lonLatHeightAry[index + lonD],
//                   ...lonLatHeightAry[index + lonD + 1],
//                   ...ele,
//                 ])
//               ),
//               perPositionHeight: true,
//             }),
//           })
//         )
//       } else {
//         instances.push(
//           new Cesium.GeometryInstance({
//             geometry: new Cesium.PolygonGeometry({
//               polygonHierarchy: new Cesium.PolygonHierarchy(
//                 Cesium.Cartesian3.fromDegreesArrayHeights([
//                   ...ele,
//                   ...lonLatHeightAry[index + lonD],
//                   ...lonLatHeightAry[index - 1],
//                   ...ele,
//                 ])
//               ),
//               perPositionHeight: true,
//             }),
//           })
//         )
//       }
//     }
//   }

//   scene.primitives.add(
//     new Cesium.Primitive({
//       geometryInstances: instances,
//       appearance: new Cesium.MaterialAppearance({
//         material: new Cesium.Material({
//           fabric: {
//             type: 'Image',
//             uniforms: {
//               image: testPic,
//             },
//           },
//         }),
//         flat: true,
//         faceForward: true,
//       }),
//     })
//   )
// }
