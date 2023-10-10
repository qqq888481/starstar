<template>
  <div id="model">
    <div class="stationmodel">
      <div class="water-model-header">
        <span class="water-model-header-text">选择展示站点</span>
        <img
          src="../../assets/waterimage/close.png"
          alt=""
          class="water-model-header-img"
          @click="headerStates.closeModel"
        />
      </div>
      <div class="water-model-select">
        <button style="border-left: 1px solid #cdd3ec" class="water-model-select-btn water-model-select-btn-active">
          全部
        </button>
        <button class="water-model-select-btn">国控站</button>
        <button class="water-model-select-btn">省控站</button>
        <button class="water-model-select-btn">市控站</button>
        <a-radio-group v-model:value="headerStates.value" style="margin-left: 50rem">
          <a-radio :value="1">河流</a-radio>
          <a-radio :value="2">行政区</a-radio>
        </a-radio-group>
      </div>
      <div style="padding: 0 20rem">
        区域选择:
        <a-select
          v-model:value="headerStates.selectValue"
          mode="multiple"
          style="300"
          placeholder="Select Item..."
          :max-tag-count="headerStates.maxTagCount"
          :options="options"
        ></a-select>
      </div>
      <div class="water-model-content">
        <div>
          按首字母：<span v-for="item in headerStates.stationList" class="water-model-letter">{{ item.text }}</span>
        </div>
        <div class="water-model-position-infobox" v-for="ele in headerStates.stationList">
          <div class="water-model-circle">{{ ele.text }}</div>
          <div class="water-model-position-testbox">
            <span v-for="item in ele.positionlist" class="water-model-position-test">{{ item.name }}</span>
          </div>
        </div>
      </div>
      <div class="water-model-footer">
        <button class="water-model-footer-btn" @click="headerStates.closeModel">取消</button>
        <button class="water-model-footer-btn btnok" @click="headerStates.okModel">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
const props = defineProps({
  headerState: Object
})
const options = ref([])
for (let i = 10; i < 36; i++) {
  const value = i.toString(36) + i
  options.value.push({
    label: `Long Label: ${value}`,
    value
  })
}
const headerStates = reactive({
  maxTagCount: 2,
  selectValue: ['a10', 'c12', 'h17', 'j19', 'k20'],
  value: 1,
  stationList: [
    {
      index: 1,
      text: 'A',
      positionlist: [
        { index: 1, name: '安丘新安' },
        { index: 2, name: '安丘官庄' },
        { index: 3, name: '安丘石堆' },
        { index: 4, name: '安丘景芝' },
        { index: 5, name: '安丘金冢子' },
        { index: 6, name: '安丘石埠子' },
        { index: 7, name: '安丘辉渠' },
        { index: 8, name: '安丘大盛' },
        { index: 9, name: '安丘柘山' },
        { index: 10, name: '安丘吾山' },
        { index: 11, name: '安丘青云山' },
        { index: 12, name: '安丘青云湖小区' },
        { index: 13, name: '安丘兴安' },
        { index: 14, name: '安丘凌河' }
      ]
    },
    {
      index: 2,
      text: 'B',
      positionlist: [
        { index: 1, name: '安丘新安' },
        { index: 2, name: '安丘官庄' },
        { index: 3, name: '安丘石堆' },
        { index: 4, name: '安丘景芝' },
        { index: 5, name: '安丘金冢子' },
        { index: 6, name: '安丘石埠子' },
        { index: 7, name: '安丘辉渠' },
        { index: 8, name: '安丘大盛' },
        { index: 9, name: '安丘柘山' },
        { index: 10, name: '安丘吾山' },
        { index: 11, name: '安丘青云山' },
        { index: 12, name: '安丘青云湖小区' },
        { index: 13, name: '安丘兴安' },
        { index: 14, name: '安丘凌河' }
      ]
    },
    {
      index: 3,
      text: 'C',
      positionlist: [
        { index: 1, name: '安丘新安' },
        { index: 2, name: '安丘官庄' },
        { index: 3, name: '安丘石堆' },
        { index: 4, name: '安丘景芝' },
        { index: 5, name: '安丘金冢子' },
        { index: 6, name: '安丘石埠子' },
        { index: 7, name: '安丘辉渠' },
        { index: 8, name: '安丘大盛' },
        { index: 9, name: '安丘柘山' },
        { index: 10, name: '安丘吾山' },
        { index: 11, name: '安丘青云山' },
        { index: 12, name: '安丘青云湖小区' },
        { index: 13, name: '安丘兴安' },
        { index: 14, name: '安丘凌河' }
      ]
    },
    {
      index: 4,
      text: 'D',
      positionlist: [
        { index: 1, name: '安丘新安' },
        { index: 2, name: '安丘官庄' },
        { index: 3, name: '安丘石堆' },
        { index: 4, name: '安丘景芝' },
        { index: 5, name: '安丘金冢子' },
        { index: 6, name: '安丘石埠子' },
        { index: 7, name: '安丘辉渠' },
        { index: 8, name: '安丘大盛' },
        { index: 9, name: '安丘柘山' },
        { index: 10, name: '安丘吾山' },
        { index: 11, name: '安丘青云山' },
        { index: 12, name: '安丘青云湖小区' },
        { index: 13, name: '安丘兴安' },
        { index: 14, name: '安丘凌河' }
      ]
    },
    {
      index: 5,
      text: 'E'
    },
    {
      index: 6,
      text: 'F'
    },
    {
      index: 7,
      text: 'G'
    },
    {
      index: 8,
      text: 'H'
    },
    {
      index: 9,
      text: 'I'
    },
    {
      index: 10,
      text: 'J'
    },
    {
      index: 11,
      text: 'K'
    },
    {
      index: 12,
      text: 'L'
    },
    {
      index: 13,
      text: 'M'
    },
    {
      index: 14,
      text: 'N'
    },
    {
      index: 15,
      text: 'O'
    },
    {
      index: 16,
      text: 'P'
    },
    {
      index: 17,
      text: 'Q'
    },
    {
      index: 18,
      text: 'R'
    },
    {
      index: 19,
      text: 'S'
    },
    {
      index: 20,
      text: 'T'
    },
    {
      index: 21,
      text: 'U'
    },
    {
      index: 22,
      text: 'V'
    },
    {
      index: 23,
      text: 'W'
    },
    {
      index: 24,
      text: 'X'
    },
    {
      index: 25,
      text: 'Y'
    },
    {
      index: 26,
      text: 'Z'
    }
  ],
  closeModel: () => {
    props.headerState.showModel = false
  },
  okModel: () => {
    props.headerState.showModel = false
  }
})
onMounted(() => {})
onUnmounted(() => {})
</script>

