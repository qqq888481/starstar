<script setup>
/**
 * 产品分类组件
 */
import { onMounted, onUnmounted, ref, toRefs, computed, watch } from 'vue'
import { ecologyStore } from '@/stores/ecology.js'
import { getName } from '@/common/dataFn.js'
const store = ecologyStore()
const props = defineProps({
  product: Object,
  panel: Object,
  pic: Object,
  legend: Object
})
let curProductId = ref(null)
let parentName = ref(null)
const { product, panel, pic, legend } = toRefs(props)
const chooseCurProduct = item => {
  store.curProduct = item
}
watch(
  () => store.curProduct,
  () => {
    curProductId.value = store.curProduct.id
    if (store.curProduct.parentName === '生态环境监测') {
      parentName.value = '生态遥感监测'
    } else {
      parentName.value = store.curProduct.parentName
    }

    //获取时间周期
    panel.value.getTime(curProductId.value)
  }
)
</script>
<template>
  <div id="productList">
    <span class="title">{{ parentName }}</span>
    <span v-for="(item, index) in product.listData" :key="index" @click="chooseCurProduct(item)"
      :class="curProductId == item.id ? 'curProduct' : 'unChooseProduct'">
      {{ item.name }}
    </span>
  </div>
</template>
<style lang="scss" scoped>
#productList {
  position: absolute;
  width: 150rem;
  top: 22rem;
  left: 20rem;
  // background: #FFFFFF;
  box-shadow: 0rem 0rem 5rem 0rem rgba(70, 93, 139, 0.25);
  border-radius: 8rem 8rem 8rem 8rem;
  font-size: 14rem;
  overflow: hidden;

  span {
    height: 40rem;
    display: block;
    line-height: 40rem;
    text-align: center;
    cursor: pointer;
  }

  .title {
    font-size: 14rem;
    font-family: Microsoft YaHei-Regular, Microsoft YaHei, sans-serif;
    font-weight: 400;
    color: #333333;
    background: #ffffff;
    cursor: auto;
  }

  .curProduct {
    background: #d9eaff;
    font-size: 14rem;
    font-family: Microsoft YaHei, sans-serif;
    font-weight: 400;
    color: #333333;
  }

  .unChooseProduct {
    border: 0;
    background: rgba(255, 255, 255, 0.8);
    font-family: Microsoft YaHei, sans-serif;
    font-weight: 400;
    color: #666666;
  }
}
</style>
