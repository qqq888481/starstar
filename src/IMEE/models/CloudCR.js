/* eslint-disable no-undef */
import { Meshs, Point3, Color4 } from './Meshs'

// const VALUE_ERR_CR = 0; // 总云量数据0-100 0无效
// const HEIT_BASE_CR = 5000; // 基础高度
// const HEIT_SCALE_CR = 50; // 高度系数
// const VALUE_MIN_CR = 10; // 云量最小值
// const HEIT_MIN_SCALE_CR = 0.1; // 小于HEIT_MIN_SCALE_CR不绘制
// const PERPRIMITI_NUMS_CR = 20000; // 每个primitive合并的三角面元最大数量
const VALUE_ERR_CR = 0 // 总云量数据0-100 0无效
const HEIT_BASE_CR = 50000 // 基础高度
const HEIT_SCALE_CR = 50 // 高度系数
const VALUE_MIN_CR = 10 // 云量最小值
const HEIT_MIN_SCALE_CR = 0.0 // 小于HEIT_MIN_SCALE_CR不绘制
const PERPRIMITI_NUMS_CR = 20000 // 每个primitive合并的三角面元最大数量
const CLOUDCR_SHADER = {
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
// highp float getHeit(vec3 pt){
//   highp float scale = 0.0001;
//   pt.x = pt.x * scale;
//    pt.y = pt.y * scale;
//   pt.z = pt.z * scale;
//   highp float R = 6378137.0 * scale;
//   highp float r = 6356752.3142451793 * scale;
//   highp float r2 = r * r;
//   highp float dR2 = pt.x * pt.x + pt.y * pt.y;
//   highp float dis2 = dR2 + pt.z * pt.z;
//   highp float heit = dis2 * R2 * r2 / (R2 * pt.z * pt.z + r2 * dR2);
//    heit = sqrt(dis2) - sqrt(heit);
//   return heit/scale;
// }

// 总云量+云底高+云顶高模拟云 先引用CustomPrimitive.js
export default class CloudCR {
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
	}

	loadDataInfo(dataInfo) {
		// comInfo={Bound,DataAry}
		// Bound=[9]: 0-LonMin 1-LatMin 2-LonNums 3-LatNums 4-DLon 5-DLat
		// 6-ValueScale 7-ValueMin 8-ValueMax
		// DataAry=[N] N= LatNums*LonNums*Stride
		this.removeAll()
		this.isLoadData = false
		this.comDataInfo.Mesh.clear()
		if (
			dataInfo.Bound.length < 11 ||
			dataInfo.Bound[2] < 2 ||
			dataInfo.Bound[3] < 2 ||
			dataInfo.Bound[4] < 0 ||
			dataInfo.Bound[5] < 0 ||
			dataInfo.Bound[7] > dataInfo.Bound[8] ||
			dataInfo.DataAry.length !==
				dataInfo.Bound[2] * dataInfo.Bound[3] * dataInfo.Bound[9]
		) {
			return
		}
		let valueScale = dataInfo.Bound[6] ? dataInfo.Bound[6] : 1
		valueScale = 1.0 / valueScale

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

		// 获取每个格点的位置和颜色 初始化mesh顶点信息
		let index = 0
		let valueCR
		let heitBtm
		let heitTop
		let alpha
		let lon, lat, ptTop
		let heitMin, heitMax
		for (let i = 0; i < latNums; i++) {
			lat = latMin + i * latStep
			for (let j = 0; j < lonNums; j++) {
				lon = lonMin + j * lonStep
				valueCR = dataInfo.DataAry[index++] * valueScale
				heitBtm = dataInfo.DataAry[index++] * valueScale
				heitTop = dataInfo.DataAry[index++] * valueScale

				heitBtm = heitBtm === 0 ? 0 : heitBtm
				heitTop = heitTop === 0 ? 0 : heitTop
				heitBtm = HEIT_BASE_CR + heitBtm * HEIT_SCALE_CR
				heitTop = HEIT_BASE_CR + heitTop * HEIT_SCALE_CR
				if (i == 0 || i == latNums - 1 || j == 0 || j == lonNums - 1) {
					alpha = 0
				} else {
					alpha = valueCR < VALUE_MIN_CR ? 0 : valueCR / 100.0
				}

				if (!heitMin) {
					heitMin = heitBtm <= heitTop ? heitBtm : heitTop
					heitMax = heitBtm <= heitTop ? heitTop : heitBtm
				} else {
					if (heitBtm < heitMin) heitMin = heitBtm
					if (heitTop < heitMin) heitMin = heitTop
					if (heitBtm > heitMax) heitMax = heitBtm
					if (heitTop > heitMax) heitMax = heitTop
				}

				const heit = heitBtm >= heitTop ? heitBtm : heitTop
				ptTop = Cesium.Cartesian3.fromDegrees(lon, lat, heit)
				this.comDataInfo.Mesh.addVertex(
					new Point3(ptTop.x, ptTop.y, ptTop.z),
					new Color4(1, 1, 1, alpha)
				)
			}
		}
		this.heitMin = heitMin + (heitMax - heitMin) * HEIT_MIN_SCALE_CR

		// 初始化mesh三角面元信息
		for (let i = 0; i < latNums - 1; i++) {
			const indexR0 = i * lonNums
			const indexR1 = (i + 1) * lonNums
			for (let j = 0; j < lonNums - 1; j++) {
				const value00 = dataInfo.DataAry[3 * (indexR0 + j)]
				const value01 = dataInfo.DataAry[3 * (indexR0 + j + 1)]
				const value10 = dataInfo.DataAry[3 * (indexR1 + j)]
				const value11 = dataInfo.DataAry[3 * (indexR1 + j + 1)]
				if (
					value00 === VALUE_ERR_CR &&
					value01 === VALUE_ERR_CR &&
					value10 === VALUE_ERR_CR &&
					value11 === VALUE_ERR_CR
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
		this.comDataInfo.Mesh.laplacianSmooth(5)

		this.isLoadData = true
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
		this._renderMesh(this.comDataInfo.Mesh)
		this.isRending = false
	}

	_renderMesh(mesh) {
		let index = 0
		let positions = []
		let colors = []
		let indices = []
		const shaderFS = CLOUDCR_SHADER.FS
		const shaderVS = CLOUDCR_SHADER.VS
		for (let i = 0; i < mesh.faceAry.length; i++) {
			if (i !== 0 && i % PERPRIMITI_NUMS_CR == 0) {
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
