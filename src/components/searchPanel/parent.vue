<template>
  <div id="parent">
    <SearchPanel ref="searchPanel" :formData="formData" @search="search" />
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, onUnmounted } from 'vue'
// 父组件查询
import SearchPanel from '@/components/searchPanel/index.vue'

import { standardAry, goalManage, autoStandardAry } from '@/components/searchPanel/search.js'

const formData = reactive({
  formType: autoStandardAry,
  formValue: {},
  height: '112rem' // 112rem 64rem
})

const searchPanel = ref() // 查询组件

const search = type => {
  console.log(type, formData)
  const formValue = searchPanel._value.formData.formValue
  console.log(formValue)
}

defineExpose({
  formData
})
</script>

<style lang="scss" scoped>
#parent {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #efefef;
}
</style>
