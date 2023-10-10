export default class HotGrid {
	constructor(viewer, gridInfo, id) {
		this.viewer = viewer;
		this.BoundInfo = this.loadInfo(gridInfo.Bound);
		this.circle = null;
		this.id = id;
		//面填充
		this.rectangleColor =
			id === "hot"
				? new Cesium.Color(1, 0.06, 0, 0.6)
				: new Cesium.Color(0.2, 0.82, 0.81, 0.6);

		//线填充
		this.polylineColor = new Cesium.Color(1, 1, 1, 0.6);
		// this.polylineColor =
		// 	id === "hot"
		// 		? new Cesium.Color(1, 0.84, 0.84, 0.8)
		// 		: new Cesium.Color(0.89, 1, 1, 0.8);
		// console.log(this.rectangleColor);
	}

	// 获取网格信息
	loadInfo(Bound) {
		const minLon = Bound[0];
		const minLat = Bound[1];
		const latStep = Bound[2];
		const lonStep = Bound[3];
		const rowNum = Bound[4];
		const colNum = Bound[5];
		return {
			minLon,
			minLat,
			lonStep,
			latStep,
			rowNum,
			colNum,
		};
	}

	addAll() {
		const { colNum, rowNum } = this.BoundInfo;
		let arr = [];
		for (let i = 0; i < rowNum; i++) {
			for (let j = 1; j < colNum; j++) {
				const index = i * colNum + j;
				arr.push({ id: "P" + index });
			}
		}
		this.drawGrid(arr);
	}

	drawGrid(grids) {
		// 获取网格信息
		const { colNum, minLon, minLat, lonStep, latStep } = this.BoundInfo;
		const dataSource = new Cesium.CustomDataSource();
		this.viewer.addDataSource(this.id, dataSource);

		for (const g of grids) {
			if (!g.number){continue};
			const index = Math.floor(g.number.replace("P", "")) - 1;
			const rowIndex = Math.floor(index / colNum);
			const colIndex = index % colNum;
			const lon0 = minLon + colIndex * lonStep;
			const lat0 = minLat + rowIndex * latStep;
			const lon1 = minLon + (colIndex + 1) * lonStep;
			const lat1 = minLat + (rowIndex + 1) * latStep;
			// const color = g.isAlarm ? "#00FF00" : "#FF0000";
			const polylineArr = [
				lon0,
				lat0,
				lon1,
				lat0,
				lon1,
				lat1,
				lon0,
				lat1,
				lon0,
				lat0,
			];
			dataSource.entities.add({
				info: g,
				type: "grid",
				position: Cesium.Cartesian3.fromDegrees(
					parseFloat(lon0 + lonStep / 2),
					parseFloat(lat0 + latStep / 2)
				),
				rectangle: {
					coordinates: Cesium.Rectangle.fromDegrees(
						lon0,
						lat0,
						lon1,
						lat1
					),
					material: g.isAlarm
						? new Cesium.Color(0, 1, 0, 0.6)
						: this.rectangleColor,
				},
				polyline: {
					positions: Cesium.Cartesian3.fromDegreesArray(polylineArr),
					width: 1,
					// arcType: Cesium.ArcType.RHUMB,
					material: this.polylineColor,
				},
			});
		}

		this.dataSource = dataSource;
	}

	compute(id) {
		const { colNum, minLon, minLat, lonStep, latStep } = this.BoundInfo;
		const index = Math.floor(id.replace("P", "")) - 1;
		const rowIndex = Math.floor(index / colNum);
		const colIndex = index % colNum;
		const lon0 = minLon + colIndex * lonStep;
		const lat0 = minLat + rowIndex * latStep;
		const lon1 = minLon + (colIndex + 1) * lonStep;
		const lat1 = minLat + (rowIndex + 1) * latStep;
		const centerlon = lon0 + lonStep / 2;
		const centerlat = lat0 + latStep / 2;
		return {
			lon0,
			lat0,
			lon1,
			lat1,
			centerlon,
			centerlat,
		};
	}

	remove() {
		if (this.dataSource) {
			this.viewer.dataSources.remove(this.dataSource);
			this.dataSource = null;
		}
	}

	//点击网格
	clickGrid(gridId) {
		if (!this.dataSource) return;
		const entities = this.dataSource.entities._entities._array;
		for (const element of entities) {
			const info = element.info;
			if (info.id === gridId) {
				element.polyline.material = new Cesium.Color(0, 0, 1, 0.6);
			} else {
				element.polyline.material = this.polylineColor;
			}
		}
	}

	// 添加周边圆
	addCircle({ radius = 1, info }) {
		this.removeCircle();
		const { centerlon, centerlat } = this.compute(info.number);
		this.circle = this.viewer.entities.add({
			position: Cesium.Cartesian3.fromDegrees(centerlon, centerlat),
			name: "Red ellipse on surface",
			ellipse: {
				semiMinorAxis: radius * 1000,
				semiMajorAxis: radius * 1000,
				// material: Cesium.Color.BLUE.withAlpha(0.5),
				height: 100,
				outlineWidth: 200.0,
				outlineColor: Cesium.Color.BLUE,
				outline: true,
				fill: false,
			},
		});
	}

	//显隐控制
	changeShow(hasFeedback, noFeedback) {
		if (!this.dataSource) return;
		const entities = this.dataSource.entities._entities._array;
		for (const element of entities) {
			const info = element.info;
			if (
				(info.isAlarm && hasFeedback) ||
				(!info.isAlarm && noFeedback)
			) {
				element.show = true;
			} else {
				element.show = false;
			}
		}
	}

	// 删除周边圆
	removeCircle() {
		if (this.circle) {
			this.viewer.entities.remove(this.circle);
			this.circle = null;
		}
	}
}
