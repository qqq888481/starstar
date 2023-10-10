export default class TrailLinkMaterial {
	constructor(viewer, img) {
		this.viewer = viewer
		this.entities = []
		this.initTrailLinkMaterialProperty(img)
	}

	initTrailLinkMaterialProperty(img) {
		function TrailLinkMaterialProperty(color, duration, d) {
			this._definitionChanged = new Cesium.Event()
			this._color = undefined
			this._colorSubscription = undefined
			this.color = color
			this.duration = duration || 3000
			this._time = new Date().getTime()
			this._d = d
			this.isTranslucent = function () {
				return true
			}
		}

		Object.defineProperties(TrailLinkMaterialProperty.prototype, {
			isConstant: {
				get: function () {
					return false
				},
			},
			definitionChanged: {
				get: function () {
					return this._definitionChanged
				},
			},
			color: Cesium.createPropertyDescriptor('color'),
		})

		TrailLinkMaterialProperty.prototype.getType = function (time) {
			return 'TrailLink'
		}

		TrailLinkMaterialProperty.prototype.getType()
		TrailLinkMaterialProperty.prototype.getValue = function (time, result) {
			if (!Cesium.defined(result)) {
				result = {}
			}

			result.color = Cesium.Property.getValueOrClonedDefault(
				this._color,
				time,
				Cesium.Color.WHITE,
				result.color
			)
			result.image = Cesium.Material.TrailLinkImage
			result.time =
				(((new Date().getTime() - this._time) % this.duration) /
					this.duration) *
				this._d
			return result
		}
		TrailLinkMaterialProperty.prototype.equals = function (other) {
			return (
				this === other
				// ||
				// (other instanceof TrailLinkMaterialProperty
				//     && Property.equals(this._color, other._color)
				// )
			)
		}

		Cesium.TrailLinkMaterialProperty = TrailLinkMaterialProperty
		Cesium.Material.TrailLinkType = 'TrailLink'
		Cesium.Material.TrailLinkImage = img
		Cesium.Material.TrailLinkSource = `czm_material czm_getMaterial(czm_materialInput materialInput)\n\
            {\n\
                czm_material material = czm_getDefaultMaterial(materialInput);\n\
                vec2 st = materialInput.st*float(5);\n\
                vec4 colorImage = texture2D(image, vec2(fract (st.s - time), st.t));\n\
                material.alpha = colorImage.a*color.a;\n\
                material.diffuse = color.rgb;\n\
                return material;\n\
            }`
		Cesium.Material._materialCache.addMaterial(Cesium.Material.TrailLinkType, {
			fabric: {
				type: Cesium.Material.TrailLinkType,
				uniforms: {
					color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
					image: Cesium.Material.TrailLinkImage,
					time: 0,
				},
				source: Cesium.Material.TrailLinkSource,
			},
			translucent: function (material) {
				return true
			},
		})
	}

	add(positions, color) {
		this.entities.push(
			this.viewer.entities.add({
				polyline: {
					positions: Cesium.Cartesian3.fromDegreesArray(positions),
					width: 10,
					clampToGround: true, // 贴地
					material: new Cesium.TrailLinkMaterialProperty(
						Cesium.Color.fromBytes(...color),
						2000,
						1
					),
				},
			})
		)
	}

	changeShow(isShow) {
		for (let index = 0; index < this.entities.length; index++) {
			const element = this.entities[index]
			element.show = isShow
		}
	}

	destroy() {
		for (let index = 0; index < this.entities.length; index++) {
			const element = this.entities[index]
			this.viewer.entities.remove(element)
		}
	}
}
