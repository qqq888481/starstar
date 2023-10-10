<script setup>
import { ref, onMounted,reactive } from 'vue'
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
let gl, a_Position,
smile_points = [-0.78, 0.545, -0.72, 0.605, -0.63, 0.64, -0.525, 0.6, -0.495, 0.52, -0.27, 0.52, -0.245, 0.595, -0.165, 0.65, -0.07, 0.62, 0, 0.55, 0, 0.505, -0.59, 0.275, -0.54, 0.215, -0.495, 0.175, -0.42, 0.175, -0.35, 0.185, -0.29, 0.23, -0.26, 0.285],//鼠标点击位置数组
cry_points = [-0.575, 0.51, -0.53, 0.445, -0.48, 0.4, -0.41, 0.385, -0.325, 0.4, -0.27, 0.46, -0.235, 0.525, 0.08, 0.53, 0.11, 0.46, 0.16, 0.415, 0.22, 0.395, 0.3, 0.4, 0.355, 0.46, 0.395, 0.535, -0.31, 0.065, -0.25, 0.125, -0.185, 0.18, -0.11, 0.205, -0.045, 0.205, 0.025, 0.185, 0.09, 0.14, 0.115, 0.095, 0.145, 0.04]
const init = () => {
    var canvas = document.getElementById('webgl')
    gl = getWebGLContext(canvas)
    //初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('failed')
        return
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.clearColor(0.6, 0.5, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    change.draw(smile_points)



}
const change = reactive({
    style: 'smile',

    changeStyle: (style) => {
        change.style = style;
        if (gl) {
            //改变表情
            if (style == 'smile') {
                change.draw(smile_points)
            } else {
                change.draw(cry_points)
            }
        }

    },
    draw: (arr) => {
        gl.clear(gl.COLOR_BUFFER_BIT)

        let leng = arr.length;

        for (var i = 0; i < leng; i += 2) {
            gl.vertexAttrib3f(a_Position, arr[i], arr[i + 1], 0.0)
            gl.drawArrays(gl.POINTS, 0, 1)
        }
    }
})
onMounted(() => {
    init()
})
</script>
<template>
    <canvas id="webgl" width="400" height="400"></canvas>
    <div class="buttonGroups">
        <div class="btn" @click="change.changeStyle('smile')" :class="change.style==='smile'?'activeBtn':'default'">笑脸</div>
        <div class="btn" @click="change.changeStyle('cry')" :class="change.style==='cry'?'activeBtn':'default'">哭脸</div>
    </div>
</template>
<style lang="scss" scoped>
.buttonGroups {
    height: 50rem;
    width: 380rem;
    display: flex;
    justify-content: space-around;

    .btn {
        width: 60rem;
        height: 30rem;
        border-radius: 8rem;
       
        line-height: 30rem;
        text-align: center;
        cursor: pointer;
    }
    .activeBtn{
        color:#FFFFFF;
        border:0rem;
        background:#2871b6;
    }
    .default{
        color:#333333;
        border: 1rem solid rgba(0, 0, 0);
        background:#FFFFFF;
    }
}
</style>