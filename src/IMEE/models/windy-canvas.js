/* eslint-disable strict */
/* eslint-disable camelcase */

'use strict'
import { getHeitByHpa, HPA_HEIT_ZOOM } from '@/IMEE/utils/mathUtil'

// const { Rectangle, ImageMaterialProperty, CallbackProperty } = Cesium;

const CHANGBD_LONLAT = 0.005
const CHANGBD_CANVAS = 5
const CHANGBD_ALT = 1e3
const CHANGBD_MINALT = 1
const CHANGBD_MAXALT = 1e10
const CANVAS_HEIGHT = 1024
const CANVAS_FillStyle = 'rgba(255, 255, 255, 0.9)'
const LINE_WIDTH = 2

const FRAME_TIME = 60
const PARTICLE_AGEMIN = 20
const PARTICLE_AGERAND = 2
const PARTICLE_NUMS = 1000

// let width, height
let isDrawIng = false // 是否正在画图

// 使用一整张canvas覆盖地图div，然后在canvas上绘制
// 只能在二维状态下使用
// 需要在外面手动建一个canvas windy

export default class Windy {
	constructor(viewer) {
		this.viewer = viewer
		this.isLoadData = false
		this.interval = null //计时器
		this.isInitWindy = false
		this.isShow = true
		this.dataInfo = {
			LonMin: 0,
			LonMax: 0,
			LatMin: 0,
			LatMax: 0,
			DLon: 0,
			DLat: 0,
			LonNums: 0,
			LatNums: 0,
			LonStep: 0,
			LatStep: 0,

			UV: [], // UV分量 [i][j]->([i][j][0]-U [i][j][1]-V [i][j][2]-Speed)
		}

		this.curViewBD = {}

		this.boundInfo = {
			Width: 0, // canvas大小
			Height: 0,
			LonMin: -180, // 视图区域边界
			LonMax: 180,
			LatMin: -90,
			LatMax: 90,
			DLon: 0,
			DLat: 0,
			IsSpan180: false, // 是否跨180度 true-左：LonS-LonE 右：LonS2-LonE2
			LonMax2: 180,
			DLon2: 0,
			XSpan: 0,
		}

		this.particleBuf = [] // 粒子列表
		this.speedScale = 1
		this.isAir = false
		this.windHeit = 1e6
		// this.imgEntity = null;
		this.isPlaying = false
		this.canvasObj = document.getElementById('windy')
		// this.canvasObj = document.createElement('canvas');
		this.ctxObj = this.canvasObj.getContext('2d')

		this.curViewParam = {
			CanvasWidth: 0,
			CanvasHeight: 0,
			MapCenterLon: 0,
			MapCenterLat: 0,
			MapCenterAlt: 0,
		}

		this.viewer.scene.camera.moveStart.addEventListener(() => {
			this.clear()
		})

		this.viewer.scene.camera.moveEnd.addEventListener(() => {
			this.refreshGroud(this.viewer.getCurBDInfo(), false)
		})
	}

