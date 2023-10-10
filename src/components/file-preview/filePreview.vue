<!--
    导入filePreview.js的openPreview方法传入相应预览文件地址和类型
    openPreview([
		{url:'http://61.50.111.214:28282/sysFileBasePath/qml/a0169753-694e-449a-82d1-a4df0671fab51.jpg',type:'jpg'},
		{url:'http://61.50.111.214:28282/sysFileBasePath/qml/39102aad-b3cc-4241-b81b-d4b4ef1ad578movie.ogg',type:'mp4'},
		{url:'http://61.50.111.214:28282/sysFileBasePath/qml/ad32f335-74b7-4d9a-953e-f5bae51c4107test的撒大苏打11112312312231312321312.pdf',type:'pdf'},
	])
 -->

<template><!-- 文件预览公用组件 -->
    <div class='file-preview-box' v-show='isFilePreviewShow'>
        <div class='close-btn file-play-btn'>
            <close-circle-outlined @click='closePreview()'/>
        </div>
        <div class='next-btn file-play-btn' v-show='fileList.length>=2'>
            <right-circle-outlined @click='changeShowFile(1)'/>
        </div>
        <div class='prev-btn file-play-btn' v-show='fileList.length>=2'>
            <left-circle-outlined @click='changeShowFile(-1)'/>
        </div>
        <div class='image-operate-box'>
            <zoom-in-outlined @click='enlarge' />
            <zoom-out-outlined @click='shrink' />
            <retweet-outlined @click='firstImg' />
            <undo-outlined @click='rightRotate' />
            <redo-outlined @click='leftRotate' />
            <column-width-outlined @click="levelFlip"/>
            <column-height-outlined @click='verticalFlip'/>
        </div>
        <div class='file-box'  ref='fileShowDom' @mouseenter='addMouseEvent()'>
            <video  v-if='nowShowFile.type=="mp4"' controls autoplay :src="nowShowFile.url" ref='fileShowImg' >
                <track default>
            </video>
            <iframe v-else-if='nowShowFile.type=="pdf"' ref='fileShowImg'  :src='nowShowFile.url'></iframe>
            <img v-else :src="nowShowFile.url" ref='fileShowImg' />
        </div>
    </div>
</template>

