export default class DataProcess {
	constructor() {
		this.data = null
	}
	static loadData(data) {
		const U = []
		const V = []
		const lon = []
		const lat = []
		for (let index = 0; index < data.DataAry.length - 1; index += 2) {
			U.push(data.DataAry[index])
			V.push(data.DataAry[index + 1])
		}
		const latSpan = data.Bound[5] / (data.Bound[3] - 1)
		for (let index = 0; index < data.Bound[3]; index++) {
			lat.push(data.Bound[1] + latSpan * index)
		}
		const lonSpan = data.Bound[4] / (data.Bound[2] - 1)
		for (let index = 0; index < data.Bound[2]; index++) {
			lon.push(data.Bound[0] + lonSpan * index)
		}

		const processData = {
			U: {
				array: new Float32Array(U),
				max: Math.max(...U),
				min: Math.min(...U),
			},
			V: {
				array: new Float32Array(V),
				max: Math.max(...V),
				min: Math.min(...V),
			},
			dimensions: {
				lat: data.Bound[3],
				lev: 1,
				lon: data.Bound[2],
			},
			lat: {
				array: new Float32Array(lat),
				max: Math.max(...lat),
				min: Math.min(...lat),
			},
			lon: {
				array: new Float32Array(lon),
				max: Math.max(...lon),
				min: Math.min(...lon),
			},
			lev: {
				array: new Float32Array([1]),
				max: 1,
				min: 1,
			},
		}

		this.data = processData

		return processData
	}

	static randomizeParticles(maxParticles, viewerParameters) {
		var array = new Float32Array(4 * maxParticles)
		for (var i = 0; i < maxParticles; i++) {
			array[4 * i] = Cesium.Math.randomBetween(
				viewerParameters.lonRange.x,
				viewerParameters.lonRange.y
			)
			array[4 * i + 1] = Cesium.Math.randomBetween(
				viewerParameters.latRange.x,
				viewerParameters.latRange.y
			)
			array[4 * i + 2] = Cesium.Math.randomBetween(
				this.data.lev.min,
				this.data.lev.max
			)
			array[4 * i + 3] = 0.0
		}

		return array
	}
}
