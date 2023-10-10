import Util from './util'
import DataProcess from './dataProcess'
import ParticleSystem from './particleSystem'

const particlesTextureSize = 16
const panel = {
	dropRate: 0.003,
	dropRateBump: 0.01,
	fadeOpacity: 0.996,
	lineWidth: 4,
	particleHeight: 100,
	speedFactor: 1,
	particlesTextureSize: particlesTextureSize,
	maxParticles: particlesTextureSize * particlesTextureSize,
}

// 使用GPU绘制的风场
// 只适用于三维。数据不是全球的时候，粒子出口会超出边界范围
export default class Wind3D {
	constructor(viewer) {
		this.viewer = viewer
		this.scene = this.viewer.scene
		this.camera = this.viewer.camera

		this.panel = panel

		this.viewerParameters = {
			lonRange: new Cesium.Cartesian2(),
			latRange: new Cesium.Cartesian2(),
			pixelSize: 0.0,
		}
		// use a smaller earth radius to make sure distance to camera > 0
		this.globeBoundingSphere = new Cesium.BoundingSphere(
			Cesium.Cartesian3.ZERO,
			0.99 * 6378137.0
		)

		this.bound = []
		this.isShow = true
		this.primitivesAry = []
	}

	loadDataInfo(data) {
		const processedData = DataProcess.loadData(data)
		this.bound = [
			processedData.lon.min,
			processedData.lon.max,
			processedData.lat.min,
			processedData.lat.max,
		]
		this.updateViewerParameters()
		this.particleSystem = new ParticleSystem(
			this.scene.context,
			processedData,
			this.panel,
			this.viewerParameters
		)
		this.addPrimitives()

		this.setupEventListeners()
		this.isShow = true
	}

	addPrimitives() {
		this.primitivesAry.push(
			this.scene.primitives.add(
				this.particleSystem.particlesComputing.primitives.calculateSpeed
			)
		)
		this.primitivesAry.push(
			this.scene.primitives.add(
				this.particleSystem.particlesComputing.primitives.updatePosition
			)
		)
		this.primitivesAry.push(
			this.scene.primitives.add(
				this.particleSystem.particlesComputing.primitives.postProcessingPosition
			)
		)
		this.primitivesAry.push(
			this.scene.primitives.add(
				this.particleSystem.particlesRendering.primitives.segments
			)
		)
		this.primitivesAry.push(
			this.scene.primitives.add(
				this.particleSystem.particlesRendering.primitives.trails
			)
		)
		this.primitivesAry.push(
			this.scene.primitives.add(
				this.particleSystem.particlesRendering.primitives.screen
			)
		)
	}

	updateViewerParameters() {
		var viewRectangle = this.camera.computeViewRectangle(
			this.scene.globe.ellipsoid
		)

		var lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle)

		// this.viewerParameters.lonRange.x = this.bound[0]
		// this.viewerParameters.lonRange.y = this.bound[1]
		// this.viewerParameters.latRange.x = this.bound[2]
		// this.viewerParameters.latRange.y = this.bound[3]
		this.viewerParameters.lonRange.x = Math.max(
			this.bound[0],
			lonLatRange.lon.min
		)
		this.viewerParameters.lonRange.y = Math.min(
			this.bound[1],
			lonLatRange.lon.max
		)
		this.viewerParameters.latRange.x = Math.max(
			this.bound[2],
			lonLatRange.lat.min
		)
		this.viewerParameters.latRange.y = Math.min(
			this.bound[3],
			lonLatRange.lat.max
		)

		var pixelSize = this.camera.getPixelSize(
			this.globeBoundingSphere,
			this.scene.drawingBufferWidth,
			this.scene.drawingBufferHeight
		)

		if (pixelSize > 0) {
			this.viewerParameters.pixelSize = pixelSize
		}
	}

	changeShow(isShow, needChange = true) {
		if (this.primitivesAry.length > 0 && needChange) {
			this.isShow = isShow
		}
		for (let index = 0; index < this.primitivesAry.length; index++) {
			this.primitivesAry[index].show = isShow
		}
	}

	remove() {
		for (let index = 0; index < this.primitivesAry.length; index++) {
			this.scene.primitives.remove(this.primitivesAry[index])
		}
		this.primitivesAry = []
	}

	setupEventListeners() {
		const that = this

		this.camera.moveStart.addEventListener(function () {
			if (!that.isShow) {
				return
			}
			// that.scene.primitives.show = false
			that.changeShow(false, false)
		})

		this.camera.moveEnd.addEventListener(function () {
			if (!that.isShow) {
				return
			}
			that.updateViewerParameters()
			that.particleSystem.applyViewerParameters(that.viewerParameters)
			// that.scene.primitives.show = true
			that.changeShow(true, false)
		})

		var resized = false
		window.addEventListener('resize', function () {
			if (!that.isShow) {
				return
			}
			resized = true
			that.remove()

			// that.scene.primitives.show = false
			// that.scene.primitives.removeAll()
		})

		this.scene.preRender.addEventListener(function () {
			if (!that.isShow) {
				return
			}
			if (resized) {
				that.particleSystem.canvasResize(that.scene.context)
				resized = false
				that.addPrimitives()
				// that.scene.primitives.show = true
				that.changeShow(true, false)
			}
		})

		// window.addEventListener('particleSystemOptionsChanged', function () {
		// 	that.particleSystem.applyUserInput(that.panel.getUserInput())
		// })
		// window.addEventListener('layerOptionsChanged', function () {
		// 	that.setGlobeLayer(that.panel.getUserInput())
		// })
	}
}