<script>
import {ref,reactive,toRefs,onMounted,watch,onUnmounted} from 'vue'
import {
    CloseCircleOutlined,LeftCircleOutlined,RightCircleOutlined,ZoomInOutlined,ZoomOutOutlined,RetweetOutlined,RedoOutlined,UndoOutlined,ColumnWidthOutlined,ColumnHeightOutlined,
} from '@ant-design/icons-vue';
export default {
    components:{
        CloseCircleOutlined,LeftCircleOutlined,RightCircleOutlined,ZoomInOutlined,ZoomOutOutlined,RetweetOutlined,RedoOutlined,UndoOutlined,ColumnWidthOutlined,ColumnHeightOutlined
    },
    setup(props,{attrs,emit,expose}) {
        let fileShowImg = ref()
        let fileShowDom = ref()//规限图片显示的大小区域
        let fileData = reactive({
            isFilePreviewShow:false,//当前是否显示文件预览框
            fileList:[],//传递的所有文件预览列表
            openPreview(fileList){//打开或者修改文件预览列表
                fileData.isFilePreviewShow = true
                fileData.fileList = fileList//保存显示文件列表
                fileData.changeShowFile(999)//默认显示第一个文件
                console.log(fileList)
            },
            closePreview(){//关闭文件预览列表
                fileData.isFilePreviewShow = false
                fileData.fileList = []
            },
            nowShowFile:{},//当前展示的文件信息
            nowShowFileIndex:0,//当前展示的文件的下标
            changeShowFile(number){//切换显示的文件
                bottomOperate.nowFileRotate = [0,0,0]//重置旋转参数
                bottomOperate.nowFileScale = 1//重置放大缩小参数
                fileData.nowShowFileIndex+=number//当前显示文件下标
                if(fileData.nowShowFileIndex<0){//到第一张则显示最后一张
                    fileData.nowShowFileIndex =  (fileData.fileList.length-1)
                }else if(fileData.nowShowFileIndex >=  fileData.fileList.length){//到最后一张显示第一张
                    fileData.nowShowFileIndex = 0 
                }
                fileData.nowShowFile = fileData.fileList[fileData.nowShowFileIndex]//获取当前显示文件得信息
            },
            addMouseEvent(){//鼠标操作事件
                fileShowDom.value.onmousewheel = (e) => {//滑轮事件
		        	if(e.wheelDelta>0){//上滑
                        bottomOperate.enlarge()
		            }
		            if(e.wheelDelta<0){//下滑
		                bottomOperate.shrink()
		            }
		        }
                let disX = 0
		        let disY = 0
		        fileShowDom.value.onmousedown = e => {
		        	e = e || window.event
		        	disX = e.clientX - fileShowImg.value.offsetLeft
		        	disY = e.clientY - fileShowImg.value.offsetTop
		        	fileShowDom.value.onmousemove = em => {
		        		em = em || window.event
		        		const oLeft = em.clientX - disX
		        		const oTop = em.clientY - disY
		        		fileShowImg.value.style.left = `${oLeft}px`
		        		fileShowImg.value.style.top = `${oTop}px`
		        	}
		        	fileShowDom.value.onmouseup = () => {
		        		fileShowDom.value.onmousemove = null //清除 onmousemove 事件
		        		fileShowDom.value.onmouseup = null
		        	}
		        	return false
		        }
		        fileShowDom.value.onmouseleave = () => {
		        	fileShowDom.value.onmousemove = null
		        	fileShowDom.value.onmouseup = null
		        }
            },
        })
        let bottomOperate = reactive({
            nowFileScale:1,//当前显示文件的大小比例
            nowFileRotate:[0,0,0],//当前文件的旋转比列
            firstImg(){//复原操作
                bottomOperate.nowFileScale = 1
                bottomOperate.nowFileRotate = [0,0,0]
                bottomOperate.changeFileStyle()
                fileShowImg.value.style.top = "50%"
                fileShowImg.value.style.left = "50%"
            },
            enlarge(){//放大
                bottomOperate.nowFileScale+=0.05
                bottomOperate.changeFileStyle()
            },
            shrink(){//缩小
                bottomOperate.nowFileScale-=0.05
                if(bottomOperate.nowFileScale<=0.1){
                    bottomOperate.nowFileScale = 0.1
                }
                bottomOperate.changeFileStyle()
            },
            leftRotate(){//左转
                bottomOperate.nowFileRotate[2]+=90
                bottomOperate.changeFileStyle()
            },
            rightRotate(){//右转
                bottomOperate.nowFileRotate[2]-=90
                bottomOperate.changeFileStyle()
            },
            levelFlip(){//水平翻转
                bottomOperate.nowFileRotate[1]+=180
                bottomOperate.changeFileStyle()
            },
            verticalFlip(){//垂直翻转
                bottomOperate.nowFileRotate[0]-=180
                bottomOperate.changeFileStyle()
            },
            changeFileStyle(){//修改文件显示的样式
                fileShowImg.value.style.transform= "translate(-50%,-50%) scale("+bottomOperate.nowFileScale+") " + "rotateX("+bottomOperate.nowFileRotate[0]+"deg) " +"rotateY("+bottomOperate.nowFileRotate[1]+"deg) " + "rotateZ("+bottomOperate.nowFileRotate[2]+"deg)"  //translate(-50%,-50%)
            },
        })

        onMounted(()=>{
            console.log("onMounted")
            setTimeout(() => {
                // fileShowImg.value.style.left = Math.floor((fileShowDom.value.offsetWidth - fileShowImg.value.offsetWidth)/2)+'px'
                // fileShowImg.value.style.top = Math.floor((fileShowDom.value.offsetHeight - fileShowImg.value.offsetHeight)/2)+'px'
            }, 500);
        })

        onUnmounted(()=>{
            console.log("onUnmounted")
        })
        expose({
            fileData
        })
        return{
            ...toRefs(fileData),
            ...toRefs(bottomOperate),
            fileShowImg,
            fileShowDom,
        }
    }
}
</script>

<style lang='scss'>
    .file-preview-box{
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.8);
        z-index: 99999;
        position: fixed;
        top: 0;
        left: 0;
        .file-play-btn{
            position: absolute;
            z-index: 3;
            font-size: 40rem;
            color:#fff;
            cursor: pointer;
        }
        .close-btn{
            right: 50rem;
            top: 50rem; 
        }
        .next-btn{
            right: 20rem;
            top: 50%;
            transform: translateY(-50%);
        }
        .prev-btn{
            left: 20rem;
            top: 50%;
            transform: translateY(-50%);
        }
        .image-operate-box{
            width: 380rem;
            height: 50rem;
            background-color: rgba(200,200,200,.2);
            border-radius: 50rem;
            bottom: 30rem;
            left: 50%;
            position: absolute;
            transform: translateX(-50%);
            display: flex;
            justify-content: space-around;
            align-items: center;
            font-size: 30rem;
            color:#fff;
            z-index: 3;
            span{
                cursor: pointer;
            }
        }
        .file-box{
            width: 100%;
            height: 100%;
            position: absolute;
            overflow: hidden;
            z-index: 2;
            img,video,iframe{
                position: absolute;
                top: 50%;
                left: 50%;
                transform:translate(-50%,-50%);
                // transform-origin:0 0;
                transition:transform .3s;
            }
            iframe{
                width: 65%;
                height: 80%;
            }
        }
    }
</style>