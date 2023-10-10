<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import { ref } from 'vue'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const locale = ref(zhCN)

let changeSideWidth = () => {
  let dom = document.querySelector('.left-side')
  if (dom.clientWidth >= 200) {
    dom.style.width = '50rem'
  } else {
    dom.style.width = '230rem'
  }
}
import { routes } from '@/router/index.js'
import { useRouter } from 'vue-router'
const routerPush = useRouter()
let toRouter = route => {
  routerPush.push({ path: route.path })
}
let routeList = ref(routes)

let isSHowOuter = ref(false) //是否显示外边框架
</script>

<template>
  <a-config-provider :locale="locale">
    <div class="home-outer">
      <div class="home-header" v-if="isSHowOuter"></div>
      <div class="home-content">
        <div class="left-side" @click="changeSideWidth()" v-if="isSHowOuter">
          <div v-for="(route, index) in routeList" @click.stop="toRouter(route)">
            {{ route.name }}
          </div>
        </div>
        <div class="right-content">
          <router-view v-slot="{ Component }">
            <keep-alive :exclude="['EcoYg', 'EcoAssment', 'EcoSerVice', 'EcoQuality']">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>
      </div>
    </div>
  </a-config-provider>
</template>

<style lang="scss">
.home-outer {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .home-header {
    height: 64rem;
    background-color: green;
    flex-shrink: 0;
  }
  .home-content {
    height: 100%;
    display: flex;
    justify-content: flex-start;
    overflow: hidden;
    .left-side {
      width: 230rem;
      background-color: #0096ff;
      flex-shrink: 0;
      height: 100%;
      overflow: auto;
      padding-top: 100rem;
      div {
        height: 40rem;
        line-height: 40rem;
        padding-left: 30rem;
        color: #e0e7ec;
        cursor: pointer;
      }
    }
    .right-content {
      width: 100%;
      position: relative;
      overflow: hidden;
    }
  }
}
* {
  user-select: none;
}

/*滚动条整体*/
::-webkit-scrollbar {
  width: 4rem;
  height: 6rem;
  z-index: 9999999;
  cursor: pointer;
}

/*滑块*/
::-webkit-scrollbar-thumb {
  background-color: #0096ff;
  border-radius: 10rem;
  height: 60rem;
  width: 20rem;
  z-index: 9999999;
}

.cesium-widget {
  canvas {
    height: 100%;
    width: 100%;
    position: absolute;
  }
}

::-webkit-scrollbar-thumb:hover {
  background-color: #0096ff;
}

/*滑道*/
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6rem #e0e7ec;
  border-radius: 2rem;
}

@media screen and (min-width: 2160px) {
  html,
  body {
    font-size: 1.2px;
  }
}

@media screen and (max-width: 2160px) {
  html,
  body {
    font-size: 1.2px;
  }
}

@media screen and (max-width: 1920px) {
  html,
  body {
    font-size: 1px;
  }
}

@media screen and (max-width: 1366px) {
  html,
  body {
    font-size: 0.8px;
  }
}

@media screen and (max-width: 2880px) {
  html,
  body {
    font-size: 1px;
  }
}

@font-face {
  font-family: Hiragino Sans GB;
  src: url('./assets/font/Hiragino-Sans-GB-W6.ttf');
}

@font-face {
  font-family: Hiragino W3;
  src: url('./assets/font/Hiragino Sans GB W3.otf');
}

@font-face {
  font-family: Hiragino W6;
  src: url('./assets/font/Hiragino Sans GB W6.otf');
}

@font-face {
  font-family: PangMenZhengDaoBiao;
  src: url('./assets/font/PangMenZhengDaoBiaoTiTi-1.ttf');
}

@font-face {
  font-family: D-DIN-Bold;
  src: url('./assets/font/D-DIN-Bold.otf');
}

@font-face {
  font-family: D-DIN;
  src: url('./assets/font/D-DIN.otf');
}

@font-face {
  font-family: YouSheBiaoTiHei;
  src: url('./assets/font/YouSheBiaoTiHei-2.ttf');
}

@font-face {
  font-family: HuXiaoBo-NanShen;
  src: url('./assets/font/HuXiaoBoNanShenTi-2.otf');
}

html,
body,
#app {
  height: 100%;
}
</style>
