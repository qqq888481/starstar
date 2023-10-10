<template>
  <div id="search-form">
    <div class="left-form">
      <div class="form-item" v-for="(formItem, index) in searchFormList" :key="index" v-show="formItem.show" :style='formItem.isMarginRight?"margin-right:0":""'>
        <div class="form-name" v-if="formItem.name != ''">{{ formItem.name + '：' }}</div>
        <div class="form-input" :style="'width:' + formItem.width" v-if="formItem.type == 'select'"
          :placeholder="formItem.placeholder">
          <a-select style="width: 100%" show-search v-model:value="formItem.value" :maxTagCount="1"
            @change="formItem.chooseList.length > 0 && formItem.chooseList[0].value == 'all' ? selectMoreChoose(formItem.change, index) : formItem.change(formItem.value)"
            :mode="formItem.chooseList.length > 0 && formItem.chooseList[0].value == 'all' ? 'multiple' : ''">
            <a-select-option v-for="(choose, index1) in formItem.chooseList" :key="index1"
              :value="choose.value">{{ choose.label }}</a-select-option>
          </a-select>
        </div>
        <div class="form-input" :style="'width:' + formItem.width" v-if="formItem.type == 'time'"
          :placeholder="formItem.placeholder">
          <a-date-picker style="width: 100%" v-model:value="formItem.value" :picker="formItem.detail"
            :valueFormat="formItem.showType" @change="formItem.change(formItem.value)" />
        </div>
        <div class="form-input" :style="'width:' + formItem.width" v-if="formItem.type == 'input'">
          <a-input style="width: 100%" v-model:value="formItem.value" :placeholder="formItem.placeholder"
            @change="formItem.change(formItem.value)" />
        </div>
        <div class="form-input" :style="'width:' + formItem.width" v-if="formItem.type == 'cascader'">
          <a-cascader style="width: 100%" v-model:value="formItem.value"
            :multiple="formItem.chooseList.length > 0 && formItem.chooseList[0].value == 'all' ? true : false"
            :maxTagTextLength="3" :maxTagCount="2" :options="formItem.chooseList" :placeholder="formItem.placeholder"
            @change="formItem.chooseList.length > 0 && formItem.chooseList[0].value == 'all' ? cascaderMoreChoose(formItem.change, index) : formItem.change(formItem.value)" />
        </div>
        <div class="form-input" :style="'width:' + formItem.width" v-if="formItem.type == 'timeRange'">
          <a-space style="width: 100%" direction="vertical">
            <a-range-picker v-model:value="formItem.value"
              :show-time="formItem.timeType ? { format: formItem.timeType } : null" :picker="formItem.detail"
              @change="formItem.change(formItem.value)" :format="formItem.showType" :valueFormat="formItem.showType" />
          </a-space>
        </div>
        <div class="form-input" :style="'width:' + formItem.width" v-if="formItem.type == 'radio'">
          <a-radio-group v-model:value="formItem.value" @change="formItem.change(formItem.value)">
            <a-radio v-for="(choose, index1) in formItem.chooseList" :key="index1"
              :value="choose.value">{{ choose.label }}</a-radio>
          </a-radio-group>
        </div>
        <div class="form-input" :style="'width:' + formItem.width" v-if="formItem.type == 'chooseBtn'">
          <div
            :class='(formItem.value.indexOf(choose.value) >= 0 || formItem.value == choose.value) ? "chooseBtn choose" : "chooseBtn"'
            v-for="(choose, index1) in formItem.chooseList" :key="index1" :value="choose.value"
            @click='changeChooseBtn(formItem, choose)'>{{ choose.label }}</div>
        </div>
        <div class="form-input" :style="'width:' + formItem.width" v-if="formItem.type == 'checkbox'">
          <a-checkbox-group v-model:value="formItem.value" @change="formItem.change(formItem.value),setOnlyChoose(formItem)">
            <a-checkbox v-for="(item, index1) in formItem.chooseList" :key="index1"
              :value="item.value">{{ item.label }}</a-checkbox>
          </a-checkbox-group>
        </div>
      </div>
    </div>
    <div class="right-btn" v-if="searchFormList[searchFormList.length - 1].isOperate">
      <div class="btn" @click="operateBtn('search')">查询</div>
      <div class="btn" @click="operateBtn('clear')">重置</div>
    </div>
  </div>
</template>

