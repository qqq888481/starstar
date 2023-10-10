/*
 * @Descripttion:
 * @Author: wsf
 * @Date: 2021-08-19 10:10:34
 * @LastEditTime: 2021-08-19 15:31:35
 */
// import { eventEnum } from '../../enum/event_enum'
// import { Cartesian3, CallbackProperty, LabelStyle } from 'cesium'
// import PriColor from '../../entities/priColor'

export default class MapText {
	constructor(viewer) {
		this.viewer = viewer

		this.pointMap = new Map()
		this.position = null // 当前的位置
		this.callback = null
		this.prevFn = null
		this.index = 1

		this.viewer.addEvent(
			'TEXT_LEFT_CLICK',
			'LEFT_DOWN',
			res => {
				this.position = [res.position.longitude, res.position.latitude]
				this.leftClick(this.position, res)
			},
			false
		)
	}

	leftClick(position, res) {
		this.position = position
		this.prevFn()
	}

	drawText(drawInput) {
		const id = this.gitId()
		const curPoint = new Text(
			id,
			this.position,
			this.viewer,
			this.index++,
			drawInput
		)
		this.pointMap.set(id, curPoint)

		this.callback(curPoint)
	}

	gitId() {
		return Number(
			new Date().getTime() + '' + Number(Math.random() * 1000).toFixed(0)
		)
	}

	start(callback, prevFn) {
		this.callback = callback
		this.prevFn = prevFn
		this.viewer.changeEvent('TEXT_LEFT_CLICK', 'LEFT_DOWN', true)
	}

	stop() {
		this.viewer.changeEvent('TEXT_LEFT_CLICK', 'LEFT_DOWN', false)
	}

	changeShow(isShow, id) {
		this.viewer.changeEntityShow(id, isShow)
		this.pointMap.get(id).show = isShow
	}

	remove(id) {
		if (this.pointMap.has(id)) {
			this.viewer.removeEntity(id)
			this.pointMap.delete(id)
		}
	}
}

class Text {
	constructor(id, postion, viewer, index, drawInput) {
		this.viewer = viewer
		this.id = id
		this.type = 'WENZI'
		this.name = '文字' + index
		this.show = true

		this.position = Cesium.Cartesian3.fromDegrees(postion[0], postion[1])
		this.label = {
			text: drawInput,
			font: '16px sans-serif',
			horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平位置
			pixelOffset: new Cesium.Cartesian2(0, 16),
		}

		this.viewer.addEntity(this)
	}
}
