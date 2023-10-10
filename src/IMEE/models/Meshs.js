/* eslint-disable eqeqeq */
export const Point3 = function (x, y, z) {
  this.x = x
  this.y = y
  this.z = z
}

const Vector3 = function (x, y, z) {
  this.x = x
  this.y = y
  this.z = z
}

Vector3.prototype.getMod = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
}

Vector3.prototype.dot = function (vecOther) {
  return this.x * vecOther.x + this.y * vecOther.y + this.z * vecOther.z
}

export const Color4 = function (r, g, b, a) {
  this.r = r
  this.g = g
  this.b = b
  this.a = a
}

const Triangle = function (p0Index, p1Index, p2Index) {
  this.p0Index = p0Index
  this.p1Index = p1Index
  this.p2Index = p2Index
}

Triangle.prototype.hasVertex = function (index) {
  return this.p0Index === index || this.p1Index === index || this.p2Index === index
}

Triangle.prototype.getOtherIndex = function (i1, i2) {
  return this.p0Index + this.p1Index + this.p2Index - i1 - i2
}

export const Meshs = function () {
  this.verticeAry = [] // 顶点(Point3)列表
  this.faceAry = [] // 三角面元 {face(Triangle),normal(Vector3)}列表
  this.perVerColorAry = [] // 顶点颜色(Color4)列表
  this.perVertexsList = [] // 每个顶点的邻接点(顶点索引) 列表
  this.perVertexFaceList = [] // 每个顶点的邻接面(三角面元索引) 列表
  this.perVertexNoramList = [] // 顶点法向(Vector3)列表 邻接面法向的均值
}

Meshs.prototype.clear = function () {
  this.verticeAry = []
  this.faceAry = []
  this.perVerColorAry = []
  this.perVertexsList = []
  this.perVertexFaceList = []
  this.perVertexNoramList = []
}

Meshs.prototype.addVertex = function (point3Obj, color) {
  // 添加顶点
  this.verticeAry.push(point3Obj)
  color = color || new Color4(0, 0, 0, 0)
  this.perVerColorAry.push(color)
}

Meshs.prototype.addFace = function (p0index, p1index, p2index) {
  // 构造三角面元并计算其法向
  const size = this.verticeAry.length
  if (p0index < 0 || p0index >= size ||
        p1index < 0 || p1index >= size ||
        p2index < 0 || p2index >= size) {
    return -1
  }

  const p0 = this.verticeAry[p0index]
  const p1 = this.verticeAry[p1index]
  const p2 = this.verticeAry[p2index]
  if (!p0 || !p1 || !p2) {
    return -1
  }

  // 每个顶点的邻接点
  if (!this.perVertexsList[p0index]) {
    this.perVertexsList[p0index] = []
  }
  if (!this.perVertexsList[p1index]) {
    this.perVertexsList[p1index] = []
  }
  if (!this.perVertexsList[p2index]) {
    this.perVertexsList[p2index] = []
  }
  const v0List = this.perVertexsList[p0index]
  const v1List = this.perVertexsList[p1index]
  const v2List = this.perVertexsList[p2index]
  if (v0List.indexOf(p1index) < 0) {
    v0List.push(p1index)
  }
  if (v0List.indexOf(p2index) < 0) {
    v0List.push(p2index)
  }
  if (v1List.indexOf(p0index) < 0) {
    v1List.push(p0index)
  }
  if (v1List.indexOf(p2index) < 0) {
    v1List.push(p2index)
  }
  if (v2List.indexOf(p0index) < 0) {
    v2List.push(p0index)
  }
  if (v2List.indexOf(p1index) < 0) {
    v2List.push(p1index)
  }

  // 每个顶点的邻接面
  const index = this.faceAry.length
  const normal = this._caculateTriangleNormal(p0, p1, p2)
  if (!this.perVertexFaceList[p0index]) {
    this.perVertexFaceList[p0index] = []
  }
  if (!this.perVertexFaceList[p1index]) {
    this.perVertexFaceList[p1index] = []
  }
  if (!this.perVertexFaceList[p2index]) {
    this.perVertexFaceList[p2index] = []
  }
  const p0List = this.perVertexFaceList[p0index]
  const p1List = this.perVertexFaceList[p1index]
  const p2List = this.perVertexFaceList[p2index]
  if (p0List.indexOf(index) < 0) {
    p0List.push(index)
  }
  if (p1List.indexOf(index) < 0) {
    p1List.push(index)
  }
  if (p2List.indexOf(index) < 0) {
    p2List.push(index)
  }

  this.faceAry.push({
    face: new Triangle(p0index, p1index, p2index),
    normal: normal
  })
}