	loadDataInfo(dataInfo, speedScale, windHPa, heightZoom = HPA_HEIT_ZOOM) {
		this.remove()
		function _getUVSpeed(u, v) {
			return [u, v, Math.sqrt(u * u + v * v)]
		}

		// 数据处理******************************************************************************
		// const uArrays = dataInfo.uArrays
		// const vArrays = dataInfo.vArrays

		// const UV = []
		// // dataInfo
		// for (let i = uArrays.length - 1; i >= 0; i--) {
		// 	for (let j = 0; j < uArrays[i].length; j++) {
		// 		UV.push(uArrays[i][j])
		// 		UV.push(vArrays[i][j])
		// 	}
		// }

		// const DLon = (dataInfo.endLon - dataInfo.startLon)
		// const DLat = (dataInfo.startLat - dataInfo.endLat)

		// const Bound = [
		// 	dataInfo.startLon, dataInfo.endLat, dataInfo.cols, dataInfo.rows, DLon, DLat, 1
		// ]
		// dataInfo.Bound = Bound
		// dataInfo.DataAry = UV

		if (
			dataInfo.Bound.length < 7 ||
			dataInfo.Bound[2] < 2 ||
			dataInfo.Bound[3] < 2 ||
			dataInfo.Bound[4] < 0 ||
			dataInfo.Bound[5] < 0 ||
			dataInfo.DataAry.length !== 2 * dataInfo.Bound[2] * dataInfo.Bound[3]
		) {
			return
		}

		// ******************************************************************************
		// 初始化数据信息
		this.speedScale = speedScale || 1

		this.heightZoom = heightZoom
		windHPa = windHPa || 1000
		if (windHPa < 1000 && windHeit !== 0) {
			this.isAir = true
		}
		this.windHeit = getHeitByHpa(windHPa) * this.heightZoom

		this.dataInfo.LonMin = dataInfo.Bound[0]
		this.dataInfo.LatMin = dataInfo.Bound[1]
		this.dataInfo.LonNums = dataInfo.Bound[2]
		this.dataInfo.LatNums = dataInfo.Bound[3]
		this.dataInfo.LonStep = dataInfo.Bound[4] / dataInfo.Bound[2]
		this.dataInfo.LatStep = dataInfo.Bound[5] / dataInfo.Bound[3]

		this.dataInfo.DLon = dataInfo.Bound[4]
		this.dataInfo.DLat = dataInfo.Bound[5]
		this.dataInfo.LonMax = dataInfo.Bound[0] + dataInfo.Bound[4]
		this.dataInfo.LatMax = dataInfo.Bound[1] + dataInfo.Bound[5]
		this.dataInfo.ValueScale = 1.0 / dataInfo.Bound[6]
		this.dataInfo.UV = []
		for (let index = 0; index < this.dataInfo.LatNums; index++) {
			this.dataInfo.UV[index] = []
			for (let j = 0; j < this.dataInfo.LonNums; j++) {
				this.dataInfo.UV[index].push(
					_getUVSpeed(
						dataInfo.DataAry[index * this.dataInfo.LonNums * 2 + j * 2],
						dataInfo.DataAry[index * this.dataInfo.LonNums * 2 + j * 2 + 1]
					)
				)
			}
		}

		this.isLoadData = true
	}

	doRender() {
		if (this.isAir) {
			this.refreshAir()
		} else {
			this.refreshGroud(this.viewer.getCurBDInfo(), false)
		}
	}

	refreshAir() {
		// 获取当前canvas边界信息
		// 纬度方向
		this.boundInfo.IsSpan180 = false
		this.boundInfo.XSpan = 0
		this.boundInfo.LonMin = this.dataInfo.LonMin
		this.boundInfo.LonMax = this.dataInfo.LonMax
		this.boundInfo.LatMin = this.dataInfo.LatMin
		this.boundInfo.LatMax = this.dataInfo.LatMax
		this.boundInfo.DLon = this.dataInfo.DLon
		this.boundInfo.DLat = this.dataInfo.DLat
		this.boundInfo.Height = CANVAS_HEIGHT
		this.boundInfo.Width = Math.ceil(
			(CANVAS_HEIGHT * this.boundInfo.DLon) / this.boundInfo.DLat
		)

		this._initParticles()
		this._startWindy()
	}