<style lang="scss" scoped>
#model {
  // width: 100%;
  // height: 100%;
  // ------------------------
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  .stationmodel {
    position: absolute;
    top: 230rem;
    left: 499rem;
    width: 860rem;
    height: 550rem;
    background-color: #fff;
    z-index: 10000;
    .water-model-header {
      width: 860rem;
      height: 46rem;
      background: #f9f9f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20rem;
      .water-model-header-text {
        font-size: 16rem;
        font-family: Microsoft YaHei;
        font-weight: bold;
        color: #333333;
      }
      .water-model-header-img {
        width: 14rem;
        height: 13rem;
        cursor: pointer;
      }
    }
    .water-model-select {
      padding: 20rem;
      .water-model-select-btn {
        width: 56rem;
        height: 32rem;
        background: #ffffff;
        border: 1px solid #cdd3ec;
        border-radius: 3rem 0rem 0rem 3rem;
        font-size: 14rem;
        font-family: Microsoft YaHei;
        font-weight: 400;
        color: #666666;
        border-left: none;
        cursor: pointer;
      }
      .water-model-select-btn-active {
        background: #3074e2;
        color: #fff;
      }
    }
    .water-model-content {
      padding: 10rem 20rem;
      width: 860rem;
      height: 335rem;
      overflow: scroll;
      .water-model-letter {
        margin: 0 8rem;
        font-size: 14rem;
        font-family: Arial;
        font-weight: bold;
        color: #3074e2;
      }
      .water-model-position-infobox {
        margin-top: 29rem;
        display: flex;
        border-bottom: 1px dashed #999999;
        .water-model-circle {
          width: 36rem;
          height: 36rem;
          background: #999999;
          border-radius: 50%;
          font-size: 18rem;
          font-family: Arial;
          font-weight: bold;
          color: #ffffff;
          text-align: center;
          line-height: 36rem;
          margin: 0 30rem 30rem 0;
        }
        .water-model-position-testbox {
          width: 650rem;
          .water-model-position-test {
            margin-right: 30rem;
            margin-bottom: 18rem;
            font-size: 14rem;
            font-family: Microsoft YaHei;
            font-weight: 400;
            color: #333333;
            cursor: pointer;
          }
        }
      }
    }
    .water-model-footer {
      padding: 0 20rem;
      display: flex;
      justify-content: flex-end;
      .water-model-footer-btn {
        width: 65rem;
        height: 32rem;
        background: #ffffff;
        border: 1px solid #d9d9d9;
        border-radius: 4rem;
        font-size: 14rem;
        font-family: Microsoft YaHei;
        font-weight: 400;
        color: #666666;
        cursor: pointer;
        margin: 0 4rem;
      }
      .btnok {
        background: #0078e6;
        color: #ffffff;
      }
    }
  }
}
</style>