Meshs.prototype.caculateVertexNormals = function () {
  // 计算每个顶点法向
  for (let i = 0; i < this.verticeAry.length; i++) {
    const faceIndexList = this.perVertexFaceList[i]
    if (!faceIndexList || faceIndexList.length == 0) {
      this.perVertexNoramList.push(new Vector3(0, 0, 0))
      continue
    }
    const size = faceIndexList.length
    let sumx = 0; let sumy = 0; let sumz = 0
    for (let k = 0; k < size; k++) {
      const normal = this.faceAry[faceIndexList[k]].normal
      sumx += normal.x
      sumy += normal.y
      sumz += normal.z
    }
    this.perVertexNoramList.push(new Vector3(sumx / size, sumy / size, sumz / size))
  }
}

Meshs.prototype.normalSmooth = function (count) {
  // 法线方向移动
  count = count || 1
  for (let nums = 0; nums < count; nums++) {
    const tempVerticeAry = []
    const len = this.verticeAry.length
    for (let i = 0; i < len; i++) {
      const verPt = this.verticeAry[i]
      const verNormal = this.perVertexNoramList[i]
      const verIndexList = this.perVertexsList[i]
      if (!verIndexList || verIndexList.length == 0) {
        tempVerticeAry[i] = new Point3(verPt.x, verPt.y, verPt.z)
        continue
      }
      let dx = 0; let dy = 0; let dz = 0
      const size = verIndexList.length
      for (let k = 0; k < size; k++) {
        const ver = this.verticeAry[verIndexList[k]]
        dx += (ver.x - verPt.x)
        dy += (ver.y - verPt.y)
        dz += (ver.z - verPt.z)
      }
      if (verNormal) {
        dx = verNormal.x * dx / size
        dy = verNormal.y * dy / size
        dz = verNormal.z * dz / size
      } else {
        dx = dx / size
        dy = dy / size
        dz = dz / size
      }
      tempVerticeAry[i] = new Point3(verPt.x + dx, verPt.y + dy, verPt.z + dz)
    }
    for (let i = 0; i < len; i++) {
      this.verticeAry[i] = tempVerticeAry[i]
    }
  }
}

Meshs.prototype.laplacianSmooth = function (count, isDW = false, lambda = 1.0, isDW2 = false) {
  // 拉普拉斯平滑 将Mesh的每个顶点移到他邻接顶点的平均位置 lambda-0~1
  count = count || 1
  lambda = (lambda < 0) ? 0 : (lambda > 1 ? 1 : lambda)
  for (let nums = 0; nums < count; nums++) {
    const tempVerticeAry = []
    const len = this.verticeAry.length
    for (let i = 0; i < len; i++) {
      const verPt = this.verticeAry[i]
      const verIndexList = this.perVertexsList[i]
      if (!verIndexList || verIndexList.length == 0) {
        tempVerticeAry[i] = new Point3(verPt.x, verPt.y, verPt.z)
        continue
      }
      tempVerticeAry[i] = this._getLaplacianPoint(verPt, verIndexList, isDW, lambda, isDW2)
    }
    for (let i = 0; i < len; i++) {
      this.verticeAry[i] = tempVerticeAry[i]
    }
  }
}

Meshs.prototype.taubinSmooth = function (count, lambda = 1.0, mu = -1.0) {
  // Taubin平滑 lambda：0~1，mu：-1~0 两次拉普拉斯平滑
  count = count || 1
  lambda = (lambda < 0) ? 0 : (lambda > 1 ? 1 : lambda)
  mu = (mu < -1) ? -1 : (mu > 0 ? 0 : mu)
  for (let nums = 0; nums < count; nums++) {
    const len = this.verticeAry.length
    const tempVerticeAry1 = []
    for (let i = 0; i < len; i++) {
      const verPt = this.verticeAry[i]
      const verIndexList = this.perVertexsList[i]
      if (!verIndexList || verIndexList.length == 0) {
        tempVerticeAry1[i] = new Point3(verPt.x, verPt.y, verPt.z)
        continue
      }
      tempVerticeAry1[i] = this._getTaubinPoint(verPt, verIndexList, lambda)
    }
    for (let i = 0; i < len; i++) {
      this.verticeAry[i] = tempVerticeAry1[i]
    }

    const tempVerticeAry2 = []
    for (let i = 0; i < len; i++) {
      const verPt = this.verticeAry[i]
      const verIndexList = this.perVertexsList[i]
      if (!verIndexList || verIndexList.length == 0) {
        tempVerticeAry2[i] = new Point3(verPt.x, verPt.y, verPt.z)
        continue
      }
      tempVerticeAry2[i] = this._getTaubinPoint(verPt, verIndexList, mu)
    }
    for (let i = 0; i < len; i++) {
      this.verticeAry[i] = tempVerticeAry2[i]
    }
  }
}

