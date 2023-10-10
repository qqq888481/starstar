<script setup>
import { reactive, ref, onMounted } from 'vue'
const init = () => {
    var VSHADER_SOURCE = `
       attribute vec4 a_Position;
       void main(){
        gl_Position=a_Position;
      
       }
    `
    var FSHADER_SOURCE = `
      
       void main(){
        gl_FragColor=vec4(0.5,0.8,0.5,1.0);
       }
    `
    var canvas = document.getElementById('webgl')
    var gl = getWebGLContext(canvas)

    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log('failed')
        return
    }

    //设置顶点位置
    var n=initVertexBuffers(gl)
    if(n<0){
        console.log('failed')
        return;
    }
    gl.clearColor( 0.6, 0.5, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_FAN,0,8)
}

const initVertexBuffers=(gl)=>{
    var vertices=new Float32Array([0.0,0.0,0.5,0.0,0.25,0.4,-0.25,0.4,-0.5,0,-0.25,-0.4,0.25,-0.4,0.5,0])
    var n=4;

    var vertexBuffer=gl.createBuffer()
    if(!vertexBuffer){
        console.log('failed')
        return -1
    }

    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW)
    var a_Position=gl.getAttribLocation(gl.program,'a_Position')

    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0)

    gl.enableVertexAttribArray(a_Position)
    return n
}

onMounted(() => {
    init()
})
</script>
<template>
    <canvas id="webgl" width="400" height="400"></canvas>
</template>