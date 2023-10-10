import { deepClone2 } from '../../../common/utilFns'
import Point from './ctrlPoint'

export default class MapPolygon {
	constructor(viewer) {
		this.viewer = viewer
		this.state = 0 // 0-完成绘制 1-开始绘制
		this.callback = null
		this.index = 1
		this.pointArray = []
		this.curPolygon = null
		this.polygonMap = new Map()

		this.viewer.addEvent(
			'Polygon_LEFT_CLICK',
			'LEFT_DOWN',
			res => {
				const position = [res.position.longitude, res.position.latitude]
				this.leftClick(position, res)
			},
			false
		)

		this.viewer.addEvent(
			'Polygon_MOUSE_MOVE',
			'MOUSE_MOVE',
			res => {
				const position = [res.longitude, res.latitude]
				this.mouseMove(position, res)
			},
			false
		)

		this.viewer.addEvent(
			'Polygon_RIGHT_CLICK',
			'RIGHT_CLICK',
			res => {
				const position = [res.position.longitude, res.position.latitude]
				this.rightClick(position, res)
			},
			false
		)
	}

	leftClick(position, res) {
		if (this.state === 0) {
			this.pointArray = []
			const polygonId = this.gitId()
			this.curPolygon = new MyPolygon(polygonId, this.viewer, this.index++)
			this.polygonMap.set(polygonId, this.curPolygon)

			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)
			this.curPolygon.pointMap.set(id, myPoint)
			this.state = 1
		} else if (this.state === 1) {
			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)
			this.curPolygon.pointMap.set(id, myPoint)
		}
	}

	mouseMove(position, res) {
		if (this.state === 1 && this.pointArray.length >= 2) {
			const temporAry = deepClone2(this.pointArray)
			temporAry.push(position)
			this.curPolygon.update(temporAry, this.styles)
		}
	}

	rightClick(position, res) {
		if (this.state === 1) {
			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)
			this.curPolygon.pointMap.set(id, myPoint)
			this.state = 0
			this.callback(this.curPolygon)
		}
	}

	gitId() {
		return Number(
			new Date().getTime() + '' + Number(Math.random() * 1000).toFixed(0)
		)
	}

	start(callback) {
		this.callback = callback
		this.viewer.changeEvent('Polygon_LEFT_CLICK', 'LEFT_DOWN', true)
		this.viewer.changeEvent('Polygon_MOUSE_MOVE', 'MOUSE_MOVE', true)
		this.viewer.changeEvent('Polygon_RIGHT_CLICK', 'RIGHT_CLICK', true)
	}

	stop() {
		this.viewer.changeEvent('Polygon_LEFT_CLICK', 'LEFT_DOWN', false)
		this.viewer.changeEvent('Polygon_MOUSE_MOVE', 'MOUSE_MOVE', false)
		this.viewer.changeEvent('Polygon_RIGHT_CLICK', 'RIGHT_CLICK', false)
		this.state = 0
	}

	changeShow(isShow, id) {
		this.viewer.changeEntityShow(id, isShow)

		const curPolygon = this.polygonMap.get(id)
		curPolygon.pointMap.forEach((value, id) => {
			this.viewer.changeEntityShow(id, isShow)
		})

		curPolygon.show = isShow
	}

	remove(id) {
		if (this.polygonMap.has(id)) {
			this.viewer.removeEntity(id)
			this.polygonMap.get(id).pointMap.forEach((value, id) => {
				this.viewer.removeEntity(id)
			})
			this.polygonMap.delete(id)
		}
	}
}

class MyPolygon {
	constructor(id, viewer, index) {
		this.id = id
		this.viewer = viewer
		this.pointMap = new Map() // 控制点们

		this.type = 'DUOBIANXING'
		this.name = '多边型' + index
		this.show = true
		this.pointArray = [
			[0, 0],
			[0, 0],
		]

		this.switchState(true)
	}

	switchState(isDraw) {
		this.viewer.removeEntity(this.id)
		if (isDraw) {
			this.polygon = {
				hierarchy: new Cesium.CallbackProperty(() => {
					return new Cesium.PolygonHierarchy(
						Cesium.Cartesian3.fromDegreesArray(this.pointArray.flat())
					)
				}, false),
				material: Cesium.Color.RED,
				outlineColor: Cesium.Color.RED,
				outlineWidth: 10,
				outline: true,
				height: 10,
			}
		} else {
			this.polygon = {
				hierarchy: new Cesium.PolygonHierarchy(
					Cesium.Cartesian3.fromDegreesArray(this.pointArray.flat())
				),
				material: Cesium.Color.RED,
				outlineColor: Cesium.Color.RED,
				outlineWidth: 10,
				outline: true,
				height: 10,
			}
		}

		this.viewer.addEntity(this)
	}

	update(postion) {
		this.pointArray = postion
	}
}
