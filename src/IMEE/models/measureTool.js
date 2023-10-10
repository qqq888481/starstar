const {
	ScreenSpaceEventHandler,
	ScreenSpaceEventType,
	Cartesian2,
	Color,
	Cartographic,
	VerticalOrigin,
	LabelStyle,
	CallbackProperty,
	EllipsoidGeodesic,
	HeightReference,
} = Cesium
const Cdefined = Cesium.defined
const CMath = Cesium.Math

/* 测量距离 */
export default class MeasureTool {
	constructor(viewer) {
		this.viewer = viewer
		// this.dataSource = []
		// this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas) // 鼠标事件
		this.handler = new ScreenSpaceEventHandler(
			this.viewer.scene._imageryLayerCollection
		)
		this.viewer.scene.globe.depthTestAgainstTerrain = false
		this.entitiesIdAry = []
		this.pointIdIndex = 0
	}

	measureLineSpace() {
		const _this = this
		// 取消双击事件-追踪该位置
		// _this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK)

		// _this.handler = new ScreenSpaceEventHandler(_this.viewer.scene._imageryLayerCollection)

		// var tooltip = document.getElementById("toolTip");
		// tooltip.style.display = "block";
		var positions = []
		var poly = null
		var distance = 0
		var cartesian = null
		var floatingPoint

		_this.handler.setInputAction(function (movement) {
			// tooltip.style.left = movement.endPosition.x + 3 + "px";
			// tooltip.style.top = movement.endPosition.y - 25 + "px";
			// tooltip.innerHTML = '<p>单击开始，右击结束</p>';
			// cartesian = viewer.scene.pickPosition(movement.endPosition);
			const ray = _this.viewer.camera.getPickRay(movement.endPosition)
			cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene)

			if (!cartesian) {
				return
			}
			// cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
			if (positions.length >= 2) {
				if (!Cdefined(poly)) {
					poly = new PolyLinePrimitive(positions)
				} else {
					positions.pop()
					// cartesian.y += (1 + Math.random());
					positions.push(cartesian)
				}
				distance = _this.getSpaceDistance(positions)
				// tooltip.innerHTML='<p>'+distance+'米</p>';
			}
		}, ScreenSpaceEventType.MOUSE_MOVE)
		const arr = []
		_this.handler.setInputAction(function (movement) {
			// tooltip.style.display = "none";
			// cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
			// cartesian = viewer.scene.pickPosition(movement.position);
			const ray = _this.viewer.camera.getPickRay(movement.position)
			cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene)

			if (!cartesian) {
				return
			}
			if (positions.length === 0) {
				positions.push(cartesian.clone())
			}
			var ellipsoid = _this.viewer.scene.globe.ellipsoid
			var cartographic = ellipsoid.cartesianToCartographic(cartesian)
			var lat = CMath.toDegrees(cartographic.latitude)
			var lng = CMath.toDegrees(cartographic.longitude)
			var alt = cartographic.height
			arr.push(lng)
			arr.push(lat)
			arr.push(alt)
			positions.push(cartesian)

			// 在三维场景中添加Label
			//   var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
			var textDisance = distance + '米'
			floatingPoint = _this.viewer.addEntity({
				id: 'point' + _this.pointIdIndex,
				name: '空间直线距离',
				// position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
				position: positions[positions.length - 1],
				point: {
					pixelSize: 5,
					color: Color.RED,
					outlineColor: Color.WHITE,
					outlineWidth: 2,
				},
				label: {
					text: textDisance,
					font: '18px sans-serif',
					fillColor: Color.GOLD,
					style: LabelStyle.FILL_AND_OUTLINE,
					outlineWidth: 2,
					verticalOrigin: VerticalOrigin.BOTTOM,
					pixelOffset: new Cartesian2(20, -20),
				},
			})
			_this.entitiesIdAry.push('point' + _this.pointIdIndex)
			_this.pointIdIndex++
		}, ScreenSpaceEventType.LEFT_CLICK)

		_this.handler.setInputAction(function (movement) {
			_this.handler.destroy() // 关闭事件句柄
			_this.handler = new ScreenSpaceEventHandler(
				_this.viewer.scene._imageryLayerCollection
			)
			positions.pop() // 最后一个点无效
			// viewer.entities.remove(floatingPoint);
			// tooltip.style.display = "none";
		}, ScreenSpaceEventType.RIGHT_CLICK)

		var PolyLinePrimitive = (function () {
			function _(positions) {
				this.options = {
					id: 'meaLine' + _this.pointIdIndex,
					name: '直线',
					polyline: {
						show: true,
						positions: [],
						material: Color.CHARTREUSE,
						width: 5,
						clampToGround: true,
					},
				}
				_this.entitiesIdAry.push('meaLine' + _this.pointIdIndex)
				_this.pointIdIndex++
				this.positions = positions
				this._init()
			}

			_.prototype._init = function () {
				var _self = this
				var _update = function () {
					return _self.positions
				}
				// 实时更新polyline.positions
				this.options.polyline.positions = new CallbackProperty(_update, false)
				_this.viewer.addEntity(this.options)
			}

			return _
		})()
	}

	// 空间两点距离计算函数
	getSpaceDistance(positions) {
		if (!Cartographic) {
			return
		}

		var distance = 0
		for (var i = 0; i < positions.length - 1; i++) {
			var point1cartographic = Cartographic.fromCartesian(positions[i])
			var point2cartographic = Cartographic.fromCartesian(positions[i + 1])

			/** 根据经纬度计算出距离**/
			var geodesic = new EllipsoidGeodesic()
			geodesic.setEndPoints(point1cartographic, point2cartographic)
			var s = geodesic.surfaceDistance
			// 返回两点之间的距离
			s = Math.sqrt(
				Math.pow(s, 2) +
					Math.pow(point2cartographic.height - point1cartographic.height, 2)
			)
			distance = distance + s
		}
		return distance.toFixed(2)
	}

	measureAreaSpace() {
		const _this = this
		// 取消双击事件-追踪该位置
		// _this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK)
		// 鼠标事件
		// _this.handler = new ScreenSpaceEventHandler(_this.viewer.scene._imageryLayerCollection)
		var positions = []
		var tempPoints = []
		var polygon = null
		// var tooltip = document.getElementById("toolTip");
		var cartesian = null
		var floatingPoint // 浮动点
		// tooltip.style.display = "block";

		_this.handler.setInputAction(function (movement) {
			// tooltip.style.left = movement.endPosition.x + 3 + "px";
			// tooltip.style.top = movement.endPosition.y - 25 + "px";
			// tooltip.innerHTML ='<p>单击开始，右击结束</p>';
			// cartesian = viewer.scene.pickPosition(movement.endPosition);
			const ray = _this.viewer.camera.getPickRay(movement.endPosition)
			cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene)

			if (!cartesian) {
				return
			}
			// cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
			if (positions.length >= 2) {
				if (!Cdefined(polygon)) {
					polygon = new PolygonPrimitive(positions)
				} else {
					positions.pop()
					// cartesian.y += (1 + Math.random());
					positions.push(cartesian)
				}
				// tooltip.innerHTML='<p>'+distance+'米</p>';
			}
		}, ScreenSpaceEventType.MOUSE_MOVE)

		_this.handler.setInputAction(function (movement) {
			// tooltip.style.display = "none";
			// cartesian = viewer.scene.pickPosition(movement.position);
			const ray = _this.viewer.camera.getPickRay(movement.position)
			cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene)
			if (!cartesian) {
				return
			}
			// cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
			if (positions.length === 0) {
				positions.push(cartesian.clone())
			}
			// positions.pop();
			positions.push(cartesian)
			// 在三维场景中添加点
			var cartographic = Cartographic.fromCartesian(
				positions[positions.length - 1]
			)
			var longitudeString = CMath.toDegrees(cartographic.longitude)
			var latitudeString = CMath.toDegrees(cartographic.latitude)
			var heightString = cartographic.height
			tempPoints.push({
				lon: longitudeString,
				lat: latitudeString,
				hei: heightString,
			})
			floatingPoint = _this.viewer.addEntity({
				id: 'point' + _this.pointIdIndex,
				name: '多边形面积',
				position: positions[positions.length - 1],
				point: {
					pixelSize: 5,
					color: Color.RED,
					outlineColor: Color.WHITE,
					outlineWidth: 2,
					heightReference: HeightReference.CLAMP_TO_GROUND,
				},
			})
			_this.entitiesIdAry.push('point' + _this.pointIdIndex)
			_this.pointIdIndex++
		}, ScreenSpaceEventType.LEFT_CLICK)

		_this.handler.setInputAction(function (movement) {
			_this.handler.destroy()
			_this.handler = new ScreenSpaceEventHandler(
				_this.viewer.scene._imageryLayerCollection
			)
			positions.pop()
			// tempPoints.pop();
			// viewer.entities.remove(floatingPoint);
			// tooltip.style.display = "none";
			// 在三维场景中添加点
			// var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
			// var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
			// var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
			// var heightString = cartographic.height;
			// tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});

			var textArea = getArea(tempPoints) + '平方公里'
			_this.viewer.addEntity({
				id: 'point' + _this.pointIdIndex,
				name: '多边形面积',
				position: positions[positions.length - 1],
				// point : {
				//  pixelSize : 5,
				//  color : Cesium.Color.RED,
				//  outlineColor : Cesium.Color.WHITE,
				//  outlineWidth : 2,
				//  heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
				// },
				label: {
					text: textArea,
					font: '18px sans-serif',
					fillColor: Color.GOLD,
					style: LabelStyle.FILL_AND_OUTLINE,
					outlineWidth: 2,
					verticalOrigin: VerticalOrigin.BOTTOM,
					pixelOffset: new Cartesian2(20, -40),
					heightReference: HeightReference.CLAMP_TO_GROUND,
				},
			})
			_this.entitiesIdAry.push('point' + _this.pointIdIndex)
			_this.pointIdIndex++
		}, ScreenSpaceEventType.RIGHT_CLICK)

		var radiansPerDegree = Math.PI / 180.0 // 角度转化为弧度(rad)
		var degreesPerRadian = 180.0 / Math.PI // 弧度转化为角度

		// 计算多边形面积
		function getArea(points) {
			var res = 0
			// 拆分三角曲面

			for (var i = 0; i < points.length - 2; i++) {
				var j = (i + 1) % points.length
				var k = (i + 2) % points.length
				var totalAngle = Angle(points[i], points[j], points[k])

				var dis_temp1 = distance(positions[i], positions[j])
				var dis_temp2 = distance(positions[j], positions[k])
				res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
			}

			return (res / 1000000.0).toFixed(4)
		}

		/* 角度 */
		function Angle(p1, p2, p3) {
			var bearing21 = Bearing(p2, p1)
			var bearing23 = Bearing(p2, p3)
			var angle = bearing21 - bearing23
			if (angle < 0) {
				angle += 360
			}
			return angle
		}
		/* 方向 */
		function Bearing(from, to) {
			var lat1 = from.lat * radiansPerDegree
			var lon1 = from.lon * radiansPerDegree
			var lat2 = to.lat * radiansPerDegree
			var lon2 = to.lon * radiansPerDegree
			var angle = -Math.atan2(
				Math.sin(lon1 - lon2) * Math.cos(lat2),
				Math.cos(lat1) * Math.sin(lat2) -
					Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
			)
			if (angle < 0) {
				angle += Math.PI * 2.0
			}
			angle = angle * degreesPerRadian // 角度
			return angle
		}

		var PolygonPrimitive = (function () {
			function _(positions) {
				this.options = {
					id: 'meaPolygon' + _this.pointIdIndex,
					name: '多边形',
					polygon: {
						hierarchy: [],
						// perPositionHeight : true,
						material: Color.GREEN.withAlpha(0.5),
						// heightReference:20000
					},
				}
				_this.entitiesIdAry.push('meaPolygon' + _this.pointIdIndex)

				_this.pointIdIndex++
				this.hierarchy = { positions }
				this._init()
			}

			_.prototype._init = function () {
				var _self = this
				var _update = function () {
					return _self.hierarchy
				}
				// 实时更新polygon.hierarchy
				this.options.polygon.hierarchy = new CallbackProperty(_update, false)
				_this.viewer.addEntity(this.options)
			}

			return _
		})()

		function distance(point1, point2) {
			var point1cartographic = Cartographic.fromCartesian(point1)
			var point2cartographic = Cartographic.fromCartesian(point2)
			/** 根据经纬度计算出距离**/
			var geodesic = new EllipsoidGeodesic()
			geodesic.setEndPoints(point1cartographic, point2cartographic)
			var s = geodesic.surfaceDistance
			// 返回两点之间的距离
			s = Math.sqrt(
				Math.pow(s, 2) +
					Math.pow(point2cartographic.height - point1cartographic.height, 2)
			)
			return s
		}
	}

	/**
	 * 清除图层
	 */
	clearMeasureLayer() {
		this.handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
		this.handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK)
		this.handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE)
		for (let index = 0; index < this.entitiesIdAry.length; index++) {
			const element = this.entitiesIdAry[index]
			this.viewer.removeEntity(element)
		}
	}
}
