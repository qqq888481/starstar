export default class PicCompute {
  constructor() {
    this.webMercatorProjection = new Cesium.WebMercatorProjection();
  }

  // 墨卡托投影图片 转等经纬度图片
  // maskPic的图片大小、经纬度范围，要和原始图片一致
  // 当没有maskPic的时候，代码是有问题的，暂时直接注释掉了maskPicImg.onload
  merPicToLonlatPic(url, lbx, lby, rtx, rty, callback, maskPic = null) {
    let maskPicImg;
    if (maskPic) {
      maskPicImg = document.createElement("IMG");
      maskPicImg.src = maskPic;
    }

    // maskPicImg.onload = () => {
    const oriImg = document.createElement("IMG");
    oriImg.src = url;

    const mercatorLB = {
      x: lbx,
      y: lby,
    };
    const mercatorRT = {
      x: rtx,
      y: rty,
    };
    const p1 = this.merToLonlat(lbx, lby);
    const p2 = this.merToLonlat(rtx, rty);

    const lonLatLB = p1;
    const lonlatRT = p2;

    oriImg.onload = () => {
      const cols = oriImg.width;
      const rows = oriImg.height; // 图片原始像素宽高

      const width = cols;
      const heit = parseInt(
        ((lonlatRT.y - lonLatLB.y) * width) / (lonlatRT.x - lonLatLB.x)
      ); // 要生成图片的图片宽高

      const myMax = mercatorRT.y; // 墨卡托Y的最大值
      const dmY = mercatorRT.y - mercatorLB.y; // 墨卡托Y的间距
      const latMax = lonlatRT.y; // 经纬度的Y最大值
      const dLat = lonlatRT.y - lonLatLB.y; // 经纬度Y的间距

      const oriC = document.createElement("CANVAS");
      oriC.width = cols;
      oriC.height = rows;
      const oriCtx = oriC.getContext("2d");
      oriCtx.drawImage(oriImg, 0, 0);
      const imgData = oriCtx.getImageData(0, 0, oriC.width, oriC.height);

      const tarC = document.createElement("CANVAS");
      tarC.width = width;
      tarC.height = heit;
      const tarCtx = tarC.getContext("2d");
      const myImgData = oriCtx.createImageData(width, heit);

      let maskPicImgData;
      if (maskPic) {
        const maskPicC = document.createElement("CANVAS");
        maskPicC.width = maskPicImg.width;
        maskPicC.height = maskPicImg.height;
        const maskPicCtx = maskPicC.getContext("2d");
        maskPicCtx.drawImage(maskPicImg, 0, 0);
        maskPicImgData = maskPicCtx.getImageData(
          0,
          0,
          maskPicC.width,
          maskPicC.height
        );
      }

      // let lastLonLatY = 0;
      for (let lonLatY = 0; lonLatY < heit; lonLatY++) {
        let merY = Math.round(
          this.getMerY(lonLatY, heit, rows, myMax, dmY, latMax, dLat)
        );

        // if (lonLatY - lastLonLatY > 1) {
        //   lonLatY = lastLonLatY + 1;
        //   merY--;
        // }
        // lastLonLatY = lonLatY;

        if (merY < 0 || merY >= rows) {
          continue;
        }

        for (let merX = 0; merX < cols; merX++) {
          myImgData.data[(lonLatY * cols + merX) * 4] =
            imgData.data[(merY * cols + merX) * 4];
          myImgData.data[(lonLatY * cols + merX) * 4 + 1] =
            imgData.data[(merY * cols + merX) * 4 + 1];
          myImgData.data[(lonLatY * cols + merX) * 4 + 2] =
            imgData.data[(merY * cols + merX) * 4 + 2];

          if (maskPic) {
            if (
              maskPicImgData.data[(lonLatY * cols + merX) * 4] === 0 &&
              maskPicImgData.data[(lonLatY * cols + merX) * 4 + 1] === 0 &&
              maskPicImgData.data[(lonLatY * cols + merX) * 4 + 2] === 0
            ) {
              myImgData.data[(lonLatY * cols + merX) * 4 + 3] =
                imgData.data[(merY * cols + merX) * 4 + 3];
            } else {
              myImgData.data[(lonLatY * cols + merX) * 4 + 3] = 0;
            }
          } else {
            myImgData.data[(lonLatY * cols + merX) * 4 + 3] =
              imgData.data[(merY * cols + merX) * 4 + 3];
          }
        }
      }

      tarCtx.putImageData(myImgData, 0, 0);

      callback({
        url: tarC.toDataURL("image/png"),
        lonMin: lonLatLB.x,
        latMin: lonLatLB.y,
        lonMax: lonlatRT.x,
        latMax: lonlatRT.y,
      });
    };
    // }
  }

  // 等经纬度图片 转  墨卡托投影图片
  lonlatPicToMerPic(url, lbx, lby, rtx, rty, callback) {
    const oriImg = document.createElement("IMG"); //原始图片
    oriImg.src = url;
    const lonLatLB = {
      x: lbx,
      y: lby,
    };
    const lonlatRT = {
      x: rtx,
      y: rty,
    };

    const p1 = this.lonLatToMercator(lonLatLB);
    const p2 = this.lonLatToMercator(lonlatRT);

    const mercatorLB = p1;
    const mercatorRT = p2;

    oriImg.onload = () => {
      const cols = oriImg.width;
      const rows = oriImg.height; // 图片原始像素宽高

      const width = cols;
      const heit = parseInt(
        ((mercatorRT.y - mercatorLB.y) * width) / (mercatorRT.x - mercatorLB.x)
      ); // 要生成图片的图片宽高

      const myMax = mercatorRT.y; // 墨卡托Y的最大值
      const dmY = mercatorRT.y - mercatorLB.y; // 墨卡托Y的间距
      const latMax = lonlatRT.y; // 经纬度的Y最大值
      const dLat = lonlatRT.y - lonLatLB.y; // 经纬度Y的间距

      const oriC = document.createElement("CANVAS"); //原始图片的canvas
      oriC.width = cols;
      oriC.height = rows;
      const oriCtx = oriC.getContext("2d");
      oriCtx.drawImage(oriImg, 0, 0);
      const imgData = oriCtx.getImageData(0, 0, oriC.width, oriC.height);

      const tarC = document.createElement("CANVAS"); // 墨卡托图片的经纬度
      tarC.width = width;
      tarC.height = heit;
      const tarCtx = tarC.getContext("2d");
      const myImgData = oriCtx.createImageData(width, heit);

      // let lastMerY = 0;
      for (let merY = 0; merY < heit; merY++) {
        let lonLatY = Math.round(
          this.getLonLatY(merY, heit, rows, myMax, dmY, latMax, dLat)
        );

        // if (merY - lastMerY > 1) {
        //   merY = lastMerY + 1;
        //   lonLatY--;
        // }
        // lastMerY = merY;

        if (lonLatY < 0 || lonLatY >= rows) {
          continue;
        }

        for (let merX = 0; merX < cols; merX++) {
          myImgData.data[(merY * cols + merX) * 4] =
            imgData.data[(lonLatY * cols + merX) * 4];
          myImgData.data[(merY * cols + merX) * 4 + 1] =
            imgData.data[(lonLatY * cols + merX) * 4 + 1];
          myImgData.data[(merY * cols + merX) * 4 + 2] =
            imgData.data[(lonLatY * cols + merX) * 4 + 2];

          myImgData.data[(merY * cols + merX) * 4 + 3] =
            imgData.data[(lonLatY * cols + merX) * 4 + 3];
        }
      }

      tarCtx.putImageData(myImgData, 0, 0);

      callback({
        url: tarC.toDataURL("image/png"),
        lonMin: lonLatLB.x,
        latMin: lonLatLB.y,
        lonMax: lonlatRT.x,
        latMax: lonlatRT.y,
      });
    };
  }

  /** 经纬度图片y位置转换到墨卡托图片y位置 */
  getMerY(lonlatY, lonlatHeit, merHeit, myMax, dmY, latMax, dLat) {
    // 经纬度投影下图片Y位置对应的经纬度Y坐标
    let lat = latMax - (lonlatY * dLat) / lonlatHeit;
    // 经纬度Y坐标转换为墨卡托Y坐标
    let y =
      Math.log(Math.tan(((90 + lat) * Math.PI) / 360.0)) / (Math.PI / 180.0);
    y = (y * 20037508.342789) / 180.0;
    // 墨卡托Y坐标转换为墨卡托图片Y位置
    y = ((myMax - y) * merHeit) / dmY;

    return y;
  }

  // 墨卡托的行数、总行数、要生成图片的图片宽高、墨卡托Y的最大值、墨卡托Y的间距、经纬度的Y最大值、经纬度Y的间距
  getLonLatY(merY, merHeit, heit, myMax, dmY, latMax, dLat) {
    // 墨卡托投影下图片Y位置对应的墨卡托Y坐标
    const my = myMax - (merY * dmY) / merHeit;

    // 墨卡托Y坐标转换为经纬度Y坐标
    let y = (my / 20037508.342789) * 180.0;
    y =
      (180.0 / Math.PI) *
      (2.0 * Math.atan(Math.exp((y * Math.PI) / 180.0)) - Math.PI / 2.0);
    // 经纬度Y坐标转换为经纬度图片Y位置
    y = ((latMax - y) * heit) / dLat;
    return y;
  }

  /** 经纬度坐标转墨卡托坐标 */
  lonLatToMercator(lonLat) {
    const x = (lonLat.x * 20037508.342789) / 180.0;
    let y =
      Math.log(Math.tan(((90 + lonLat.y) * Math.PI) / 360.0)) /
      (Math.PI / 180.0);
    y = (y * 20037508.342789) / 180.0;

    return { x, y };
  }

  // 墨卡托坐标转经纬度坐标
  merToLonlat(x, y) {
    const cartographic = this.webMercatorProjection.unproject(
      new Cesium.Cartesian3(x, y, 0)
    );
    cartographic.longitude = Cesium.Math.toDegrees(cartographic.longitude);
    cartographic.latitude = Cesium.Math.toDegrees(cartographic.latitude);

    return { x: cartographic.longitude, y: cartographic.latitude };
  }
}
