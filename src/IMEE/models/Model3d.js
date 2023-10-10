export default class Model3d {
	constructor(viewer, name) {
		this.viewer = viewer
		viewer.scene.globe.enableLighting = true
	}

	add(position, url, maximumScale = 5, id, heading = 0, info) {
		const viewer = this.viewer
		const height = 0
		const minimumPixelSize = 5000

		const scene = viewer.scene
		var hpr = new Cesium.HeadingPitchRoll(
			Cesium.Math.toRadians(heading),
			0.0,
			0.0
		)

		var origin = Cesium.Cartesian3.fromDegrees(position[0], position[1], height)
		var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
			origin,
			hpr
		)

		scene.primitives.add(
			Cesium.Model.fromGltf({
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
				scene: scene,
				url: url,
				modelMatrix: modelMatrix,
				minimumPixelSize: minimumPixelSize,
				maximumScale: maximumScale,
				scaleByDistance: new Cesium.NearFarScalar(1e2, 1, 1e5, 0),
			})
		)

		info &&
			viewer.entities.add({
				position: Cesium.Cartesian3.fromDegrees(
					position[0],
					position[1],
					height + info.height
				),
				label: {
					text: info.name,
					font: '16px Helvetica',
					fillColor: Cesium.Color.SKYBLUE,
					outlineColor: Cesium.Color.BLACK,
					outlineWidth: 2,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					// heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
					scaleByDistance: new Cesium.NearFarScalar(1e2, 1, 1e5, 0),
				},
			})
	}
	changeShow(show) {}

	remove() {}
}
