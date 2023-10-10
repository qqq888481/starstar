<script setup>
import { ref, onMounted } from 'vue'
//顶点着色器程序
var VSHADER_SOURCE = `
   attribute vec4 a_Position;
   void main(){
    gl_Position=a_Position;
    gl_PointSize=10.0;
   }
`
//片元着色器程序
var FSHADER_SOURCE = `
    void main(){
        gl_FragColor=vec4(1.0,0.5,1.0,1.0);
    }
`
const init = () => {
    var canvas = document.getElementById('webgl')
    var gl = getWebGLContext(canvas)
    //初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('failed')
        return
    }

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.clearColor( 0.6, 0.5, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    //注册鼠标点击事件响应函数
   canvas.onmousedown = function (ev) { click(ev, gl, canvas, a_Position) }

   
    var g_points=[]
    function click(ev,gl,canvas,a_Position){
        var x=ev.clientX;
        var y=ev.clientY;
        var rect=ev.target.getBoundingClientRect();
        x=((x-rect.left)-canvas.height/2)/(canvas.height/2);
        y=(canvas.width/2-(y-rect.top))/(canvas.width/2)

        //将坐标存储到g_points数组中;
        g_points.push(x);
        g_points.push(y)

        gl.clear(gl.COLOR_BUFFER_BIT)

        var leng=g_points.length;
        console.log(g_points,'数组')
        for(var i=0;i<leng;i+=2){
            gl.vertexAttrib3f(a_Position,g_points[i],g_points[i+1],0.0)
            gl.drawArrays(gl.POINTS,0,1)
        }
    }
    var leng = g_points.length;
    console.log(g_points, '数组')
    for (var i = 0; i < leng; i += 2) {
        gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0)
        gl.drawArrays(gl.POINTS, 0, 1)
    }
}
onMounted(() => {
    init()
})
</script>
<template>
    <canvas id="webgl" width="400" height="400"></canvas>
</template>
<style lang="scss" scoped></style>