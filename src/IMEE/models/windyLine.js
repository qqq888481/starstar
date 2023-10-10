import { getHeitByHpa, HPA_HEIT_ZOOM } from '../utils/mathUtil'

const FRAME_TIME_WDL = 50
const PARTICLE_AGEMIN_WDL = 10
const PARTICLE_AGERAND_WDL = 20
const PARTICLE_NUMS_WDL = 2000
let LINE_WIDTH_WDL = 1

const WDL_SHADER = {
	VS: `
    attribute vec3 position;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    attribute vec4 color;
    varying vec4 v_color;
    void main(){
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        v_color = color;
    }
    `,
	FS: `
        varying vec4 v_color;
        void main(){
            gl_FragColor = v_color;    
        }
        `,
}

// 使用primitive绘制的
// 只能三维，不好看，且消耗资源巨大，但是肯定不会崩
export default class WindyLine {
	constructor(cesiumViewer, isPolyline) {
		this.viewer = cesiumViewer
		this.isLoadData = false
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
			UV: [],
			ValueScale: 1,
		}

		this.particleBuf = []
		this.UVScale = 1
		this.windHeit = 1000
		this.primitiveLine = null
		this.playTimer = null
		this.isPolyline = isPolyline
		this.heightZoom = 0
	}

	loadDataInfo(dataInfo, speedScale, windHPa, heightZoom = HPA_HEIT_ZOOM) {
		// windInfo={Bound,DataAry}
		// Bound=[7]: 0-LonMin 1-LatMin 2-LonNums 3-LatNums 4-DLon 5-DLat 6-ValueScale
		// DataAry=[N] N=LatNums*LonNums 2i+0-U 2i+1-V
		// 数据从左下角开始先行再列排序
		this._clear()
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
		this.heightZoom = heightZoom
		// 初始化数据信息
		this.UVScale = speedScale || 1
		windHPa = windHPa || 1000
		this.windHeit = getHeitByHpa(windHPa) * this.heightZoom

		this.dataInfo.UV = dataInfo.DataAry
		this.dataInfo.LonMin = dataInfo.Bound[0]
		this.dataInfo.LatMin = dataInfo.Bound[1]
		this.dataInfo.LonNums = dataInfo.Bound[2]
		this.dataInfo.LatNums = dataInfo.Bound[3]
		this.dataInfo.DLon = dataInfo.Bound[4]
		this.dataInfo.DLat = dataInfo.Bound[5]
		this.dataInfo.ValueScale = 1.0 / dataInfo.Bound[6]
		this.dataInfo.LonStep = this.dataInfo.DLon / (this.dataInfo.LonNums - 1)
		this.dataInfo.LatStep = this.dataInfo.DLat / (this.dataInfo.LatNums - 1)
		this.dataInfo.LonMax = this.dataInfo.LonMin + this.dataInfo.DLon
		this.dataInfo.LatMax = this.dataInfo.LatMin + this.dataInfo.DLat

		// 初始化粒子
		for (let i = 0; i < PARTICLE_NUMS_WDL; i++) {
			const particleObj = this._getParticle()
			if (particleObj) {
				this.particleBuf.push(particleObj)
			}
		}
		this.isLoadData = true
	}

	doRender(altCamara) {
		if (this.particleBuf.length <= 0) {
			return
		}

		this.changParams(altCamara)
		const that = this
		let isAnimate = false
		this.playTimer = setInterval(function () {
			if (!isAnimate) {
				isAnimate = true
				that._animate()
				isAnimate = false
			}
		}, FRAME_TIME_WDL)
	}

	changParams(altCamara) {
		const minH = 1e4
		const maxH = 5e6
		const deltaH = maxH - minH
		const minW = 0.5
		const maxW = 2
		const deltaW = maxW - minW
		if (altCamara > maxH) altCamara = maxH
		if (altCamara < minH) altCamara = minH
		LINE_WIDTH_WDL = minW + (deltaW * (maxH - altCamara)) / deltaH
	}

	stopAnimate() {
		if (this.playTimer) {
			clearInterval(this.playTimer)
			this.playTimer = null
		}
	}

	_animate() {
		const instancesLine = []
		const uvScale = this.UVScale
		const latNums = this.dataInfo.LatNums
		const lonNums = this.dataInfo.LonNums

		const lineInfo = {
			positionAry: [],
			colorAry: [],
			indicesAry: [],
			index: 0,
		}

		for (let i = 0; i < this.particleBuf.length; i++) {
			const particle = this.particleBuf[i]
			if (particle.Age >= particle.AgeMax) {
				const po = this._getParticle()
				if (po) {
					particle.LonIndex = po.LonIndex
					particle.LatIndex = po.LatIndex
					particle.Age = po.Age
					particle.AgeMax = po.AgeMax
					particle.UV = po.UV
					particle.IndexList = po.IndexList
				} else {
					continue
				}
			}
			particle.Age++
			if (particle.Age >= particle.AgeMax) {
				particle.Age = particle.AgeMax
			} else {
				const lonIndex = particle.LonIndex
				const latIndex = particle.LatIndex
				const lonIndexT = lonIndex - particle.UV[0] * uvScale
				const latIndexT = latIndex - particle.UV[1] * uvScale
				if (
					latIndexT < 0 ||
					latIndexT >= latNums ||
					lonIndexT < 0 ||
					lonIndexT >= lonNums
				) {
					particle.Age = particle.AgeMax
				} else {
					const uvObj = this._interBilinear(lonIndexT, latIndexT)
					if (uvObj) {
						particle.UV = uvObj
					}
					particle.LonIndex = lonIndexT
					particle.LatIndex = latIndexT
					particle.IndexList.push(lonIndexT, latIndexT)

					const lineIns = this._getLineIns(particle.IndexList, lineInfo)
					if (this.isPolyline) {
						instancesLine.push(lineIns)
					}
				}
			}
		}

		this._removeLine()
		if (this.isPolyline) {
			if (instancesLine.length > 0) {
				this.primitiveLine = this.viewer.scene.primitives.add(
					new Cesium.Primitive({
						appearance: new Cesium.PolylineColorAppearance({
							translucent: true,
						}),
						geometryInstances: instancesLine,
						asynchronous: false,
					})
				)
			}
		} else {
			if (lineInfo.positionAry.length > 0) {
				const customPrimitiveOption = {
					geometry: CustomPrimitive.getGeometry(
						lineInfo.positionAry,
						lineInfo.colorAry,
						lineInfo.indicesAry
					),
					attributeLocations: {
						position: 0,
						color: 1,
					},
					primitiveType: Cesium.PrimitiveType.LINES,
					renderState: {
						depthTest: {
							enabled: true,
						},
						depthMask: true,
						blending: Cesium.BlendingState.ALPHA_BLEND,
					},
					vShader: WDL_SHADER.VS,
					fShader: WDL_SHADER.FS,
				}
				this.primitiveLine = new CustomPrimitive(customPrimitiveOption)
				this.viewer.scene.primitives.add(this.primitiveLine)
			}
		}
	}

	_getLineIns(indexAry, lineInfo) {
		const ptAry = []
		const clAry = []
		const size = indexAry.length / 2
		const size_1 = size - 1
		const lonMin = this.dataInfo.LonMin
		const latMin = this.dataInfo.LatMin
		const lonStep = this.dataInfo.LonStep
		const latStep = this.dataInfo.LatStep
		if (this.isPolyline) {
			for (let i = 0; i < size; i++) {
				const index = 2 * i
				const lon = lonMin + indexAry[index] * lonStep
				const lat = latMin + indexAry[index + 1] * latStep
				ptAry.push(lon, lat, this.windHeit)
				clAry.push(Cesium.Color.WHITE.withAlpha(i / size_1))
			}

			return new Cesium.GeometryInstance({
				geometry: new Cesium.PolylineGeometry({
					positions: Cesium.Cartesian3.fromDegreesArrayHeights(ptAry),
					colors: clAry,
					width: LINE_WIDTH_WDL,
					colorsPerVertex: true,
				}),
			})
		}

		for (let i = 0; i < size - 1; i++) {
			const index = 2 * i
			const lon1 = lonMin + indexAry[index] * lonStep
			const lat1 = latMin + indexAry[index + 1] * latStep
			const lon2 = lonMin + indexAry[index + 2] * lonStep
			const lat2 = latMin + indexAry[index + 3] * latStep
			const a1 = i / size_1
			const a2 = (i + 1) / size_1
			const pt1 = Cesium.Cartesian3.fromDegrees(lon1, lat1, this.windHeit)
			const pt2 = Cesium.Cartesian3.fromDegrees(lon2, lat2, this.windHeit)

			lineInfo.positionAry.push(pt1.x, pt1.y, pt1.z)
			lineInfo.positionAry.push(pt2.x, pt2.y, pt2.z)
			lineInfo.colorAry.push(1, 1, 1, a1)
			lineInfo.colorAry.push(1, 1, 1, a2)
			lineInfo.indicesAry.push(lineInfo.index++)
			lineInfo.indicesAry.push(lineInfo.index++)
		}
	}

	_clear() {
		this.stopAnimate()
		this._removeLine()
		this.isLoadData = false
		this.dataInfo.UV = []
		this.particleBuf = []
	}

	_removeLine() {
		if (this.primitiveLine) {
			this.viewer.scene.primitives.remove(this.primitiveLine)
			this.primitiveLine = null
		}
	}

	remove() {
		this.stopAnimate()
		this._removeLine()
		this.isLoadData = false
		this.dataInfo.UV = []
		this.particleBuf = []
	}

	_getParticle() {
		let lonIndex = 0
		let latIndex = 0
		let safetyNet = 0
		let uvObj = null
		let partObj = null
		do {
			lonIndex = Math.floor(Math.random() * (this.dataInfo.LonNums - 1))
			latIndex = Math.floor(Math.random() * (this.dataInfo.LatNums - 1))
			uvObj = this._interBilinear(lonIndex, latIndex)
		} while ((!uvObj || uvObj[2] <= 0) && safetyNet++ < 30)

		if (uvObj) {
			partObj = {
				LonIndex: lonIndex,
				LatIndex: latIndex,
				Age: 0,
				AgeMax:
					PARTICLE_AGEMIN_WDL + Math.ceil(Math.random() * PARTICLE_AGERAND_WDL),
				UV: uvObj,
				IndexList: [lonIndex, latIndex],
			}
		}

		return partObj
	}

	_interBilinear(lonIndex, latIndex) {
		let uv = null
		const rowIndex = Math.floor(latIndex)
		const colIndex = Math.floor(lonIndex)
		const latNums = this.dataInfo.LatNums
		const lonNums = this.dataInfo.LonNums
		const valueScale = this.dataInfo.ValueScale

		if (rowIndex === latIndex && colIndex === lonIndex) {
			let index = rowIndex * lonNums + colIndex
			index = 2 * index
			uv = [
				this.dataInfo.UV[index] * valueScale,
				this.dataInfo.UV[index + 1] * valueScale,
			]
		} else {
			let rowIndex2 = rowIndex + 1
			let colIndex2 = colIndex + 1
			if (rowIndex2 >= latNums) {
				rowIndex2 = latNums - 1
			}
			if (colIndex2 >= lonNums) {
				colIndex2 = lonNums - 1
			}
			if (
				rowIndex >= 0 &&
				rowIndex < latNums &&
				colIndex >= 0 &&
				colIndex < lonNums
			) {
				const index00 = rowIndex * lonNums + colIndex
				const index01 = rowIndex2 * lonNums + colIndex
				const index10 = rowIndex * lonNums + colIndex2
				const index11 = rowIndex2 * lonNums + colIndex2

				const index002 = 2 * index00
				const index012 = 2 * index01
				const index102 = 2 * index10
				const index112 = 2 * index11

				const x = lonIndex - colIndex
				const y = latIndex - rowIndex
				const rx = 1 - x
				const ry = 1 - y
				const a = rx * ry
				const b = x * ry
				const c = rx * y
				const d = x * y

				const u =
					this.dataInfo.UV[index002] * a +
					this.dataInfo.UV[index102] * b +
					this.dataInfo.UV[index012] * c +
					this.dataInfo.UV[index112] * d
				const v =
					this.dataInfo.UV[index002 + 1] * a +
					this.dataInfo.UV[index102 + 1] * b +
					this.dataInfo.UV[index012 + 1] * c +
					this.dataInfo.UV[index112 + 1] * d

				uv = [u * valueScale, v * valueScale]
			}
		}
		if (uv) {
			uv.push(Math.sqrt(uv[0] * uv[0] + uv[1] * uv[1]))
		}
		return uv
	}
}