Meshs.prototype.hcLaplacianSmooth = function (count, factor1, factor2) {
  // 改进的拉普拉斯平滑 移动的点基于顶点原来位置再移动回去
  count = count || 1
  factor1 = (factor1 < 0) ? 0 : (factor1 > 1 ? 1 : factor1)
  factor2 = (factor2 < 0) ? 0 : (factor2 > 1 ? 1 : factor2)

  const ptStartAry = []
  const len = this.verticeAry.length
  for (let i = 0; i < len; i++) {
    const verPt = this.verticeAry[i]
    ptStartAry[i] = new Point3(verPt.x, verPt.y, verPt.z)
  }

  for (let nums = 0; nums < count; nums++) {
    const ptVectorAry = []
    for (let i = 0; i < len; i++) {
      const verPt = this.verticeAry[i]
      const verStartPt = ptStartAry[i]
      const verIndexList = this.perVertexsList[i]
      if (!verIndexList || verIndexList.length == 0) {
        ptVectorAry[i] = new Point3(verPt.x, verPt.y, verPt.z)
        continue
      }
      let dx = 0; let dy = 0; let dz = 0
      const size = verIndexList.length
      for (let k = 0; k < size; k++) {
        const ver = this.verticeAry[verIndexList[k]]
        dx += ver.x
        dy += ver.y
        dz += ver.z
      }
      dx = dx / size
      dy = dy / size
      dz = dz / size

      ptVectorAry[i] = new Point3(dx - (factor1 * verStartPt.x + (1 - factor1) * verPt.x),
        dy - (factor1 * verStartPt.y + (1 - factor1) * verPt.y),
        dz - (factor1 * verStartPt.z + (1 - factor1) * verPt.z))
      verStartPt.x = dx
      verStartPt.y = dy
      verStartPt.z = dz
    }
    for (let i = 0; i < len; i++) {
      this.verticeAry[i].x = ptVectorAry[i].x
      this.verticeAry[i].y = ptVectorAry[i].y
      this.verticeAry[i].z = ptVectorAry[i].z
    }

    for (let i = 0; i < len; i++) {
      const verPt = this.verticeAry[i]
      const verStartPt = ptStartAry[i]
      const verIndexList = this.perVertexsList[i]
      if (!verIndexList || verIndexList.length == 0) {
        ptVectorAry[i] = new Point3(verPt.x, verPt.y, verPt.z)
        continue
      }
      let dx = 0; let dy = 0; let dz = 0
      const size = verIndexList.length
      for (let k = 0; k < size; k++) {
        const ver = this.verticeAry[verIndexList[k]]
        dx += ver.x
        dy += ver.y
        dz += ver.z
      }
      dx = (1 - factor2) * dx / size
      dy = (1 - factor2) * dy / size
      dz = (1 - factor2) * dz / size

      ptVectorAry[i].x = verStartPt.x - (factor2 * verPt.x + dx)
      ptVectorAry[i].y = verStartPt.y - (factor2 * verPt.y + dy)
      ptVectorAry[i].z = verStartPt.z - (factor2 * verPt.z + dz)
    }
    for (let i = 0; i < len; i++) {
      this.verticeAry[i].x = ptVectorAry[i].x
      this.verticeAry[i].y = ptVectorAry[i].y
      this.verticeAry[i].z = ptVectorAry[i].z
    }
  }
}

Meshs.prototype.curvatureSmooth = function (count) {
  // 基于曲率的平滑 wi=(cotA+cotB)/2
  count = count || 1
  for (let nums = 0; nums < count; nums++) {
    const tempVerticeAry = []
    const len = this.verticeAry.length
    for (let i = 0; i < len; i++) {
      const verPt = this.verticeAry[i]
      const verIndexList = this.perVertexsList[i]
      if (!verIndexList || verIndexList.length == 0) {
        tempVerticeAry[i] = new Point3(verPt.x, verPt.y, verPt.z)
        continue
      }
      tempVerticeAry[i] = this._getCurvaturePoint(i, verPt, verIndexList)
    }

    for (let i = 0; i < len; i++) {
      this.verticeAry[i] = tempVerticeAry[i]
    }
  }
}

Meshs.prototype._caculateTriangleNormal = function (p0, p1, p2) {
  const normal = new Vector3()
  const v1x = p1.x - p0.x
  const v1y = p1.y - p0.y
  const v1z = p1.z - p0.z
  const v2x = p2.x - p1.x
  const v2y = p2.y - p1.y
  const v2z = p2.z - p1.z
  normal.x = v1y * v2z - v1z * v2y
  normal.y = v1z * v2x - v1x * v2z
  normal.z = v1x * v2y - v1y * v2x
  const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
  if (len === 0) {
    normal.x = 0
    normal.y = 0
    normal.z = 0
  } else {
    normal.x /= len
    normal.y /= len
    normal.z /= len
  }
  return normal
}

