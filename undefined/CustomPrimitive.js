const CustomPrimitive = function (options) { 
    this.geometry = options.geometry
    this.attributeLocations = options.attributeLocations
    this.primitiveType = options.primitiveType
    this.vShader = options.vShader
    this.fShader = options.fShader
    this.renderState = options.renderState
    this.imageTexAry = options.imageTexAry
    this.flipY = options.flipY
    this.uniformMapOrg = options.uniformMap
    this.show = true
    this.commandToExecute = undefined 
}

CustomPrimitive.getGeometry = function (positionAry, clOrStAry, indicesAry, isTex) {
    const geometryAttributes = {
        position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 3,
            values: new Float32Array(positionAry)
        })
    }

    const geometryAttribute = {
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: new Float32Array(clOrStAry)
    }
    if (isTex) {
        geometryAttributes.st = new Cesium.GeometryAttribute(geometryAttribute)
    } else {
        geometryAttribute.componentsPerAttribute = 4
        geometryAttributes.color = new Cesium.GeometryAttribute(geometryAttribute)
    }

    return new Cesium.Geometry({
        attributes: new Cesium.GeometryAttributes(geometryAttributes),
        indices: new Uint32Array(indicesAry)
    })
}

CustomPrimitive.prototype.createCommand = function (context) {
    // context = viewer.scene._context
    const vertexArray = Cesium.VertexArray.fromGeometry({
        context: context,
        geometry: this.geometry,
        attributeLocations: this.attributeLocations,
        bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
    })
    const shaderProgram = Cesium.ShaderProgram.fromCache({
        context: context,
        attributeLocations: this.attributeLocations,
        vertexShaderSource: this.vShader,
        fragmentShaderSource: this.fShader
    })
    const renderState = Cesium.RenderState.fromCache(this.renderState)
    const modelView = context.uniformState.modelView
    const projection = context.uniformState.projection
    const uniformMap = {
        modelViewMatrix: function () {
            return modelView
        },
        projectionMatrix: function () {
            return projection
        }
    }

    if (this.uniformMapOrg) {
        this.uniformMapOrg.forEach(function (value, key) {
            uniformMap[key] = value
        })
    }

    if (this.imageTexAry && this.imageTexAry.length > 0) {
        for (let i = 0; i < this.imageTexAry.length; i++) {
            const colorTexture = new Cesium.Texture({
                context: context,
                width: context.drawingBufferWidth,
                height: context.drawingBufferHeight,
                pixelFormat: Cesium.PixelFormat.RGBA,
                pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
                source: this.imageTexAry[i],
                flipY: this.flipY
            })
            uniformMap["colorTexture" + i] = function () {
                return colorTexture
            }
        }
    }

    return new Cesium.DrawCommand({
        vertexArray: vertexArray,
        primitiveType: this.primitiveType,
        uniformMap: uniformMap,
        shaderProgram: shaderProgram,
        renderState: renderState,
        pass: Cesium.Pass.OPAQUE
    })
}

CustomPrimitive.prototype.isDestroyed = function () {
    return false
}

CustomPrimitive.prototype.destroy = function () {
    if (this.commandToExecute) {
        this.commandToExecute.shaderProgram = this.commandToExecute.shaderProgram && this.commandToExecute.shaderProgram.destroy()
    }
    this.commandToExecute = undefined
    return Cesium.destroyObject(this)
}

CustomPrimitive.prototype.update = function (frameState) {
    if (!this.show) {
        return
    }
    if (!this.commandToExecute) {
        this.commandToExecute = this.createCommand(frameState.context)
    }
    frameState.commandList.push(this.commandToExecute)
}