<template>
 <a-form :class='formStyleName'>
    <div v-for="(item, index) in formType" v-show='!item.isAuto||autoList.indexOf(item.isAuto)>=0' :key="index" :class='item.className?item.className+" form-item":"form-item"'>
        <div class='item-label'>
          <span v-if='item.isNull' style="color:red">*</span>{{item.label+":"}}
        </div>
        <div class='item-input'>
          <a-input v-if="item.type == 'input'" :readonly="item.readonly" v-model:value="formValue[item.valueName]" />
          <!--单行文本框-->
          <a-radio-group v-if="item.type == 'radio'" v-model:value="formValue[item.valueName]">
            <a-radio v-for="(item1, index1) in item.chooseList" :key="item.valueName + index1"  :value="item1.value">{{ item1.label }}</a-radio>
          </a-radio-group>
          <!--单选框-->
          <a-checkbox-group v-if="item.type == 'checkbox'" v-model:value="formValue[item.valueName]">
            <a-checkbox v-for="(item1, index1) in item.chooseList" :key="item.valueName + index1" :value="item1.value">{{ item1.label }}</a-checkbox>
          </a-checkbox-group>
          <!--多选框-->
          <a-select show-search style="width: 100%" dropdownClassName="select-down-style" v-if="item.type == 'select'" v-model:value="formValue[item.valueName]" @change="autoFill(item)" >
            <a-select-option v-for="(item1, index1) in item.chooseList" :key="item.valueName + index1" :value="item1.value" >{{ item1.label }}</a-select-option >
          </a-select>
          <!--下拉框-->
          <a-select :options='item.chooseList' mode='multiple' :maxTagTextLength='10' style="width: 100%" dropdownClassName="select-down-style" v-if="item.type == 'moreSelects'" v-model:value="formValue[item.valueName]" @change="maxChoose(item)"></a-select>
          <!--多选下拉框-->
          <a-textarea v-if="item.type == 'textarea'" v-model:value="formValue[item.valueName]" :auto-size="{ minRows: item.size[0], maxRows: item.size[1] }" />
          <!--文本域-->
          <a-date-picker dropdownClassName="data-down-style" style="width: 100%" v-if="item.type == 'dateDay'" v-model:value="formValue[item.valueName]" valueFormat="YYYY-MM-DD" />
          <!--日选择器-->
          <a-date-picker dropdownClassName="data-down-style" style="width: 100%" v-if="item.type == 'dateMonth'" v-model:value="formValue[item.valueName]" valueFormat="YYYY-MM" picker="month" />
          <!--月选择器-->
          <a-date-picker dropdownClassName="data-down-style" style="width: 100%" v-if="item.type == 'dateYear'" v-model:value="formValue[item.valueName]" valueFormat="YYYY" picker="year" />
          <!--年选择器-->
          <a-input-number style="width: 100%" v-if="item.type == 'number'" v-model:value="formValue[item.valueName]" :min="item.size[0]" :max="item.size[1]" />
          <!--数字选择器-->
          <a-cascader dropdownClassName="cascader-down-style" v-if="item.type == 'cascader'" v-model:value="formValue[item.valueName]" :options="item.chooseList"  />
          <!--层级下拉框-->
          <div v-if="item.type == 'lonLat'" class='lonLat'>
            <div class='left-lonLat-box'>{{formValue[item.valueName]}}</div>
            <div class='right-icon' @click="inMapModelClick">
              <AimOutlined style='font-size:14rem'/>
            </div>
          </div>
          <div v-if="item.type == 'file'" class='file-input'>
            <div class='file-show-box'>
              <div v-for='(file,fileIndex) in formValue[item.valueName]'  class='file-item'>
                <div class="text" :title="file.name" @click="openFile(file)">{{file.name}}</div>
                <a-popconfirm
                  title="确认删除吗?"
                  @confirm="removeFile(file)"
                >
                  <div class='close'>x</div>
                </a-popconfirm>
              </div>
            </div>
            
            <div class='upload-file-icon' >
              <a-upload
                :customRequest='uploadFile'
                :file-list='[]'
                :multiple="true"
              >
                <ToTopOutlined style='font-size:14rem'/>
                <!-- <img src="@/assets/images/emergency/Home/uploadFile-icon.png" alt=""> -->
              </a-upload>
            </div> 
          </div>
          <!--文件上传返显框-->
        </div>        
    </div>
    <Loading v-show='loading'></Loading>
  </a-form>
