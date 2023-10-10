<template>
  <div id="search-panel">
    <div class="wrap" :style="{ height: formData.height }">
      <div class="content" v-for="array in formData.formType">
        <template v-for="item in array">
          <div class="box" v-if="item.type === 'select'">
            <div class="item">
              <label for="">{{ item.label }} ：</label>
              <a-select
                v-model:value="formData.formValue[item.valueName]"
                :options="item.options"
                :mode="item.mode"
              ></a-select>
            </div>
          </div>
          <div :class="[!item.labelShow ? 'box radio' : 'box']" v-if="item.type === 'radio'">
            <div class="item">
              <label for="" v-if="item.labelShow">{{ item.label }} ：</label>
              <a-radio :checked="formData.checked" name="radio" @change="e => radioChange(e, 0)"> </a-radio>
              <a-select v-model:value="formData.formValue[item.valueName]" :options="item.options"></a-select>
            </div>
          </div>
          <div class="box radio" v-if="item.type === 'riverRadio'">
            <div class="item">
              <label for="" v-if="item.labelShow">{{ item.label }} ：</label>
              <a-radio :checked="!formData.checked" name="radio" @change="e => radioChange(e, 1)"> </a-radio>
              <a-select v-model:value="formData.formValue[item.valueName]" :options="item.options"></a-select>
            </div>
          </div>
          <div class="box" v-if="item.type === 'rangePicker'">
            <div class="item">
              <label for="">{{ item.label }} ：</label>
              <a-range-picker
                style="width: 333rem"
                v-model:value="formData.formValue[item.valueName]"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                :show-time="{
                  hideDisabledOptions: true
                  // defaultValue: [dayjs('00:00', 'HH:mm:ss'), dayjs('11:59', 'HH:mm:ss')]
                }"
                :allowClear="false"
              />
            </div>
          </div>
          <div class="box" v-if="item.type === 'checkbox'">
            <div class="item">
              <label for="">{{ item.label }} ：</label>
              <a-checkbox-group v-model:value="formData.formValue[item.valueName]" :options="item.options" />
            </div>
          </div>
        </template>
      </div>
      <div class="search-btn">
        <a-button class="query-btn" @click="search('search')">查询</a-button>
        <a-button class="reset-btn" @click="search('reset')">重置</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, onUnmounted } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

const emit = defineEmits(['search'])

let formData = reactive({
  formType: [],
  formValue: {},
  height: '64rem',
  checked: true,
  areaValue: 0
})

const radioChange = (e, v) => {
  console.log(e, v)
  formData.checked = !formData.checked
  formData.areaValue = v
  formData.formValue['areaValue'] = v
}

onMounted(() => {
  console.log(props.formData.formType)
  formData.formType = props.formData.formType
  for (const element of props.formData.formType) {
    element.map(item => {
      formData.formValue[item.valueName] = item.defaultValue
    })
  }
  formData.formValue['areaValue'] = formData.areaValue
  formData.height = props.formData.height
  console.log(formData)
})

const search = type => {
  emit('search', type)
}
defineExpose({
  formData
})
</script>

<style lang="scss" scoped>
#search-panel {
  width: 100%;
  height: 200px;
  position: relative;

  .wrap {
    width: calc(100% - 32rem);
    height: 64rem;
    background: #fff;
    border-radius: 8rem;
    padding: 16rem;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    display: grid;
    grid-row-gap: 16rem;

    .content {
      width: 100%;
      display: flex;
      align-items: center;
      grid-column-gap: 40rem;
    }
    .box {
      display: inline-grid;
      grid-column-gap: 40rem;
      .item {
        .ant-select {
          width: 110rem;
        }
      }
      &.radio {
        margin-left: -25rem;
      }
    }

    .search-btn {
      position: absolute;
      bottom: 16rem;
      right: 16rem;
      .query-btn,
      .reset-btn {
        margin-left: 10rem;
        background: #f8f9ff;
        border: 1px solid #cdd3ec;
      }
    }
  }
}
</style>
