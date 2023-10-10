/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { Meshs, Point3, Color4 } from './Meshs'

const VALUE_ERR_CT = -100 // 无效值
const HEIT_BOTTOM_CT = 5000 // 云底高
const HEIT_SPAN_CT = 5000 // 云高跨度
const HEIT_SCALE_CT = 50 // 高度系数
const HEIT_MIN_SCALE_CT = 0.3 // 小于HEIT_MIN_SCALE_CT不绘制
const PERPRIMITI_NUMS_CT = 20000 // 每个primitive合并的三角面元最大数量

const CLOUDCTT_SHADER = {
	// heitMin以下不绘制;heitMin以上尽可能的值越大时不透明度越大 sin函数
	VS: `
    attribute vec3 position;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    attribute vec4 color;
    varying vec4 v_color;
    varying vec3 v_pt;
    void main(){
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        v_color = color;
        v_pt = position;
    }
    `,
	FS: `    
        #ifdef GL_ES
        precision highp float;
        #endif

        varying vec4 v_color;
        varying vec3 v_pt;   
        uniform float heitMin; 
        float PI05 = 3.14159265/2.0;

        highp float getHeit(vec3 pt){  
            highp float scale = 0.0001;

            pt.x = pt.x * scale;
            pt.y = pt.y * scale;
            pt.z = pt.z * scale;

            highp float R = 6378137.0 * scale;
            highp float r = 6356752.3142451793 * scale;
            highp float R2 = R * R;
            highp float r2 = r * r; 

            highp float dR2 = pt.x * pt.x + pt.y * pt.y;
            highp float dis2 = dR2 + pt.z * pt.z;
            highp float heit = dis2 * R2 * r2 / (R2 * pt.z * pt.z + r2 * dR2);
            heit = sqrt(dis2) - sqrt(heit);
        
            return heit/scale;
        }

        void main(){
            highp float heit = getHeit(v_pt); 
            if(heit >= heitMin){
                gl_FragColor = v_color;
            } 
        }
        `,
}

// 亮温模拟云 先引用CustomPrimitive.js
export default class CloudCTT {
	constructor(cesiumViewer) {
		this.viewer = cesiumViewer
		this.isLoadData = false
		this.isRending = false
		this.comDataInfo = {
			LonMin: 0,
			LonNums: 0,
			LonStep: 0,
			LonMax: 0,
			DLon: 0,
			LatMin: 0,
			LatNums: 0,
			LatStep: 0,
			LatMax: 0,
			DLat: 0,
			Mesh: new Meshs(),
		}
		this.primitiveAry = []
		this.heitMin = 0
		this.heitDelta = 0
	}