	refreshGroud(curViewBD, isCheckAlt) {
		if (this.isAir) {
			return
		}
		if (
			this.isPlaying ||
			!this.isLoadData ||
			!this.isShow ||
			(isCheckAlt &&
				(curViewBD.MapCenterAlt < CHANGBD_MINALT ||
					curViewBD.MapCenterAlt > CHANGBD_MAXALT))
		) {
			return
		}
		// 判断交集
		let isView = !(
			this.dataInfo.LonMin >= curViewBD.LonMax ||
			this.dataInfo.LonMax <= curViewBD.LonMin ||
			this.dataInfo.LatMin >= curViewBD.LatMax ||
			this.dataInfo.LatMax <= curViewBD.LatMin
		)
		if (curViewBD.IsSpan180) {
			isView =
				isView ||
				!(
					this.dataInfo.LonMin >= curViewBD.LonMax2 ||
					this.dataInfo.LatMin >= curViewBD.LatMax ||
					this.dataInfo.LatMax <= curViewBD.LatMin
				)
		}
		if (!isView) {
			return
		}

		// 判断边界
		let isChange = false
		if (
			Math.abs(this.curViewParam.CanvasWidth - curViewBD.CanvasWidth) >
			CHANGBD_CANVAS
		) {
			this.curViewParam.CanvasWidth = curViewBD.CanvasWidth
			isChange = true
		}
		if (
			Math.abs(this.curViewParam.CanvasHeight - curViewBD.CanvasHeight) >
			CHANGBD_CANVAS
		) {
			this.curViewParam.CanvasHeight = curViewBD.CanvasHeight
			isChange = true
		}
		if (
			Math.abs(this.curViewParam.MapCenterLon - curViewBD.MapCenterLon) >
			CHANGBD_LONLAT
		) {
			this.curViewParam.MapCenterLon = curViewBD.MapCenterLon
			isChange = true
		}
		if (
			Math.abs(this.curViewParam.MapCenterLat - curViewBD.MapCenterLat) >
			CHANGBD_LONLAT
		) {
			this.curViewParam.MapCenterLat = curViewBD.MapCenterLat
			isChange = true
		}
		if (
			Math.abs(this.curViewParam.MapCenterAlt - curViewBD.MapCenterAlt) >
			CHANGBD_ALT
		) {
			this.curViewParam.MapCenterAlt = curViewBD.MapCenterAlt
			isChange = true
		}
		if (isCheckAlt && !isChange) {
			return
		}

		// 获取当前canvas边界信息
		// 纬度方向
		if (this.dataInfo.LatMin < curViewBD.LatMin) {
			this.boundInfo.LatMin = curViewBD.LatMin
		} else {
			this.boundInfo.LatMin = this.dataInfo.LatMin
		}
		if (this.dataInfo.LatMax > curViewBD.LatMax) {
			this.boundInfo.LatMax = curViewBD.LatMax
		} else {
			this.boundInfo.LatMax = this.dataInfo.LatMax
		}
		this.boundInfo.DLat = this.boundInfo.LatMax - this.boundInfo.LatMin
		curViewBD.DLat = curViewBD.LatMax - curViewBD.LatMin

		// 经度方向
		if (curViewBD.IsSpan180) {
			if (this.dataInfo.LonMin < curViewBD.LonMin) {
				this.boundInfo.LonMin = curViewBD.LonMin
			} else {
				this.boundInfo.LonMin = this.dataInfo.LonMin
			}

			if (this.dataInfo.LonMin < this.dataInfo.LonMax) {
				//数据未跨180,绘图区LonMax即为数据LonMax
				this.boundInfo.IsSpan180 = false
				this.boundInfo.LonMax = this.dataInfo.LonMax
				this.boundInfo.DLon = this.boundInfo.LonMax - this.boundInfo.LonMin
			} else {
				//数据跨180,绘图区LonMax即为180,启用LonMax2
				this.boundInfo.IsSpan180 = true
				this.boundInfo.LonMax = 180

				if (this.dataInfo.LonMax > curViewBD.LonMax2) {
					this.boundInfo.LonMax2 = curViewBD.LonMax2
				} else {
					this.boundInfo.LonMax2 = this.dataInfo.LonMax
				}

				this.boundInfo.DLon =
					360 - this.boundInfo.LonMin + this.boundInfo.LonMax2
				this.boundInfo.XSpan =
					(this.boundInfo.Width * (180 - this.boundInfo.LonMin)) /
					this.boundInfo.DLon
			}

			curViewBD.DLon = 360 - curViewBD.LonMin + curViewBD.LonMax2
			curViewBD.XSpan =
				(curViewBD.Width * (180 - curViewBD.LonMin)) / curViewBD.DLon
		} else {
			this.boundInfo.IsSpan180 = false

			if (this.dataInfo.LonMin < curViewBD.LonMin) {
				this.boundInfo.LonMin = curViewBD.LonMin
			} else {
				this.boundInfo.LonMin = this.dataInfo.LonMin
			}

			if (this.dataInfo.LonMax > curViewBD.LonMax) {
				this.boundInfo.LonMax = curViewBD.LonMax
			} else {
				this.boundInfo.LonMax = this.dataInfo.LonMax
			}

			this.boundInfo.DLon = this.boundInfo.LonMax - this.boundInfo.LonMin
			curViewBD.DLon = curViewBD.LonMax - curViewBD.LonMin

			this.boundInfo.XSpan = 0
			curViewBD.XSpan =
				(curViewBD.Width * (180 - curViewBD.LonMin)) / curViewBD.DLon
		}

		this._initDrawArea(curViewBD)
		this._initParticles()
		this._startWindy()
	}

