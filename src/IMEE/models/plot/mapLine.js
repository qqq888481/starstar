import { deepClone2 } from '../../../common/utilFns'
import Point from './ctrlPoint'

export default class MapLine {
	constructor(viewer) {
		this.viewer = viewer
		this.state = 0 // 0-完成绘制、待绘制 1-开始绘制中
		this.pointArray = []
		this.lineMap = new Map()
		this.index = 1
		this.callback = null
		this.viewer.addEvent(
			'Line_LEFT_CLICK',
			'LEFT_DOWN',
			res => {
				const position = [res.position.longitude, res.position.latitude]

				this.leftClick(position, res)
			},
			false
		)

		this.viewer.addEvent(
			'Line_MOUSE_MOVE',
			'MOUSE_MOVE',
			res => {
				const position = [res.longitude, res.latitude]

				this.mouseMove(position, res)
			},
			false
		)

		this.viewer.addEvent(
			'Line_RIGHT_CLICK',
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
			const lineId = this.gitId()
			this.curLine = new MyLine(lineId, this.viewer, this.index++)

			this.lineMap.set(lineId, this.curLine)
			this.pointArray.push(position)

			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)

			this.curLine.pointMap.set(id, myPoint)
			this.state = 1
		} else if (this.state === 1) {
			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)

			this.curLine.pointMap.set(id, myPoint)
		}
	}

	mouseMove(position, res) {
		if (this.state === 1) {
			const temporAry = deepClone2(this.pointArray)
			temporAry.push(position)
			this.curLine.update(temporAry)
		}
	}

	rightClick(position, res) {
		if (this.state === 1) {
			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)
			this.curLine.pointMap.set(id, myPoint)
			this.curLine.switchState(false)
			this.state = 0
			this.callback(this.curLine)
		}
	}

	gitId() {
		return Number(
			new Date().getTime() + '' + Number(Math.random() * 1000).toFixed(0)
		)
	}

	start(callback) {
		this.callback = callback
		this.viewer.changeEvent('Line_LEFT_CLICK', 'LEFT_DOWN', true)
		this.viewer.changeEvent('Line_MOUSE_MOVE', 'MOUSE_MOVE', true)
		this.viewer.changeEvent('Line_RIGHT_CLICK', 'RIGHT_CLICK', true)
	}

	stop() {
		this.viewer.changeEvent('Line_LEFT_CLICK', 'LEFT_DOWN', false)
		this.viewer.changeEvent('Line_MOUSE_MOVE', 'MOUSE_MOVE', false)
		this.viewer.changeEvent('Line_RIGHT_CLICK', 'RIGHT_CLICK', false)
		this.state = 0
	}

	changeShow(isShow, id) {
		this.viewer.changeEntityShow(id, isShow)

		const curLine = this.lineMap.get(id)
		curLine.pointMap.forEach((value, id) => {
			this.viewer.changeEntityShow(id, isShow)
		})

		curLine.show = isShow
	}

	remove(id) {
		if (this.lineMap.has(id)) {
			this.viewer.removeEntity(id)
			this.lineMap.get(id).pointMap.forEach((value, id) => {
				this.viewer.removeEntity(id)
			})
			this.lineMap.delete(id)
		}
	}
}

class MyLine {
	constructor(id, viewer, index) {
		this.id = id
		this.viewer = viewer
		this.pointMap = new Map() // 控制点们

		this.type = 'XIAN'
		this.name = '线' + index
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
			this.polyline = {
				positions: new Cesium.CallbackProperty(() => {
					return Cesium.Cartesian3.fromDegreesArray(this.pointArray.flat())
				}, false),
				material: Cesium.Color.RED,
				width: 5,
				clampToGround: true,
				arcType: Cesium.ArcType.RHUMB,
			}
		} else {
			this.polyline = {
				positions: Cesium.Cartesian3.fromDegreesArray(this.pointArray.flat()),
				material: Cesium.Color.RED,
				width: 5,
				clampToGround: true,
				arcType: Cesium.ArcType.RHUMB,
			}
		}

		this.viewer.addEntity(this)
	}

	update(postion) {
		this.pointArray = postion
	}
}