<script>
import { reactive, watch, onMounted, onUnmounted, toRefs, nextTick } from 'vue'
import * as echarts from 'echarts'
export default {
  setup(props, { attrs, slots, emit }) {
    let searchForm = reactive({
      setOnlyChoose(formItem){//设置至少选中一个
        if(formItem.value.length==0){
          formItem.value = [formItem.chooseList[0].value]
        }
      },
      getNewFormValue() {//获取实际查询的值
        let data = []
        searchForm.searchFormList.slice(0, searchForm.searchFormList.length - 1).map((form, index) => {
          if (form.type == 'cascader' && form.chooseList.length > 0 && form.chooseList[0].value == 'all') {
            let chooseValue = []
            form.value.map(item => {//处理原始格式
              if (item.length == 2 && item[0] != 'all') {//获取级联数据中值为子项全选的数据并且不是all
                chooseValue.push(item[1])
              } else if (item.length == 1 && item[0] != 'all') {//获取级联数据中值为子项部分选择的数据并且不是all
                form.chooseList.filter(river => river.value == item[0])[0]?.children.map(section => {
                  chooseValue.push(section.value)
                })
              }
            })
            data.push(chooseValue)
          } else if (form.type == 'select' && form.chooseList.length > 0 && form.chooseList[0].value == 'all') {
            let chooseValue = []
            form.value.map(item => {//处理原始格式
              if(item!= 'all'){
                chooseValue.push(item)
              }
            })
            data.push(chooseValue)
          } else {
            data.push(form.value)
          }
        })
        return data
      },
      operateBtn(type) {
        if (type == 'search') {
          searchForm.searchFormList[searchForm.searchFormList.length - 1].search(searchForm.getNewFormValue())
        } else if (type == 'clear') {
          searchForm.searchFormList[searchForm.searchFormList.length - 1].clear()
        }
      },
      searchFormList: attrs.searchFormList, //查询表单渲染数据
      addWatchSelect: [], //用于判断下拉框只进行一次监听处理添加的操作
      addWatchSelectWatch() {//添加下拉框监听
        if (searchForm.addWatchSelect.length > 0) return
        attrs.searchFormList.map((item, index) => {
          searchForm.addWatchSelect.push('')
          if (item.type == 'select' && item.chooseList.length > 0 && item.chooseList[0].value == 'all') {
            watch(//多选级联框点击结束后监听事件
              () => searchForm.searchFormList[index].value,
              (news, olds) => {
                if (news.find(choose => choose == 'all') && !olds.find(choose => choose == 'all')) {//点击后有all,之前没有all,所以添加了全选
                  searchForm.addWatchSelect[index] = 'addAll' //index是为了区分不同得级联狂监听事件
                } else if (!news.find(choose => choose == 'all') && olds.find(choose => choose == 'all')) {//点击前有all,之后没有all，所以取消了全选
                  searchForm.addWatchSelect[index] = 'closeAll'
                } else {//点之前，之后都没有all,说明没有点击全选
                  searchForm.addWatchSelect[index] = 'clickOther'
                }
                
              },
              { deep: true }
            )
          }
        })
      },
      addWatchCascader: [], //用于判断级联框只进行一次监听处理添加
      addWatchCascaderWatch() {//添加多选级联框监听
        if (searchForm.addWatchCascader.length > 0) return
        attrs.searchFormList.map((item, index) => {
          searchForm.addWatchCascader.push('')
          if (item.type == 'cascader' && item.chooseList.length > 0 && item.chooseList[0].value == 'all') {
            watch(//多选级联框点击结束后监听事件
              () => searchForm.searchFormList[index].value,
              (news, olds) => {
                if (news.find(choose => choose[0] == 'all') && !olds.find(choose => choose[0] == 'all')) {//点击后有all,之前没有all,所以添加了全选
                  searchForm.addWatchCascader[index] = 'addAll' //index是为了区分不同得级联狂监听事件
                } else if (!news.find(choose => choose[0] == 'all') && olds.find(choose => choose[0] == 'all')) {//点击前有all,之后没有all，所以取消了全选
                  searchForm.addWatchCascader[index] = 'closeAll'
                } else {//点之前，之后都没有all,说明没有点击全选
                  searchForm.addWatchCascader[index] = 'clickOther'
                }
              },
              { deep: true }
            )
          }
        })
      },
      selectMoreChoose(changeCallback, index = -1) {//单一下拉框全选事件
        setTimeout(() => {
          if (searchForm.addWatchSelect[index] == 'addAll') {//添加了全选
            searchForm.searchFormList[index].value = []
            searchForm.searchFormList[index].chooseList.map(item => {
              searchForm.searchFormList[index].value.push(item.value)
            })
          } else if (searchForm.addWatchSelect[index] == 'closeAll') {//取消了全选
            searchForm.searchFormList[index].value = []
          } else {
            if (//单一选择了除全选外的全部按钮添加全选
              searchForm.searchFormList[index].value.length == searchForm.searchFormList[index].chooseList.length - 1 &&
              searchForm.searchFormList[index].value.every(choose => choose != 'all')
            ) {
              searchForm.searchFormList[index].value.unshift('all')
            } else {//单一取消了除全选外的某一个选项时取消全选按钮
              let allIndex = searchForm.searchFormList[index].value.findIndex(choose => choose == 'all')
              searchForm.searchFormList[index].value.splice(allIndex, allIndex + 1)
            }
          }
          changeCallback(searchForm.getNewFormValue()[index])
        }, 10)
      },
      cascaderMoreChoose(changeCallback, index) {//层级下拉框全选事件
        setTimeout(() => {
          if (searchForm.addWatchCascader[index] == 'addAll') {//添加了全选
            searchForm.searchFormList[index].value = []
            searchForm.searchFormList[index].chooseList.map(item => {
              searchForm.searchFormList[index].value.push([item.value])
            })
          } else if (searchForm.addWatchCascader[index] == 'closeAll') {//取消了全选
            searchForm.searchFormList[index].value = []
          } else {
            if (//单一选择了除全选外的全部按钮添加全选
              searchForm.searchFormList[index].value.length == searchForm.searchFormList[index].chooseList.length - 1 &&
              searchForm.searchFormList[index].value.every(choose => choose.length == 1 && choose[0] != 'all')
            ) {
              searchForm.searchFormList[index].value.unshift(['all'])
            } else {//单一取消了除全选外的某一个选项时取消全选按钮
              let allIndex = searchForm.searchFormList[index].value.findIndex(choose => choose[0] == 'all')
              searchForm.searchFormList[index].value.splice(allIndex, allIndex + 1)
            }
          }
          changeCallback(searchForm.getNewFormValue()[index])
        }, 10)
      },
      changeChooseBtn(formItem, choose) {
        if (formItem.chooseType == 'one') {
          formItem.value = choose.value
        } else if (formItem.chooseType == 'more') {
          let valueIndex = formItem.value.indexOf(choose.value)
          if (valueIndex >= 0) {
            formItem.value.splice(valueIndex, valueIndex + 1)
          } else {
            formItem.value.push(choose.value)
          }
        }
        formItem.change(formItem.value)
      }
    })

    onMounted(() => { })
    onUnmounted(() => { })

    watch(
      //监听方向变化
      () => attrs.searchFormList,
      (news, old) => {
        searchForm.searchFormList = news
        searchForm.addWatchCascaderWatch()
        searchForm.addWatchSelectWatch()
      },
      { deep: true }
    )
    return {
      ...toRefs(searchForm)
    }
  }
}
</script>