	//绘图区配置
	_initDrawArea(curViewBD) {
		this.curViewBD = {
			...curViewBD,
		}

		this.boundInfo.Height = Math.ceil(
			(this.boundInfo.DLat / curViewBD.DLat) * curViewBD.Height
		)
		this.boundInfo.Width = Math.ceil(
			(this.boundInfo.DLon / curViewBD.DLon) * curViewBD.Width
		)

		this.boundInfo.StartY =
			this.boundInfo.LatMax === curViewBD.LatMax
				? 0
				: Math.ceil(
						((curViewBD.LatMax - this.boundInfo.LatMax) / curViewBD.DLat) *
							curViewBD.Height
				  )
		this.boundInfo.StartX = Math.ceil(
			((this.boundInfo.LonMin - curViewBD.LonMin) / curViewBD.DLon) *
				curViewBD.Width
		)

		this.canvasObj.width = curViewBD.Width
		this.canvasObj.height = curViewBD.Height
	}

	_initParticles() {
		this.particleBuf = []

		let particleObj
		for (let i = 0; i < PARTICLE_NUMS; i++) {
			particleObj = this._getParticle()

			if (particleObj) {
				this.particleBuf.push(particleObj)
			}
		}

		if (this.particleBuf.length > 0) {
			this.isInitWindy = true
		}
	}

	_animate() {
		if (!isDrawIng) {
			let ctxObj = this.ctxObj
			// let ctxObj = this.canvasObj.getContext('2d')
			// if (diffTime < FRAME_TIME + 5) {
			// 	ctxObj.clearRect(0, 0, this.boundInfo.Width, this.boundInfo.Height)
			// 	this.ctxObj = this.canvasObj.getContext('2d')
			// }
			// let prev = ctxObj.globalCompositeOperation || 'destination-in'
			ctxObj.fillStyle = CANVAS_FillStyle
			ctxObj.globalCompositeOperation = 'destination-in'
			ctxObj.fillRect(
				this.boundInfo.StartX,
				this.boundInfo.StartY,
				this.boundInfo.Width,
				this.boundInfo.Height
			)
			ctxObj.globalCompositeOperation = 'source-over'
			ctxObj.lineWidth = LINE_WIDTH
			ctxObj.strokeStyle = 'rgba(255,255,255, 1)'

			isDrawIng = true

			for (
				let index = 0, particleBufLength = this.particleBuf.length;
				index < particleBufLength;
				index++
			) {
				let particle = this.particleBuf[index]
				if (particle.Age >= particle.AgeMax) {
					let particleObj = this._getParticle()
					if (particleObj != null) {
						particle.X = particleObj.X
						particle.Y = particleObj.Y
						particle.U = particleObj.U
						particle.V = particleObj.V
						particle.Speed = particleObj.Speed
						particle.Age = particleObj.Age
						particle.AgeMax = particleObj.AgeMax

						particleObj = null
					}
				}
				let x = particle.X
				let y = particle.Y
				if (
					y < this.boundInfo.StartY ||
					y >= this.boundInfo.StartY + this.boundInfo.Height ||
					x < this.boundInfo.StartX ||
					x >= this.boundInfo.StartX + this.boundInfo.Width
				) {
					particle.Age = particle.AgeMax
				} else {
					particle.Age++
					let xt = x - particle.U * this.speedScale
					let yt = y + particle.V * this.speedScale // 屏幕坐标Y原点在左上角
					ctxObj.beginPath()
					ctxObj.moveTo(x, y)
					ctxObj.lineTo(xt, yt)
					particle.X = xt
					particle.Y = yt
					ctxObj.stroke()
					ctxObj.closePath()
					let uv = this._interBilinear(xt, yt)
					if (uv) {
						particle.U = uv[0]
						particle.V = uv[1]
						particle.Speed = uv[2]
					}
				}

				particle = null
				x = null
				y = null
			}

			isDrawIng = false
			ctxObj = null
			// prev = null

			// return this.canvasObj;
		} else {
			return null
		}
	}

