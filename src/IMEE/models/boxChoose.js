/* eslint-disable lines-between-class-members */
function _createId() {
	return Math.random() + ''
}

export default class BoxChoose {
	constructor(viewer) {
		this.viewer = viewer
		this.state = 0 // 0:暂停中（完全没有开启） 1开始中（已经锁屏了） 2绘画中  3编辑中  4控制点移动中

		this.objMap = new Map() //  存放所有的框选对象

		this.curCtrlObj = null // 当前正在编辑的矩形对象
		this.curCtrlObjPointIndex = null // 当前正在操作的矩形对象  的控制点  的索引
		this.objId = null // 当前正在操作的矩形对象id
		this.cb = null
		this.viewer.addEvent('LEFT_DOWN', 'LEFT_DOWN', r => {
			if (r.pickObj.id?._info === 'ctrlPoint') {
				if (!this.curCtrlObj) {
					this.curCtrlObj = this.objMap.get(r.pickObj.id?._parId)
				}

				this.curCtrlObjPointIndex = r.pickObj.id?._index
				this.state = 4
				return
			}

			if (this.state === 0) {
				return
			}

			if (this.curCtrlObj && this.state === 3) {
				this.objMap.delete(this.objId)
				this.curCtrlObj.destroy()
				this.curCtrlObj = null // 当前正在操作的矩形对象
				this.curCtrlObjPointIndex = null // 当前正在操作的矩形对象  的控制点  的索引
				this.objId = null // 当前正在操作的矩形对象id
			}

			this.objId = _createId()
			this.curCtrlObj = new Rectangle(this.viewer, this.objId)
			this.curCtrlObj.addPoint(r.position.longitude, r.position.latitude)
			this.objMap.set(this.objId, this.curCtrlObj)
			this.state = 2
		})

		this.viewer.addEvent('MOUSE_MOVE', 'MOUSE_MOVE', r => {
			const lon = r.position.longitude
			const lat = r.position.latitude
			if (this.state === 4) {
				this.curCtrlObj.update(this.curCtrlObjPointIndex, lon, lat)

				return
			}
			if (this.state === 0 || this.state === 1) {
				return
			}

			if (this.state === 2) {
				this.curCtrlObj.addPoint(lon, lat)
			}
		})

		this.viewer.addEvent('LEFT_UP', 'LEFT_UP', r => {
			if (this.state === 4) {
				this.state = 3
				if (this.cb) {
					this.cb(this.curCtrlObj)
				}
				return
			}

			if (this.state === 0 || this.state === 1) {
				return
			}

			if (this.state === 2) {
				this.curCtrlObj.end()
				this.state = 3

				this.curCtrlObj = this.objMap.get(this.objId)

				if (this.cb) {
					this.cb(this.curCtrlObj)
				}
			}
		})
	}

	// 外部插入一个矩形。需要先调用start
	insert(pointAry) {
		this.objId = _createId()
		this.curCtrlObj = new Rectangle(this.viewer, _createId())
		this.curCtrlObj.addPoint(...pointAry[0])
		this.curCtrlObj.addPoint(...pointAry[2])
		this.curCtrlObj.end()
		this.state = 3
	}

	start(cb) {
		this.setCanOpt(false)
		this.state = 1
		this.cb = cb
	}

	stop() {
		this.setCanOpt(true)
		this.state = 0

		if (this.curCtrlObj) {
			this.curCtrlObj.destroy()
			this.objMap.delete(this.objId)
		}
	}
	save() {
		if (this.state === 3) {
			this.curCtrlObj.save()
			this.curCtrlObj = null // 当前正在操作的矩形对象
			this.curCtrlObjPointIndex = null // 当前正在操作的矩形对象  的控制点  的索引
			this.objId = null // 当前正在操作的矩形对象id
		}
	}

	getInfo() {
		const result = []
		this.objMap.forEach((v, id) => {
			if (id !== this.objId) {
				result.push({
					id: v.id,
					pointAry: v.pointAry,
				})
			}
		})

		return result
	}

	setCanOpt(isCan = true) {
		const scene = this.viewer.scene
		// 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
		scene.screenSpaceCameraController.enableRotate = isCan
		// 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
		scene.screenSpaceCameraController.enableTranslate = isCan
		// 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
		scene.screenSpaceCameraController.enableZoom = isCan
		// 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
		scene.screenSpaceCameraController.enableTilt = isCan
	}

	clear() {
		if (this.state !== 0) {
			this.state = 1
		}

		this.objMap.forEach((v, id) => {
			v.destroy()
		})
	}
}

class Rectangle {
	constructor(viewer, id) {
		this.viewer = viewer
		this.id = id
		this.pointAry = [] // 存4个点  左上角，左下角，右下角，右上角
		this.polygon = {
			id,
			info: 'ctrlRectangle',
			polygon: {
				hierarchy: new Cesium.CallbackProperty(() => {
					return new Cesium.PolygonHierarchy(
						Cesium.Cartesian3.fromDegreesArray(this.pointAry.flat())
					)
				}, false),

				material: Cesium.Color.fromBytes(255, 64, 79, 38),
				outline: true,
				outlineColor: Cesium.Color.fromBytes(255, 64, 79, 255),
				height: 10,
				outlineWidth: 2,
			},
		}

		viewer.addEntity(this.polygon)

		// 4个点  左上角，左下角，右下角，右上角
		this.myPoint = [
			new Point(viewer, 0, id),
			new Point(viewer, 1, id),
			new Point(viewer, 2, id),
			new Point(viewer, 3, id),
		]
	}