	loadDataInfo(dataInfo, obj) {
		// comInfo={Bound,DataAry}
		// Bound=[9]: 0-LonMin 1-LatMin 2-LonNums 3-LatNums 4-DLon 5-DLat 6-ValueScale 7-MinValue 8-MaxValue
		// DataAry=[N] N= LatNums*LonNums

		this.removeAll()
		this.isLoadData = false
		this.comDataInfo.Mesh.clear()
		if (
			dataInfo.Bound.length < 9 ||
			dataInfo.Bound[2] < 2 ||
			dataInfo.Bound[3] < 2 ||
			dataInfo.Bound[4] < 0 ||
			dataInfo.Bound[5] < 0 ||
			dataInfo.Bound[7] > dataInfo.Bound[8] ||
			dataInfo.DataAry.length !== dataInfo.Bound[2] * dataInfo.Bound[3]
		) {
			return
		}
		let valueScale = dataInfo.Bound[8] ? dataInfo.Bound[8] : 1
		valueScale = 1.0 / dataInfo.Bound[8]

		const lonMin = dataInfo.Bound[0]
		const latMin = dataInfo.Bound[1]
		const lonNums = dataInfo.Bound[2]
		const latNums = dataInfo.Bound[3]
		const dLon = dataInfo.Bound[4]
		const dLat = dataInfo.Bound[5]
		const lonStep = dLon / (lonNums - 1)
		const latStep = dLat / (latNums - 1)
		const minValue = dataInfo.Bound[7]
		const maxValue = dataInfo.Bound[8]

		this.comDataInfo.LonMin = lonMin
		this.comDataInfo.LatMin = latMin
		this.comDataInfo.LonNums = lonNums
		this.comDataInfo.LatNums = latNums
		this.comDataInfo.DLon = dLon
		this.comDataInfo.DLat = dLat
		this.comDataInfo.LonStep = lonStep
		this.comDataInfo.LatStep = latStep
		this.comDataInfo.LonMax = lonMin + dLon
		this.comDataInfo.LatMax = latMin + dLat

		this.heitMin =
			HEIT_BOTTOM_CT + HEIT_SPAN_CT * HEIT_SCALE_CT * HEIT_MIN_SCALE_CT

		const dValue = maxValue - minValue
		const isEq = dValue === 0

		// 获取每个格点的位置和颜色 初始化mesh顶点信息
		let index = 0
		let alpha
		let dt
		let heit
		for (let i = 0; i < latNums; i++) {
			index = i * lonNums
			const lat = latMin + i * latStep
			for (let j = 0; j < lonNums; j++) {
				const lon = lonMin + j * lonStep
				let value = dataInfo.DataAry[index + j]

				dt = 0
				alpha = 0
				heit = HEIT_BOTTOM_CT
				if (value < VALUE_ERR_CT) {
					value = VALUE_ERR_CT
				} else {
					value = value * valueScale
					if (value < minValue) value = minValue
					if (value > maxValue) value = maxValue
					if (!isEq) {
						dt = (maxValue - value) / dValue
						heit = HEIT_BOTTOM_CT + HEIT_SPAN_CT * HEIT_SCALE_CT * dt
						alpha = 0.5 + 0.5 * dt
					}
				}
				dataInfo.DataAry[index + j] = value

				if (i === 0 || i === latNums - 1 || j === 0 || j === lonNums - 1) {
					alpha = 0
				}
				const pt = Cesium.Cartesian3.fromDegrees(lon, lat, heit)
				this.comDataInfo.Mesh.addVertex(
					new Point3(pt.x, pt.y, pt.z),
					this.getClAry(
						value,
						obj.alpha,
						obj.valueAry,
						obj.rgbAry,
						obj.isNormal
					)
					//   new Color4(1, 1, 1, alpha)
				)
			}
		}

		// 初始化mesh三角面元信息
		for (let i = 0; i < latNums - 1; i++) {
			const indexR0 = i * lonNums
			const indexR1 = (i + 1) * lonNums
			for (let j = 0; j < lonNums - 1; j++) {
				const value00 = dataInfo.DataAry[indexR0 + j]
				const value01 = dataInfo.DataAry[indexR0 + j + 1]
				const value10 = dataInfo.DataAry[indexR1 + j]
				const value11 = dataInfo.DataAry[indexR1 + j + 1]
				if (
					value00 === VALUE_ERR_CT &&
					value01 === VALUE_ERR_CT &&
					value10 === VALUE_ERR_CT &&
					value11 === VALUE_ERR_CT
				) {
					continue
				}
				const index00 = indexR0 + j
				const index01 = indexR0 + j + 1
				const index10 = indexR1 + j
				const index11 = indexR1 + j + 1
				this.comDataInfo.Mesh.addFace(index00, index01, index10)
				this.comDataInfo.Mesh.addFace(index01, index11, index10)
			}
		}

		// 平滑处理
		this.comDataInfo.Mesh.laplacianSmooth(10)
		// this.comDataInfo.Mesh.taubinSmooth(2, 0.5, -0.5)
		// this.comDataInfo.Mesh.hcLaplacianSmooth(2, 1, 0.5)

		this.isLoadData = true
	}

