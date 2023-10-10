/*
 * @Descripttion:
 * @Author: wsf
 * @Date: 2021-08-19 10:10:34
 * @LastEditTime: 2021-08-19 13:32:03
 */
import pointPic from '../../../static/地球服务-切图_slices/点2.png'

export default class MapPoint {
	constructor(viewer) {
		this.viewer = viewer

		this.pointMap = new Map()
		this.position = [] // 当前的位置
		this.callback = null
		this.index = 1
		this.viewer.addEvent(
			'DIAN_LEFT_CLICK',
			'LEFT_DOWN',
			res => {
				this.position = [res.position.longitude, res.position.latitude]
				this.leftClick(this.position, res)
			},
			false
		)
	}

	leftClick(position, res) {
		const id = this.gitId()
		const curPoint = new Point(id, position, this.viewer, this.index++)

		this.pointMap.set(id, curPoint)
		this.callback(curPoint)
	}

	gitId() {
		return Number(
			new Date().getTime() + '' + Number(Math.random() * 1000).toFixed(0)
		)
	}

	start(callback) {
		this.callback = callback
		this.viewer.changeEvent('DIAN_LEFT_CLICK', 'LEFT_DOWN', true)
	}

	stop() {
		this.viewer.changeEvent('DIAN_LEFT_CLICK', 'LEFT_DOWN', false)
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

class Point {
	constructor(id, postion, viewer, index) {
		this.viewer = viewer
		this.id = id
		this.type = 'DIAN'
		this.name = '点' + index
		this.show = true
		this.position = Cesium.Cartesian3.fromDegrees(postion[0], postion[1])
		this.billboard = {
			image: pointPic,
			width: 18,
			height: 28,
		}

		this.label = {
			text: this.name,
			font: '16px sans-serif',
			horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平位置
			pixelOffset: new Cesium.Cartesian2(0, 16),
		}

		this.viewer.addEntity(this)
	}
}