	addPoint(lon, lat) {
		if (this.pointAry.length === 0) {
			this.pointAry[0] = [lon, lat]
		} else {
			const pt = this.pointAry[0]

			this.pointAry[1] = [pt[0], lat]
			this.pointAry[2] = [lon, lat]
			this.pointAry[3] = [lon, pt[1]]
		}
	}

	end() {
		if (this.pointAry.length !== 4) {
			return
		}
		const pt1 = this.pointAry[0]
		const pt2 = this.pointAry[2]
		this.myPoint[0].setPt(pt1[0], (pt1[1] + pt2[1]) / 2)
		this.myPoint[1].setPt((pt1[0] + pt2[0]) / 2, pt2[1])
		this.myPoint[2].setPt(pt2[0], (pt1[1] + pt2[1]) / 2)
		this.myPoint[3].setPt((pt1[0] + pt2[0]) / 2, pt1[1])
	}

	// 更改了控制点
	update(index, lon, lat) {
		if (index === 0) {
			const oldPt1 = this.pointAry[0]
			const oldPt2 = this.pointAry[1]

			if (lat > oldPt1[1]) {
				lat = oldPt1[1]
			}

			if (lat < oldPt2[1]) {
				lat = oldPt2[1]
			}
			if (lon > this.myPoint[1].pt[0]) {
				lon = this.myPoint[1].pt[0]
			}
			if (lon > this.myPoint[3].pt[0]) {
				lon = this.myPoint[3].pt[0]
			}

			this.myPoint[0].setPt(lon, lat)

			this.pointAry[0] = [lon, oldPt1[1]]
			this.pointAry[1] = [lon, oldPt2[1]]
		} else if (index === 1) {
			const oldPt1 = this.pointAry[1]
			const oldPt2 = this.pointAry[2]

			if (lon > oldPt2[0]) {
				lon = oldPt2[0]
			}

			if (lon < oldPt1[0]) {
				lon = oldPt1[0]
			}

			if (lat > this.myPoint[0].pt[1]) {
				lat = this.myPoint[0].pt[1]
			}

			if (lat > this.myPoint[2].pt[1]) {
				lat = this.myPoint[2].pt[1]
			}

			this.myPoint[1].setPt(lon, lat)
			this.pointAry[1] = [oldPt1[0], lat]
			this.pointAry[2] = [oldPt2[0], lat]
		} else if (index === 2) {
			const oldPt1 = this.pointAry[2]
			const oldPt2 = this.pointAry[3]

			if (lat > oldPt2[1]) {
				lat = oldPt2[1]
			}

			if (lat < oldPt1[1]) {
				lat = oldPt1[1]
			}

			if (lon < this.myPoint[1].pt[0]) {
				lon = this.myPoint[1].pt[0]
			}
			if (lon < this.myPoint[3].pt[0]) {
				lon = this.myPoint[3].pt[0]
			}

			this.myPoint[2].setPt(lon, lat)
			this.pointAry[2] = [lon, oldPt1[1]]
			this.pointAry[3] = [lon, oldPt2[1]]
		} else if (index === 3) {
			const oldPt1 = this.pointAry[0]
			const oldPt2 = this.pointAry[3]

			if (lon > oldPt2[0]) {
				lon = oldPt2[0]
			}

			if (lon < oldPt1[0]) {
				lon = oldPt1[0]
			}

			if (lat < this.myPoint[0].pt[1]) {
				lat = this.myPoint[0].pt[1]
			}

			if (lat < this.myPoint[2].pt[1]) {
				lat = this.myPoint[2].pt[1]
			}

			this.myPoint[3].setPt(lon, lat)
			this.pointAry[0] = [oldPt1[0], lat]
			this.pointAry[3] = [oldPt2[0], lat]
		}
	}

	destroy() {
		this.viewer.removeEntity(this.id)
		for (let index = 0; index < this.myPoint.length; index++) {
			const element = this.myPoint[index]
			element.destroy()
		}
	}

	save() {
		for (let index = 0; index < this.myPoint.length; index++) {
			const element = this.myPoint[index]
			element.changeShow(false)
		}
	}
}

class Point {
	constructor(viewer, index, parId) {
		this.viewer = viewer
		this.pt = []
		this.id = _createId()
		this.point = {
			info: 'ctrlPoint',
			index,
			parId,
			id: this.id,
			position: new Cesium.CallbackProperty(() => {
				return Cesium.Cartesian3.fromDegrees(...this.pt, 11)
			}, false),
			point: {
				pixelSize: 10,
				color: Cesium.Color.WHITE,
				outline: true,
				outlineColor: Cesium.Color.fromBytes(255, 64, 79, 255),
				outlineWidth: 2,
			},
		}
		viewer.addEntity(this.point)
	}

	setPt(lon, lat) {
		this.pt = [lon, lat]
	}

	changeShow(isShow) {
		this.viewer.changeEntityShow(this.id, isShow)
	}

	destroy() {
		this.viewer.removeEntity(this.id)
	}
}