<style lang="scss">
#search-form {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;

  .left-form {
    width: calc(100%);
    height: 100%;
    display: flex;
    flex-wrap: wrap;

    .form-item {
      margin-right: 40rem;
      height: 42rem;
      display: flex;
      align-items: center;

      .ant-select-selection-overflow {
        //多选项不够不给换行
        flex-wrap: nowrap;
      }

      .ant-select-multiple .ant-select-selection-item-content {
        //定义多选模式单个选项显示得长度 为了获取自定义selectOpition节点所选中项，与maxTagTextLength属性冲突
        width: 40rem;
      }

      .form-input {
        display: flex;
      }

      .chooseBtn {
        min-width: 70rem;
        padding: 0 10rem;
        height: 30rem;
        line-height: 30rem;
        text-align: center;
        border: 1px solid darkgray;
        border-right: none;
        cursor: pointer;
      }

      .chooseBtn:first-child {
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
      }

      .chooseBtn:last-child {
        border-right: 1px solid darkgray;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
      }
      border-top: 2px;
      .choose {
        background-color: #E6F1FC;
        color: #1989FA;
        border: 1px solid #1989FA;
      }
    }
  }

  .right-btn {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;

    .btn {
      width: 70rem;
      height: 32rem;
      background-color: #f8f9ff;
      border-radius: 3px 3px 3px 3px;
      border: 1px solid #cdd3ec;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14rem;
      font-family: MicrosoftYaHei;
      color: #666666;
      margin-left: 10rem;
    }
  }
}</style>