	getClAry(value, alpha, valueAry, rgbAry, isNormal) {
		let clAry = [1, 1, 1, 0]
		alpha = !alpha ? 0 : alpha
		value === -0.999 ? (alpha = 0) : null
		const len = valueAry.length
		const minValue = valueAry[0]
		const maxValue = valueAry[len - 1]
		let normal = 1
		if (value >= minValue) {
			if (value > maxValue) {
				clAry = rgbAry[len - 1].map(value => Number(value))
			} else {
				let scale = 1
				let index = 1
				for (let i = 1; i < len; i++) {
					if (value <= valueAry[i]) {
						index = i
						scale = (value - valueAry[i - 1]) / (valueAry[i] - valueAry[i - 1])
						break
					}
				}
				const c1 = rgbAry[index - 1].map(value => Number(value))
				const c2 = rgbAry[index].map(value => Number(value))
				const r = c1[0] + scale * (c2[0] - c1[0])
				const g = c1[1] + scale * (c2[1] - c1[1])
				const b = c1[2] + scale * (c2[2] - c1[2])
				clAry = [r, g, b]
			}

			if (isNormal) {
				normal = 255.0
			}
		}
		return (
			{ r: clAry[0] / normal },
			{ g: clAry[1] / normal },
			{ b: clAry[2] / normal },
			{
				r: clAry[0] / normal,
				g: clAry[1] / normal,
				b: clAry[2] / normal,
				a: alpha,
			}
		)
	}

	removeAll() {
		for (let i = 0; i < this.primitiveAry.length; i++) {
			this.viewer.scene.primitives.remove(this.primitiveAry[i])
			this.primitiveAry[i].destroy()
			this.primitiveAry[i] = undefined
		}
		this.primitiveAry = []
	}

	changeShow(isShow) {
		for (let i = 0; i < this.primitiveAry.length; i++) {
			this.primitiveAry[i].show = isShow
		}
	}

	renderCloud() {
		if (!this.isLoadData || this.isRending || this.primitiveAry.length > 0) {
			return
		}
		this.isRending = true
		let index = 0
		let positions = []
		let colors = []
		let indices = []
		const mesh = this.comDataInfo.Mesh
		const shaderFS = CLOUDCTT_SHADER.FS
		const shaderVS = CLOUDCTT_SHADER.VS
		for (let i = 0; i < mesh.faceAry.length; i++) {
			if (i !== 0 && i % PERPRIMITI_NUMS_CT === 0) {
				this._renderGeo(
					positions,
					colors,
					new Uint16Array(indices),
					shaderFS,
					shaderVS
				)
				positions = []
				colors = []
				indices = []
				index = 0
			}
			const face = mesh.faceAry[i].face
			const p0index = face.p0Index
			const p1index = face.p1Index
			const p2index = face.p2Index

			const p0 = mesh.verticeAry[p0index]
			const p1 = mesh.verticeAry[p1index]
			const p2 = mesh.verticeAry[p2index]
			const c0 = mesh.perVerColorAry[p0index]
			const c1 = mesh.perVerColorAry[p1index]
			const c2 = mesh.perVerColorAry[p2index]

			positions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
			colors.push(
				c0.r,
				c0.g,
				c0.b,
				c0.a,
				c1.r,
				c1.g,
				c1.b,
				c1.a,
				c2.r,
				c2.g,
				c2.b,
				c2.a
			)
			const indexAdd = 3 * index
			indices.push(indexAdd + 0, indexAdd + 1, indexAdd + 2)
			index++
		}

		if (positions.length > 0) {
			this._renderGeo(
				positions,
				colors,
				new Uint16Array(indices),
				shaderFS,
				shaderVS
			)
		}

		this.isRending = false
	}

	_renderGeo(positionAry, colorAry, indiceAry, shaderFS, shaderVS) {
		const uniformMap = new Map()
		const heitMin = this.heitMin
		const heitMinFn = function () {
			return heitMin
		}
		uniformMap.set('heitMin', heitMinFn)

		const customPrimitiveOption = {
			geometry: CustomPrimitive.getGeometry(positionAry, colorAry, indiceAry),
			attributeLocations: {
				position: 0,
				color: 1,
			},
			primitiveType: Cesium.PrimitiveType.TRIANGLES,
			renderState: {
				depthTest: {
					enabled: true,
				},
				depthMask: true,
				blending: Cesium.BlendingState.ALPHA_BLEND,
			},
			vShader: shaderVS,
			fShader: shaderFS,
			uniformMap: uniformMap,
		}

		const customPrimitive = new CustomPrimitive(customPrimitiveOption)
		this.viewer.scene.primitives.add(customPrimitive)
		this.primitiveAry.push(customPrimitive)
	}
}