	_startWindy() {
		if (this.interval) {
			clearInterval(this.interval)
		}
		this.interval = setInterval(() => {
			this._animate()
		}, FRAME_TIME)
	}

	// _startWindy() {
	// 	if (!this.isInitWindy) {
	// 		return;
	// 	}

	// 	let rec = Rectangle.fromDegrees(
	// 		this.boundInfo.LonMin,
	// 		this.boundInfo.LatMin,
	// 		this.boundInfo.LonMax,
	// 		this.boundInfo.LatMax
	// 	);
	// 	if (this.boundInfo.IsSpan180) {
	// 		rec = Rectangle.fromDegrees(
	// 			this.boundInfo.LonMin,
	// 			this.boundInfo.LatMin,
	// 			this.boundInfo.LonMax2,
	// 			this.boundInfo.LatMax
	// 		);
	// 	}

	// 	if (
	// 		!this.boundInfo.LonMin ||
	// 		!this.boundInfo.LatMin ||
	// 		!this.boundInfo.LonMax ||
	// 		!this.boundInfo.LatMax
	// 	) {
	// 		return;
	// 	}

	// 	if (!this.isAir) {
	// 		if (!this.imgEntity) {
	// 			this.imgEntity = this.viewer.entities.add({
	// 				rectangle: {
	// 					coordinates: rec,
	// 					material: new ImageMaterialProperty({
	// 						image: new CallbackProperty(
	// 							this._animate.bind(this),
	// 							false
	// 						),
	// 						transparent: true,
	// 					}),
	// 					height: this.windHeit,
	// 				},
	// 			});
	// 		}
	// 	} else {
	// 		if (!this.imgEntity) {
	// 			this.imgEntity = this.viewer.entities.add({
	// 				rectangle: {
	// 					coordinates: rec,
	// 					material: new ImageMaterialProperty({
	// 						image: new CallbackProperty(
	// 							this._animate.bind(this),
	// 							false
	// 						),
	// 						transparent: true,
	// 					}),
	// 					height: this.windHeit,
	// 				},
	// 			});
	// 		}
	// 	}

	// 	this.imgEntity.rectangle.coordinates = rec;
	// 	rec = null;
	// }

	remove() {
		this.isAir = false
		this.isLoadData = false
		this.isInitWindy = false
		this.isPlaying = false

		this.dataInfo.UV = []
		this.particleBuf = []
		this.isPlaying = false
	}

	clear() {
		clearInterval(this.interval)
		this.interval = null
		let ctxObj = this.ctxObj
		ctxObj.clearRect(0, 0, this.canvasObj.width, this.canvasObj.height)
	}

	changeShow(isShow) {
		this.isShow = isShow
		if (!isShow) {
			this.clear()
		}
	}

	destroy() {
		this.clear()
		this.remove()
	}

	_getParticle() {
		let uvGridInfo = this.dataInfo.UV
		if (uvGridInfo.length === 0) {
			return null
		}
		let x
		let y
		let safetyNet = 0
		let uvObj = null
		let partObj = null
		do {
			x = this.boundInfo.StartX + Math.random() * (this.boundInfo.Width - 1)
			y = this.boundInfo.StartY + Math.random() * (this.boundInfo.Height - 1)
			uvObj = this._interBilinear(x, y)
		} while ((!uvObj || uvObj[2] <= 0) && safetyNet++ < 30)
		if (uvObj) {
			partObj = {
				X: x,
				Y: y,
				U: uvObj[0],
				V: uvObj[1],
				Speed: uvObj[2],
				Age: 0,
				AgeMax: Math.floor(Math.random() * PARTICLE_AGERAND + PARTICLE_AGEMIN),
			}
		}
		uvGridInfo = null
		return partObj
	}

