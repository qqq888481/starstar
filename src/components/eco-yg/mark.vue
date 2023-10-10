
<script setup>
import { onMounted, onUnmounted, reactive, ref, computed, watch, toRefs } from 'vue'
import { ecologyStore } from '@/stores/ecology.js'
import markIcon from '@/assets/images/ecology/remark.png'
import closeIcon from '@/assets/images/ecology/close.png'
const store = ecologyStore()
const remarkInfo = reactive({
  markName: null,
  markContent: null,
  showState: false
})
const changeTipShow = () => {
  remarkInfo.showState = !remarkInfo.showState
}
const closeTip = () => {
  remarkInfo.showState = false
}
watch(() => store.curProduct,
  () => {
    remarkInfo.markName = store.curProduct.name
    remarkInfo.markContent = store.curProduct.remark

  }
)
/**
 * 提示组件
 */
</script>
<template>
  <div class="markContainer">
    <div class="markIcon" @click="changeTipShow">
      <img :src="markIcon" alt="" />
    </div>

    <div class="tip" v-show="remarkInfo.showState">

      <div class="markName">{{ remarkInfo.markName }}</div>
      <div class="markContent">{{ remarkInfo.markContent }}</div>

    </div>
  </div>
</template>
<style lang="scss" scoped>
.markContainer {
  position: absolute;
  left: 0rem;
  bottom: 250rem;

  .markIcon {
    position: absolute;
    width: 40rem;
    height: 40rem;
    top: 0rem;
    left: 0rem;



    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 13;
  }

  .tip {
    width: 270rem;
    background: #FFFFFF;
    box-shadow: 0px 0px 5px 0px rgba(70, 93, 139, 0.25);
    border-radius: 5px;
    position: absolute;
    left: 15rem;
    top: 20rem;
    box-sizing: border-box;
    padding-left: 25rem;
    z-index: 12;

    .markName {

      font-size: 14px;
      font-family: Microsoft YaHei;
      font-weight: 400;
      color: #1989FA;
      margin-top: 6rem;
      margin-bottom: 5rem;
    }

    .markContent {
      font-size: 12px;
      font-family: Microsoft YaHei;
      font-weight: 400;
      color: #999999;
      margin-bottom: 13rem;
      padding-right: 25rem;
    }
  }
}
</style>