Meshs.prototype._getLaplacianPoint = function (point0, verIndexList, isDW, lambda, isDW2) {
  // isDW=true：邻域均值 isDW=false：isDW2=false反距离加权 isDW2=true反距离平方加权
  const size = verIndexList.length
  let sumDis = 0
  let dx = 0; let dy = 0; let dz = 0
  for (let k = 0; k < size; k++) {
    const ver = this.verticeAry[verIndexList[k]]
    if (!isDW) {
      dx += ver.x
      dy += ver.y
      dz += ver.z
    } else {
      const dx1 = ver.x - point0.x
      const dy1 = ver.y - point0.y
      const dz1 = ver.z - point0.z
      let dis2 = dx1 * dx1 + dy1 * dy1 + dz1 * dz1
      if (isDW2) {
        dis2 = 1.0 / dis2
        dx += ver.x * dis2
        dy += ver.y * dis2
        dz += ver.z * dis2
      } else {
        dis2 = Math.sqrt(dx1 * dx1 + dy1 * dy1 + dz1 * dz1)
        dx += dx1 * dis2
        dy += dy1 * dis2
        dz += dz1 * dis2
      }
      sumDis += dis2
    }
  }

  const point = new Point3(0, 0, 0)
  if (!isDW) {
    point.x = dx / size
    point.y = dy / size
    point.z = dz / size
  } else {
    if (isDW2) {
      point.x = dx / sumDis
      point.y = dy / sumDis
      point.z = dz / sumDis
    } else {
      point.x = point0.x + lambda * dx / sumDis
      point.y = point0.y + lambda * dy / sumDis
      point.z = point0.z + lambda * dz / sumDis
    }
  }
  return point
}

Meshs.prototype._getTaubinPoint = function (point0, verIndexList, lambda) {
  const size = verIndexList.length
  let dx = 0; let dy = 0; let dz = 0
  for (let k = 0; k < size; k++) {
    const ver = this.verticeAry[verIndexList[k]]
    dx += (ver.x - point0.x)
    dy += (ver.y - point0.y)
    dz += (ver.z - point0.z)
  }
  return new Point3(point0.x + lambda * dx / size,
    point0.y + lambda * dy / size,
    point0.z + lambda * dz / size)
}

Meshs.prototype._getCurvaturePoint = function (p0Index, point0, verIndexList) {
  const size = verIndexList.length
  let sumWeight = 0
  let dx = 0; let dy = 0; let dz = 0
  for (let k = 0; k < size; k++) {
    const index = verIndexList[k]
    const ver = this.verticeAry[index]
    const weightCot = this._getCurvatureWeight(p0Index, index)
    dx += (ver.x - point0.x) * weightCot
    dy += (ver.y - point0.y) * weightCot
    dz += (ver.z - point0.z) * weightCot
    sumWeight += weightCot
  }

  return new Point3(point0.x + dx / sumWeight, point0.y + dy / sumWeight, point0.z + dz / sumWeight)
}

Meshs.prototype._getCurvatureWeight = function (p0Index, p1Index) {
  // p0Index, p1Index边所对角的cot值
  const faceList = this.perVertexFaceList[p0Index]
  if (!faceList || faceList.length == 0) {
    return 0
  }
  let weight = 0; let count = 0
  const size = faceList.length
  for (let k = 0; k < size; k++) {
    const index = faceList[k]
    const face = this.faceAry[index].face
    if (face.hasVertex(p1Index)) {
      const vIndex = face.getOtherIndex(p0Index, p1Index)
      let p00Index = face.p0Index
      let p01Index = face.p1Index
      let p02Index = face.p2Index
      if (p01Index === vIndex) {
        p00Index = face.p1Index
        p01Index = face.p0Index
        p02Index = face.p2Index
      } else if (p02Index === vIndex) {
        p00Index = face.p2Index
        p01Index = face.p1Index
        p02Index = face.p0Index
      }
      const p0 = this.verticeAry[p00Index]
      const p1 = this.verticeAry[p01Index]
      const p2 = this.verticeAry[p02Index]

      // 点积计算两个向量夹角
      const vec1 = new Vector3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z)
      const vec2 = new Vector3(p2.x - p0.x, p2.y - p0.y, p2.z - p0.z)
      const mod1 = vec1.getMod()
      const mod2 = vec2.getMod()
      const mul = vec1.dot(vec2)
      let cotWeight = mul / (mod1 * mod2)
      cotWeight = cotWeight / Math.sqrt(1 - cotWeight * cotWeight)
      if (cotWeight !== 0 && !cotWeight) {
        cotWeight = 0
        count--
      }

      weight += cotWeight
      count++
    }
  }

  if (count < 0) {
    return 0
  } else {
    return weight / count
  }
}