</template>

<script>
import { ref, reactive, toRefs, inject, onMounted } from "vue";
import Loading from './loading.vue'
import {ToTopOutlined,AimOutlined} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue';
export default {
  components:{Loading,ToTopOutlined,AimOutlined},
  setup(props, { attrs }) {
    let formData = reactive({
      formType: attrs.formData.formType,
      formValue: {},
      formStyleName: attrs.formData.formStyleName,//表单样式名
      autoList:[],//被填充的表单项值名
      rowId:attrs.formData.rowId,//数据行id
    });
    const FileFun = inject('FileFun')//接受主线传递文件操作方法
    let formFun = reactive({
      removeFile(file){
        FileFun.removeFile(formData.formValue,file,formFun.openLoading,formFun.closeLoading)
      },//文件删除方法
      openFile(file){
        FileFun.openFile(file)
      },//文件预览方法
      uploadFile(file){
        FileFun.uploadFile(formData.formValue,file,formFun.openLoading,formFun.closeLoading)
      },//上传文件方法
      loading:false,//加载框dom
      openLoading(){
        formFun.loading = true
      },//打开加载
      closeLoading(){
        formFun.loading = false
      },//关闭加载框
      maxChoose(item){
        let nowChooseNum = formData.formValue[item.valueName].length
        if(nowChooseNum>item.maxChoose){
          message.info('最多只能选'+item.maxChoose+'个')
          formData.formValue[item.valueName]=formData.formValue[item.valueName].slice(0,nowChooseNum-1)//删除超出选择的一个数据
        }
      },//=多选下拉框最大数校验
      autoFill(mail){//自动填充方法
        //1.当该项表单showAutoItem存在时，判断该项表单所填值等于showAutoItem，等于则向应当显示的填充数组中添该项的的值名，
        //  那么在表单v-for时如果携带该值名就会识别该被填充项应当显示
        //2.当该项表单showAutoItem存在时，判断该项表单所填值不等于showAutoItem，则移除应当显示的填充数组中添该项的的值名，
        //  那么在表单v-for时如果携带该值名就会识别该被填充项就不会被显示
        //3.其他下拉不存在showAutoItem的表单项不触发该方法或者自定在添加if用其他操作（如选择了不同的项，其他常规显示的项则自动填充内容）
        //4.(mail.showAutoItem+'')!="undefined"是为了当有选项为0时，如果直接判断是否存在那么0存在，但是和false相等不会进入判断
        if((mail.showAutoItem+'')!="undefined"&&formData.formValue[mail.valueName]==mail.showAutoItem){
          if(formData.autoList.indexOf(mail.valueName)<0){//在打开时会为每一项表单执行如果之前已经未添加则添加该值名
              formData.autoList.push(mail.valueName)
          }
        }else if((mail.showAutoItem+'')!="undefined"&&formData.formValue[mail.valueName]!=mail.showAutoItem){
          if(formData.autoList.indexOf(mail.valueName)>=0){//在打开时会为每一项表单执行如果之前已经添加则进行删除
            formData.autoList.splice(formData.autoList.indexOf(mail.valueName),1)
          }
        }
      },
      inMapModelClick(){//进入地图选点模式
        attrs.formData.getLonLatBtnShow=true//显示确认按钮图标
        FileFun.inMapModelClick()//修改地图模式
      }
    })
    onMounted(()=>{
      attrs.formData.formType.map((item) => {//表单初始显示值填充
        if(item.valueName=="files"&&attrs.formData.formValue.files){//文件行调查询文件方法
            FileFun.lookFilesAddress(formData.formValue,attrs.formData.formValue.files)//调用查询多个文件地址的方法
        }else{
          formData.formValue[item.valueName] = attrs.formData.formValue[item.valueName];//默认赋值，有值赋值无值赋undefined
          if((item.showAutoItem+'')!="undefined"){//判断有无联动显示的属性，如果有符合填充的条件则执行自动填充的方法
            formFun.autoFill(item)
          }
        } 
      })
    })
    return {
      ...toRefs(formData),
      ...toRefs(formFun),
    };
  },
};
</script>

<style lang="scss">
@import './css/form-css/form-skyblue.scss';
.form-style-row {
  display: flex;
}
.form-style-column {
  display: flex;
  flex-direction: column;
}
</style>
