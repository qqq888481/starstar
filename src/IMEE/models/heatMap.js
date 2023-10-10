// import ImageEntity from '../../entities/imageEntity'

const RADUS = 100
const ptsNum = 500
let ptsList = []

// const valueMin = 0
let valueMax = 1

export default class HeatMap {
	constructor(viewer, id) {
		this.viewer = viewer
		this.entity = null
		this.id = id
		this.lonS = 116.358
		this.latS = 30.759
		this.lonE = ''
		this.latE = ''
		this.dLon = 1
		this.dLat = 1
		this.width = 1024
		this.height = 1024
		this.latE = ''
	}

	loadPtsInfo(data) {
		ptsList = []
		this.lonS = data.lonS
		this.latS = data.latS
		this.lonE = data.lonE
		this.latE = data.latE
		this.dLon = data.dLon
		this.dLat = data.dLat

		// this.dLat = this.dLon * this.height / this.width
		this.latE = this.latS + this.dLat
		this.height = Math.ceil((this.width * this.dLat) / this.dLon)
		ptsList = data.ptsList
		valueMax = data.valueMax
	}

	lonLatToXY(lon, lat) {
		const x = (this.width * (lon - this.lonS)) / this.dLon
		const y = (this.height * (this.latE - lat)) / this.dLat
		return [x, y]
	}

	drawHeap(callback) {
		const grays = []
		for (let y = 0; y < this.height; y++) {
			const graysrow = []
			for (let x = 0; x < this.width; x++) {
				graysrow[x] = 0
			}
			grays[y] = graysrow
		}

		let lonPt, latPt, valuePt, xy, px, py
		let xs, xe, ys, ye
		let dx, dy, ds, value
		let maxGray = 0

		for (let i = 0; i < ptsList.length; i++) {
			lonPt = ptsList[i].Lon
			latPt = ptsList[i].Lat
			valuePt = ptsList[i].Value / valueMax
			xy = this.lonLatToXY(lonPt, latPt)
			px = Math.floor(xy[0])
			py = Math.floor(xy[1])
			if (py < 0 || py > this.height || px < 0 || px > this.width) {
				continue
			}

			xs = px - RADUS
			xe = px + RADUS
			ys = py - RADUS
			ye = py + RADUS

			if (xs < 0) {
				xs = 0
			}
			if (xe >= this.width) {
				xe = this.width - 1
			}
			if (ys < 0) {
				ys = 0
			}
			if (ye >= this.height) {
				ye = this.height - 1
			}

			for (let yy = ys; yy <= ye; yy++) {
				dy = yy - py
				for (let xx = xs; xx <= xe; xx++) {
					dx = xx - px
					ds = Math.sqrt(dx * dx + dy * dy)
					if (ds <= RADUS) {
						value = ((RADUS - ds) / RADUS) * valuePt
						grays[yy][xx] += value
						if (maxGray < grays[yy][xx]) {
							maxGray = grays[yy][xx]
						}
					}
				}
			}
		}

		const canvas = document.createElement('canvas')
		canvas.width = this.width
		canvas.height = this.height
		const context = canvas.getContext('2d')
		const cl = []
		let r, g, b, a, gray
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				r = 0
				g = 0
				b = 0
				a = 0
				gray = grays[y][x] / maxGray
				if (gray <= 0.1) {
					cl.push(r, g, b, a)
					continue
				}

				// 配置颜色板 实现光滑效果
				a = gray
				if (gray >= 0.9) {
					r = 255
				} else if (gray >= 0.75) {
					r = this.linearInterpolation(gray, 0.75, 1, 255, 255)
					g = this.linearInterpolation(gray, 0.75, 1, 255, 0)
				} else if (gray >= 0.5) {
					r = this.linearInterpolation(gray, 0.5, 0.75, 0, 255)
					g = this.linearInterpolation(gray, 0.5, 0.75, 255, 255)
				} else if (gray >= 0.25) {
					g = this.linearInterpolation(gray, 0.25, 0.5, 0, 255)
					b = this.linearInterpolation(gray, 0.25, 0.5, 255, 0)
				} else {
					b = this.linearInterpolation(gray, 0, 0.25, 0, 255)
				}
				cl.push(r, g, b, a)
			}
		}

		const imageData = context.getImageData(0, 0, this.width, this.height)
		const pixelData = imageData.data
		for (let i = 0; i < cl.length; i++) {
			pixelData[i * 4 + 0] = cl[i * 4 + 0]
			pixelData[i * 4 + 1] = cl[i * 4 + 1]
			pixelData[i * 4 + 2] = cl[i * 4 + 2]
			pixelData[i * 4 + 3] = cl[i * 4 + 3] * 255
		}
		context.putImageData(imageData, 0, 0)

		callback(canvas.toDataURL('image/png'), 1000, [
			this.lonS,
			this.latS,
			this.lonE,
			this.latE,
		])

		// this.entity = this.viewer.addEntity({
		// 	id: this.id,
		// 	rectangle: {
		// 		coordinates: Cesium.Rectangle.fromDegrees(
		// 			this.lonS,
		// 			this.latS,
		// 			this.lonE,
		// 			this.latE
		// 		),
		// 		material: new Cesium.ImageMaterialProperty({
		// 			image: canvas.toDataURL('image/png'),
		// 			color: Cesium.Color.WHITE.withAlpha(0.8),
		// 			transparent: 1,
		// 		}),
		// 	},
		// })
		return this.entity
		// return canvas
	}

	remove() {
		this.viewer.entities.remove(this.entity)
	}

	linearInterpolation(x, x1, x2, v1, v2) {
		return (v1 * (x2 - x)) / (x2 - x1) + (v2 * (x - x1)) / (x2 - x1)
	}
}
