/* eslint-disable */
const {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartesian2,
  Cartesian3,
  Color,
  Cartographic,
  CustomDataSource,
  VerticalOrigin,
  defined,
  LabelStyle,
  CallbackProperty,
  EllipsoidGeodesic,
} = Cesium;

import PriColor from "@/IMEE/utils/priColor";

/* 测量距离 */
export default class MeasureTool {
  constructor(viewer) {
    this.viewer = viewer;
    this.dataSource = [];
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas); // 鼠标事件
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
    this.id = "text";
    this.positionAry = [];
    this.label = null;
    if (this.viewer.getEntity(this.id)) {
      this.viewer.removerEntity(this.id);
    }
  }

  // 执行测量距离
  excuteMeasureLength() {
    const _this = this;
    _this.handler.destroy();
    _this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas); // 鼠标事件
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    const positions = [];
    let poly = null;
    let distance = 0;
    let cartesian = null;
    this.dataSource = new CustomDataSource("measureSource");
    this.viewer.dataSources.add(this.dataSource);
    if (this.viewer.getEntity(this.id)) {
      this.viewer.removerEntity(this.id);
    }
    // let tooltip = document.querySelector('#toolTip')
    // tooltip.style.display = "block"
    // 鼠标移入
    this.handler.setInputAction((res) => {
      // tooltip.innerHTML ='<p>单击开始，双击结束</p>'
      const ray = this.viewer.camera.getPickRay(res.endPosition);
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      const ellipsoid = this.viewer.scene.globe.ellipsoid;
      const cartographic = ellipsoid.cartesianToCartographic(cartesian);
      const lon = Cesium.Math.toDegrees(cartographic.longitude);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const alt = cartographic.height;
      this.positionAry = [lon, lat, alt];
      this.drawLabel();
      // 不在地球范围内
      if (!defined(cartesian)) {
        return;
      }
      if (positions.length >= 2) {
        if (!defined(poly)) {
          poly = new PolyLinePrimitive(positions);
        } else {
          positions.pop();
          positions.push(cartesian);
        }
        distance = calculateSpaceDistance(positions);
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    // 鼠标左击
    this.handler.setInputAction((res) => {
      const ray = this.viewer.camera.getPickRay(res.position);
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      // 不在地球范围内
      if (!defined(cartesian)) {
        return;
      }
      if (_this.viewer.getEntity(_this.id)) {
        _this.viewer.chanegEntityShow(_this.id, true);
      }
      if (positions.length === 0) {
        positions.push(cartesian.clone());
      }
      positions.push(cartesian);
      // 记录鼠标单击时的节点位置，异步计算贴地距离
      const labelPt = positions[positions.length - 1];
      const textDistance = positions.length === 2 ? "" : distance;
      this.dataSource.entities.add({
        name: "空间直线拐点",
        position: labelPt,
        point: {
          pixelSize: 5,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: textDistance,
          font: "18px sans-serif",
          fillColor: Color.GOLD,
          style: LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(20, -20),
        },
      });
    }, ScreenSpaceEventType.LEFT_CLICK);

    // 双击
    this.handler.setInputAction((res) => {
      this.handler.destroy();
      if (positions.length !== 0) {
        positions.pop();
      }
      if (_this.viewer.getEntity(_this.id)) {
        _this.viewer.chanegEntityShow(_this.id, false);
      }
    }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // 绘制线
    const PolyLinePrimitive = (function () {
      function _(positions) {
        this.options = {
          name: "空间直线",
          polyline: {
            show: true,
            positions: [],
            material: Color.CHARTREUSE,
            width: 4,
            clampToGround: true,
          },
        };
        this.positions = positions;
        this._init();
      }

      _.prototype._init = function () {
        const _self = this;
        const _update = function () {
          return _self.positions;
        };
        // 实时更新polyline.positions
        this.options.polyline.positions = new CallbackProperty(_update, false);
        _this.dataSource.entities.add(this.options);
      };
      return _;
    })();

    /**
     * 空间两点距离计算函数
     * @param positions 点的屏幕坐标系数组
     */
    function calculateSpaceDistance(positions) {
      let distance = 0;
      for (let i = 0; i < positions.length - 1; i++) {
        const point1cartographic = Cartographic.fromCartesian(positions[i]);
        const point2cartographic = Cartographic.fromCartesian(positions[i + 1]);
        /** 根据经纬度计算出距离 **/
        const geodesic = new EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        let s = geodesic.surfaceDistance;
        // 返回两点之间的距离
        s = Math.sqrt(
          Math.pow(s, 2) +
            Math.pow(point2cartographic.height - point1cartographic.height, 2)
        );
        distance = distance + s;
      }
      distance =
        distance > 1000
          ? (distance / 1000).toFixed(2) + "千米"
          : distance.toFixed(2) + "米";
      return distance;
    }
  }

  /**
   * 清除图层
   */
  clearMeasureLayer() {
    // let tooltip = document.querySelector('#toolTip')
    // tooltip.style.display = "none"
    const dataSource = this.viewer.dataSources.getByName("measureSource");
    if (dataSource) {
      dataSource.forEach((item) => {
        this.viewer.dataSources.remove(item, true);
      });
    }
    if (this.viewer.getEntity(this.id)) {
      this.viewer.removerEntity(this.id);
    }
    this.handler.destroy();
  }

  // 文本
  drawLabel() {
    this.position = new CallbackProperty(() => {
      return Cartesian3.fromDegrees(
        this.positionAry[0],
        this.positionAry[1],
        0
      );
    }, false);
    this.label = {
      id: this.id,
      text: "单击开始绘制，双击结束",
      scale: 1.0,
      fillColor: new PriColor("#fff", true), // new PriColor(this.color, true),
      // outlineColor: new PriColor(this.outlineColor, true),
      font: 12 + "px sans-serif",
      // outlineWidth: 5.0,
      style: LabelStyle.FILL,
      outlineColor: new PriColor("#000", 0.6),
      outlineWidth: 1.0,
      showBackground: true,
      backgroundColor: new PriColor("#000", 0.6),
      backgroundPadding: new Cesium.Cartesian2(14, 8),
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      pixelOffset: new Cesium.Cartesian2(10.0, -20),
    };
    this.type = "text";
    this.viewer.addEntity(this);
  }
}
