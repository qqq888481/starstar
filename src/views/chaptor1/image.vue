<script setup>
import { reactive, ref, onMounted } from 'vue'
const init = () => {
    var VSHADER_SOURCE = `
       attribute vec4 a_Position;
       attribute vec2 a_TexCoord;
       varying vec2 v_TexCoord;

       void main(){
        gl_Position=a_Position;
        v_TexCoord=a_TexCoord;
       }
    `
    var FSHADER_SOURCE = `
       precision mediump float;
       uniform sampler2D u_Sampler;
       varying vec2 v_TexCoord;
       void main(){
        gl_FragColor=texture2D(u_Sampler,v_TexCoord);
       }
    `
    var canvas = document.getElementById('webgl')
    var gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl')
    initShader(gl,VSHADER_SOURCE,FSHADER_SOURCE)
    var n=initVertexBuffers(gl)
    initTextures(gl,n)
}
const initShader=(gl,vertexShaderSrc,fragmentShaderSrc)=>{
    var vertexShader=gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader,vertexShaderSrc)
    gl.compileShader(vertexShader)

    var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader,fragmentShaderSrc)
    gl.compileShader(fragmentShader)

    var shaderProgram=gl.createProgram()
    gl.attachShader(shaderProgram,vertexShader)
    gl.attachShader(shaderProgram,fragmentShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)

    gl.program=shaderProgram


}
const initVertexBuffers=(gl)=>{
    //设置纹理坐标
    //将纹理坐标传入顶点着色器,并将其他顶点数据如颜色传入顶点着色器的方法是相同的

    var verticesTexCoords=new Float32Array([
        //顶点坐标,对应的纹理坐标
        -1.0,1.0,0.0,1.0,
        -1.0,-1.0,0.0,0.0,
        1.0,1.0,1.0,1.0,
        1.0,-1.0,1.0,0.0
    ])

    var FSIZE=verticesTexCoords.BYTES_PER_ELEMENT;
    //创建缓冲区对象
    var vertexColorBuffer=gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexColorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER,verticesTexCoords,gl.STATIC_DRAW)

    var a_Position=gl.getAttribLocation(gl.program,'a_Position')
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*4,0)
    gl.enableVertexAttribArray(a_Position)

    var a_TexCoord=gl.getAttribLocation(gl.program,'a_TexCoord')
    gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2)
    gl.enableVertexAttribArray(a_TexCoord)
    
    return verticesTexCoords.length/4

}

//配置加载纹理

const initTextures=(gl,n)=>{
    //从片元着色器中获取uniform变量u_Sampler(取样器)的存储位置,该变量用来接收纹理图像
    var u_Sampler=gl.getUniformLocation(gl.program,'u_Sampler')

    var image=new Image()
    image.onload=function(){
        loadTexture(gl,n,u_Sampler,image)
    }
    //出于安全性考虑，webgl不允许使用跨域纹理图像
    //image.crossOrigin=''
    //image.src='https://img1.baidu.com/it/u=721905450,292921176&fm=253&fmt=auto&app=138&f=JPEG?w=334&h=500'
    image.src='./data/textures/maomao.jpg'
}

const loadTexture=(gl,n,u_Sampler,image)=>{
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true)//图像坐标与纹理坐标y轴方向相反，需进行yzh轴反转
    var texture=gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D,texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);// 纹理放大方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);// 纹理缩小方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);// 纹理水平填充方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);// 纹理垂直填充方式

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);// 配置纹理图像

    gl.uniform1i(u_Sampler, 0);// 将0号纹理传递给着色器
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}


onMounted(() => {
    init()
})
</script>
<template>
    <div class="container">
        <canvas id="webgl" width="400" height="400"></canvas>
    </div>
  
</template>
<style lang="scss" scoped>
  .container{
    width:100vw;
    height:100vh;
    display:flex;
    justify-content: center;
    align-items:center;
  }
</style>