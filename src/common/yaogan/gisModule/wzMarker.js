import { getBolckColor } from "@src/common/utilFns";
import img0 from "@src/assets/yaogan/hot/station/level0.png";
import img1 from "@src/assets/yaogan/hot/station/level11.png";
import img2 from "@src/assets/yaogan/hot/station/level2.png";
import img3 from "@src/assets/yaogan/hot/station/level3.png";
import img4 from "@src/assets/yaogan/hot/station/level4.png";
import img5 from "@src/assets/yaogan/hot/station/level5.png";
import img6 from "@src/assets/yaogan/hot/station/level6.png";
export default class WZMarker {
	constructor(viewer, type) {
		this.viewer = viewer;
		this.height = 0;
		this.show = false;
		this.type = type;
		this.myDataSource = null;
		this.near = 2e4;
	}

	draw(datas, key) {
		this.remove();
		if (datas?.length) {
			this.myDataSource = new Cesium.CustomDataSource(this.type);
			for (	const data of datas) {
				const lon = data.lon;
				const lat = data.lat;
				const levelColor = getBolckColor(key, data[key]);
				//画entities
				this.myDataSource.entities.add({
					info: data,
					type: this.type,
					id: data.id,
					position: Cesium.Cartesian3.fromDegrees(
						parseFloat(lon),
						parseFloat(lat),
						this.height
					),
					billboard: {
						image: this.drawLabel(
							data[key],
							data.stationName,
							levelColor
						),
						// image: this.image,
						horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
						verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
						scale: 1,
						distanceDisplayCondition:
							new Cesium.DistanceDisplayCondition(100, this.near),
						eyeOffset: new Cesium.Cartesian2(0, 0, -1), //偏移量
						// pixelOffset: new Cesium.Cartesian2(0, 24), //偏移量
						// width: 48,
						// height: 48,
					},
					// point: {
					// 	color: new Cesium.Color.fromCssColorString(levelColor),
					// 	pixelSize: 16,
					// 	outlineWidth: 0,
					// 	// horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
					// 	// verticalOrigin: Cesium.VerticalOrigin.CENTER,
					// 	// heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
					// 	distanceDisplayCondition:
					// 		new Cesium.DistanceDisplayCondition(this.near, 6e7),
					// },
				});
				this.myDataSource.entities.add({
					info: data,
					type: this.type,
					id: "point" + data.id,
					position: Cesium.Cartesian3.fromDegrees(
						parseFloat(lon),
						parseFloat(lat),
						this.height
					),
					billboard: {
						image: this.getColorImg(levelColor),
						// image: this.image,
						horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
						verticalOrigin: Cesium.VerticalOrigin.CENTER,
						scale: 1,
						distanceDisplayCondition:
							new Cesium.DistanceDisplayCondition(this.near, 6e7),
						eyeOffset: new Cesium.Cartesian2(0, 0, -1), //偏移量
						// pixelOffset: new Cesium.Cartesian2(0, 24), //偏移量
						// width: 22,
						// height: 22,
					},
				});
			}
			this.viewer.dataSources.add(this.myDataSource);
		}
	}

	// 获取站点缩略图标
	getColorImg(colorString) {
		let img = img0;
		switch (colorString) {
			case "rgba(0, 228, 0,0.5)":
				img = img1;
				break;
			case "rgba(255, 255, 0,0.5)":
				img = img2;
				break;
			case "rgba(255, 126, 0,0.5)":
				img = img3;
				break;
			case "rgba(255, 0, 0,0.5)":
				img = img4;
				break;
			case "rgba(153, 0, 76,0.5)":
				img = img5;
				break;
			case "rgba(126,0,35,0.5)":
				img = img6;
				break;
			default:
				break;
		}
		return img;
	}

	//地图点位标签
	drawLabel = ( color,v = 10, name = "海东西路西北侧",) => {
		const value = v >= 0 ? v : "--";
		const width = name.length * 13;
		const width1 = this.getWidthByNum(String(value).length);
		const left = Math.abs((width - width1) / 2);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		canvas.width = width;
		canvas.height = 48;

		ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
		ctx.fillRect(0, 30, canvas.width, canvas.height); // 绘制底图

		ctx.font = "11px Helvetica";
		ctx.textAlign = "center";
		ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
		ctx.fillText(name, width / 2, 43);

		ctx.fillStyle = color;
		ctx.textAlign = "center";
		ctx.fillRect(left, 0, width1, 18);

		ctx.textAlign = "center";
		ctx.font = "12px Helvetica";
		// ctx.shadowColor = '#000';
		// ctx.shadowOffsetX = 1;// 设置阴影的横向偏移量
		// ctx.shadowOffsetY = 1;
		// ctx.shadowBlur = 5;// 设置模糊等级
		ctx.fillStyle = value > 300 ? "#fff" : "#000";

		ctx.fillText(value, width1 / 2 + left, 15);

		/*1.绘制一个三角形*/
		ctx.beginPath();
		ctx.moveTo(width / 2 - 5, 19);
		ctx.lineTo(width / 2 + 5, 19);
		ctx.lineTo(width / 2, 24);
		ctx.closePath();
		ctx.strokeStyle = color;
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.fillStyle = color; //以纯色绿色填充
		ctx.fill();

		return canvas.toDataURL("image/png");
	};

	getWidthByNum(num) {
		let width
		if (num === 1) {
			width = 30;
		} else if (num === 2) {
			width = 30;
		} else if (num === 3) {
			width = 35;
		} else {
			width = 40;
		}
		return width;
	}

	remove() {
		if (this.myDataSource) {
			this.viewer.dataSources.remove(this.myDataSource);
			this.myDataSource = null;
		}
	}

	_changeShow(isShow) {
		this.myDataSource.show = isShow;
	}
}
