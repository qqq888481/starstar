/*
 * @Descripttion:
 * @Author: wsf
 * @Date: 2021-08-19 13:20:42
 * @LastEditTime: 2021-08-19 13:31:25
 */
export default class Point {
	constructor(id, postion, viewer) {
		this.id = id
		this.viewer = viewer

		this.position = Cesium.Cartesian3.fromDegrees(...postion)
		this.point = {
			color: Cesium.Color.SKYBLUE,
			pixelSize: 10,
			outlineColor: Cesium.Color.YELLOW,
			outlineWidth: 2,
		}

		this.viewer.addEntity(this)
	}
}
