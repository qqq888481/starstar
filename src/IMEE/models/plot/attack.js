import { xp } from './algorithm'
import { deepClone2 } from '../../../common/utilFns'
import Point from './ctrlPoint'

const myXP = xp
export default class Attack {
	constructor(viewer) {
		this.viewer = viewer
		this.curAttack = null
		this.attackMap = new Map()
		this.state = 0 // 0-完成绘制 1-开始绘制

		this.pointArray = []
		this.index = 1
		this.callback = null

		this.viewer.addEvent(
			'YANWEI_LEFT_CLICK',
			'LEFT_DOWN',
			res => {
				const position = [res.position.longitude, res.position.latitude]
				this.leftClick(position, res)
			},
			false
		)

		this.viewer.addEvent(
			'YANWEI_MOUSE_MOVE',
			'MOUSE_MOVE',
			res => {
				const position = [res.longitude, res.latitude]
				this.mouseMove(position, res)
			},
			false
		)

		this.viewer.addEvent(
			'YANWEI_RIGHT_CLICK',
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
			const arrowId = this.gitId()
			this.curAttack = new Arrow(arrowId, this.viewer, this.index++)
			this.attackMap.set(arrowId, this.curAttack)
			this.pointArray.push(position)

			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)
			this.curAttack.pointMap.set(id, myPoint)
			this.state = 1
		} else if (this.state === 1) {
			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)
			this.curAttack.pointMap.set(id, myPoint)
		}
	}

	mouseMove(position, res) {
		if (this.pointArray.length >= 2 && this.state === 1) {
			const movingPoints = deepClone2(this.pointArray)
			movingPoints.push(position)
			this.curAttack.update(movingPoints)
		}
	}

	rightClick(position, res) {
		if (this.state === 1) {
			this.pointArray.push(position)
			const id = this.gitId()
			const myPoint = new Point(id, position, this.viewer)
			this.curAttack.pointMap.set(id, myPoint)
			this.state = 0
			this.callback(this.curAttack)
		}
	}

	gitId() {
		return Number(
			new Date().getTime() + '' + Number(Math.random() * 1000).toFixed(0)
		)
	}

	start(callback) {
		this.callback = callback
		this.viewer.changeEvent('YANWEI_LEFT_CLICK', 'LEFT_DOWN', true)
		this.viewer.changeEvent('YANWEI_MOUSE_MOVE', 'MOUSE_MOVE', true)
		this.viewer.changeEvent('YANWEI_RIGHT_CLICK', 'RIGHT_CLICK', true)
	}

	stop() {
		this.viewer.changeEvent('YANWEI_LEFT_CLICK', 'LEFT_DOWN', false)
		this.viewer.changeEvent('YANWEI_MOUSE_MOVE', 'MOUSE_MOVE', false)
		this.viewer.changeEvent('YANWEI_RIGHT_CLICK', 'RIGHT_CLICK', false)

		this.state = 0
	}

	changeShow(isShow, id) {
		this.viewer.changeEntityShow(id, isShow)
		const curAttack = this.attackMap.get(id)
		curAttack.pointMap.forEach((value, id) => {
			this.viewer.changeEntityShow(id, isShow)
		})

		curAttack.show = isShow
	}

	remove(id) {
		if (this.attackMap.has(id)) {
			this.viewer.removeEntity(id)

			this.attackMap.get(id).pointMap.forEach((value, id) => {
				this.viewer.removeEntity(id)
			})
			this.attackMap.delete(id)
		}
	}
}

class Arrow {
	constructor(id, viewer, index) {
		this.id = id
		this.viewer = viewer
		this.pointMap = new Map() // 控制点们

		this.type = 'YANWEI'
		this.name = '燕尾箭头' + index
		this.show = true
		this.myPoint = []

		this.switchState(true)
	}

	switchState(isDraw) {
		this.viewer.removeEntity(this.id)
		if (isDraw) {
			this.polygon = {
				hierarchy: new Cesium.CallbackProperty(() => {
					return new Cesium.PolygonHierarchy(this._drawYanWei(this.myPoint))
				}, false),
				material: Cesium.Color.RED,
				height: 10,
				closeTop: false,
				closeBottom: false,
			}
		} else {
			this.polygon = {
				hierarchy: new Cesium.PolygonHierarchy(this._drawYanWei(this.myPoint)),
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

	_drawYanWei(pointArray) {
		const res = myXP.algorithm.tailedAttackArrow(pointArray)

		return res.polygonalPoint
	}
}