	_xyTolonLat(px, py) {
		let lon0 = this.curViewBD.LonMin
		if (this.boundInfo.IsSpan180) {
			//只有绘图区跨180才做处理
			if (px > this.curViewBD.XSpan) {
				lon0 = this.curViewBD.LonMin - 360
			}
		}
		const lon = lon0 + (px * this.curViewBD.DLon) / this.curViewBD.Width
		const lat =
			this.curViewBD.LatMax - (py * this.curViewBD.DLat) / this.curViewBD.Height

		return [lon, lat]
	}

	_interBilinear(px, py) {
		const lonlat = this._xyTolonLat(px, py)

		py = (lonlat[1] - this.dataInfo.LatMin) / this.dataInfo.LatStep
		px = (lonlat[0] - this.dataInfo.LonMin) / this.dataInfo.LonStep

		const rowIndex = Math.floor(py)
		const colIndex = Math.floor(px)
		const rowIndex2 = rowIndex + 1
		const colIndex2 = colIndex + 1
		if (
			rowIndex < 0 ||
			rowIndex >= this.dataInfo.LatNums ||
			colIndex < 0 ||
			colIndex >= this.dataInfo.LonNums ||
			rowIndex2 < 0 ||
			rowIndex2 >= this.dataInfo.LatNums ||
			colIndex2 < 0 ||
			colIndex2 >= this.dataInfo.LonNums
		) {
			return null
		}

		const g00 = this.dataInfo.UV[rowIndex][colIndex]
		const g01 = this.dataInfo.UV[rowIndex2][colIndex]
		const g10 = this.dataInfo.UV[rowIndex][colIndex2]
		const g11 = this.dataInfo.UV[rowIndex2][colIndex2]

		const x = px - colIndex
		const y = py - rowIndex
		const rx = 1 - x
		const ry = 1 - y
		const a = rx * ry
		const b = x * ry
		const c = rx * y
		const d = x * y

		const u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d
		const v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d
		const s = u * u + v * v

		return [-u, -v, Math.sqrt(s)]
	}

	_getWindColor(speed) {
		const cl = 'rgba(255,255,255, 1)'

		return cl
	}

	// 根据经纬度获取当前粒子信息
	_getBilinearByLonLat(lon, lat) {
		const py = (lat - this.dataInfo.LatMin) / this.dataInfo.LatStep
		const px = (lon - this.dataInfo.LonMin) / this.dataInfo.LonStep

		const rowIndex = Math.floor(py)
		const colIndex = Math.floor(px)
		const rowIndex2 = rowIndex + 1
		const colIndex2 = colIndex + 1
		if (
			rowIndex < 0 ||
			rowIndex >= this.dataInfo.LatNums ||
			colIndex < 0 ||
			colIndex >= this.dataInfo.LonNums ||
			rowIndex2 < 0 ||
			rowIndex2 >= this.dataInfo.LatNums ||
			colIndex2 < 0 ||
			colIndex2 >= this.dataInfo.LonNums
		) {
			return null
		}

		const g00 = this.dataInfo.UV[rowIndex][colIndex]
		const g01 = this.dataInfo.UV[rowIndex2][colIndex]
		const g10 = this.dataInfo.UV[rowIndex][colIndex2]
		const g11 = this.dataInfo.UV[rowIndex2][colIndex2]

		const x = px - colIndex
		const y = py - rowIndex
		const rx = 1 - x
		const ry = 1 - y
		const a = rx * ry
		const b = x * ry
		const c = rx * y
		const d = x * y

		const u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d
		const v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d
		const s = u * u + v * v

		return [-u, -v, Math.sqrt(s)]
	}
}
