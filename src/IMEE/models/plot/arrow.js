import { xp } from './algorithm'
import { deepClone2 } from '../../../common/utilFns'
import Point from './ctrlPoint'

const myXP = xp
export default class Arrow {
	constructor(viewer) {
		this.viewer = viewer

		this.curArrow = null
		this.arrowMap = new Map()
		this.state = 0 // 0-完成绘制 1-开始绘制

		this.pointArray = []
		this.index = 1
		this.callback = null
		this.viewer.addEvent(
			'XIANXING_LEFT_CLICK',
			'LEFT_DOWN',
			res => {
				const position = [res.position.longitude, res.position.latitude]
				this.leftClick(position, res)
			},
			false
		)

		this.viewer.addEvent(
			'XIANXING_MOUSE_MOVE',
			'MOUSE_MOVE',
			res => {
				const position = [res.longitude, res.latitude]
				this.mouseMove(position, res)
			},
			false
		)
	}

	leftClick(position, res) {
		if (this.state === 0) {
			this.pointArray = []
			const arrowId = this.gitId()
			this.curArrow = new MyArrow(arrowId, this.viewer, this.index++)
			this.arrowMap.set(arrowId, this.curArrow)
			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)
			this.curArrow.pointMap.set(id, myPoint)
			this.state = 1
		} else if (this.state === 1) {
			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(
				id,
				position,

				this.viewer
			)
			this.curArrow.pointMap.set(id, myPoint)

			this.state = 0
			this.callback(this.curArrow)
		}
	}

	mouseMove(position, res) {
		if (this.pointArray.length === 1 && this.state === 1) {
			const movingPoints = deepClone2(this.pointArray)
			movingPoints.push(position)
			this.curArrow.update(movingPoints, this.styles)
			// 		} else if (this.state === 2 && this.movePoint) {
			// 			this.movePoint.update(position)
			// 			this.pointArray[this.movePoint.info.index] = position
			// 			this.curArrow.update(this.pointArray, this.styles)
			// 		} else if (this.state === 2 && this.curArrow && this.moveArrowPostion) {
			// 			this.pointArray = this.curArrow.moveAll(this.moveArrowPostion, position)
			// 			this.moveArrowPostion = position
		}
	}

	gitId() {
		return Number(
			new Date().getTime() + '' + Number(Math.random() * 1000).toFixed(0)
		)
	}

	start(callback) {
		this.callback = callback
		this.viewer.changeEvent('XIANXING_LEFT_CLICK', 'LEFT_DOWN', true)
		this.viewer.changeEvent('XIANXING_MOUSE_MOVE', 'MOUSE_MOVE', true)
	}

	stop() {
		this.viewer.changeEvent('XIANXING_LEFT_CLICK', 'LEFT_DOWN', false)
		this.viewer.changeEvent('XIANXING_MOUSE_MOVE', 'MOUSE_MOVE', false)

		this.state = 0
	}

	changeShow(isShow, id) {
		this.viewer.changeEntityShow(id, isShow)
		const curArrow = this.arrowMap.get(id)
		curArrow.pointMap.forEach((value, id) => {
			this.viewer.changeEntityShow(id, isShow)
		})

		curArrow.show = isShow
	}

	remove(id) {
		if (this.arrowMap.has(id)) {
			this.viewer.removeEntity(id)
			this.arrowMap.get(id).pointMap.forEach((value, id) => {
				this.viewer.removeEntity(id)
			})
			this.arrowMap.delete(id)
		}
	}
}

class MyArrow {
	constructor(id, viewer, index) {
		this.id = id
		this.viewer = viewer
		this.pointMap = new Map() // 控制点们

		this.type = 'XIANXING'
		this.name = '线型箭头' + index
		this.show = true
		this.myPoint = [[]]
		this.width = 5

		this.switchState(true)
	}

	switchState(isDraw) {
		this.viewer.removeEntity(this.id)
		if (isDraw) {
			this.polygon = {
				hierarchy: new Cesium.CallbackProperty(() => {
					return new Cesium.PolygonHierarchy(
						this._drawArrow(this.myPoint, this.width)
					)
				}, false),
				material: Cesium.Color.RED,
				height: 10,
				closeTop: false,
				closeBottom: false,
			}
		} else {
			this.polygon = {
				hierarchy: new Cesium.PolygonHierarchy(
					this._drawArrow(this.myPoint, this.width)
				),
				material: Cesium.Color.RED,
				height: 10,
				closeTop: false,
				closeBottom: false,
			}
		}

		this.viewer.addEntity(this)
	}

	update(postion) {
		this.myPoint = postion
	}

	_drawArrow(pointArray, width) {
		const res = myXP.algorithm.fineArrow(
			pointArray[0],
			pointArray[pointArray.length - 1],
			width
		)
		return res
	}
}
