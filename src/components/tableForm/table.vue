<template>
  <div :class='styleName'>
    <div class='ant-table-title'>
        <div v-for='(item,index) in columns' :key='index' class='column-item' :style="'width:'+item.width">
          <div class="text" :title='item.title'>
            <a-checkbox v-if='item.checked' v-model:checked="allChecked" @change="onSelectChange(null)"></a-checkbox>
            <div v-else>{{item.title}}</div>
          </div>
          <a-popover overlayClassName="table-column-filters-box" v-if="item.filters" v-model:visible="item.filtersIconShow" trigger="click" placement="bottom">
            <template #title><div>筛选</div></template>
            <template #content>
              <a-checkbox-group v-model:value="item.chooseItem" :options="item.filters" />
              <div class="fliters-btn-box">
                <div @click="onFilter(item,true)">重置</div>
                <div @click="onFilter(item,false)">确认</div>
              </div>
            </template>
            <down-outlined  style="font-size:14rem;"/>
          </a-popover>
        </div>
    </div>   <!--自定义的表头-->
    <a-table  :dataSource="dataSource" :columns="columns" class='table-style' bordered :pagination='false'  >
      <!--自定义内容的话都相当于在a-table一整个内部循环表头列数据，再在bodyCell里面循环内容正文数据-->
      <!-- 
        等价于
        <div v-for='item in columns'>
          <template #headerCell="{ title,column }" />
          <template #bodyCell="{column, record ,text ,index}" >
            <div v-for='item1 in dataSource'></div>
          </template>
        </div>
        item相当于headerCell和bodyCell的column   item1相当于bodyCell的record
      -->
        <template #emptyText><!--自定义的没有表格数据的显示内容-->
            <div class='null-data'>
                <img src="@/assets/tableForm/nullData.png" alt="">
            </div>
        </template>
        <template #bodyCell="{column, record,text}" ><!--自定义正文格式 ,可以传递表格数据的列数据，循环的内容单行数据,默认的原始显示内容，编号-->
            <template v-if="column.dataIndex === 'operation'">
              <div class='operation-list'>
                <a v-if='record.operation[0].show' @click="otherOperate(record)">{{record.operation[0].name}}</a><!-- 详情暂不知做什么-->
                <a v-if='record.operation[1].show' @click="onUpdate(record)">{{record.operation[1].name}}</a>
                <a-popconfirm
                  placement="topLeft"
                  v-if='record.operation[2].show'
                  title="确定删除吗?"
                  @confirm="onDelete(record.id)"
                ><!-- placement设置气泡弹出位置，有时候宽度不够按钮会垂直排列 -->
                  <a>{{record.operation[2].name}}</a>
                </a-popconfirm>
              </div> 
            </template><!-- 行操作栏 -->

            <template v-if="column.dataIndex === 'checkbox'">
              <div class='files-list'>
                  <a-checkbox v-model:checked="record.checked" @change="onSelectChange(record)"></a-checkbox>
              </div>
            </template><!-- 复选checkbox栏 -->

            <template v-if="column.dataIndex === 'files'">
              <div class='files-list'>
                  <div v-for='(item,index) in record.files' :key='index'  class='file-icon' @click="openFile(item)">
                    <img :src='item.showImg' alt="">
                  </div>
              </div>
            </template><!-- 文件预览栏 -->

            <template v-if="column.dataIndex === 'otherOperate'" >
              <div class='otherOperate-list'>
                  <div v-for='(item,index) in record.otherOperate' :key='index'  class='otherOperate-item' >
                    <div v-if="item.type=='img'" @click="otherOperate(record)"><img :src='item.content' alt=""></div><!-- 显示图片的其他点击事件-->
                    <div v-else @click="otherOperate(record)">{{item.content}}</div><!-- 显示文字的其他点击事件-->
                  </div>
              </div>
            </template><!-- 其他操作显示预栏 -->
          

            <template v-if="column.dataIndex === 'name'">{{tableDataFormatter('name',text)}}</template> <!-- 需要重写显示的文本格栏-->
        </template>
    </a-table>
    <div class='ant-table-pagination'>
      <a-pagination v-model:current="nowPageNumber" v-model:pageSize='nowPageSize' show-quick-jumper :total="allPageNum" @change="changePageNumber" />
    </div>
    <a-modal wrapClassName='dialog-style' v-if='dialogStatus' v-model:visible="dialogStatus" :maskClosable='false' :closable='false' :footer="null" :width='dialogWidth'>
        <template #title><!-- 自定义的标题 -->
          <div class='dialog-header'>
              <div class='title'>
                  <div></div><!-- 蓝色的小竖条 -->
                  <span>{{dialogName}}</span>
              </div>
              <div class='operate-btn'>
                  <div @click="onFinish()">确认</div>
                  <div @click="onCancel()">取消</div>
              </div>
          </div>
        </template>
        <div class='dialog-content'>
          <div class='dialog-form'>
            <UpdateForm ref='updateForm' :formData='formData'/>
          </div>
          <div class='dialog-map' v-if='isMap'>
            <Map ref='Map' :mapFirstPosition='mapFirstPosition'></Map>
          </div>
          <div v-if='isMap' class='map-btn get-lonlat' v-show='getLonLatBtnShow' @click="setLonLat()"><CheckOutlined style="color:white"/></div>
          <div v-if='isMap' class='map-btn refash-position' @click="refashCamera()"><SyncOutlined style="color:white"/></div>
        </div>
    </a-modal>
  </div>
</template>

<script>
import { reactive, toRefs ,ref, onMounted} from 'vue'
import UpdateForm from './form.vue'
import {DownOutlined,CheckOutlined,SyncOutlined} from '@ant-design/icons-vue'
import Map from './map.vue'
export default {
    components:{
      UpdateForm,DownOutlined,CheckOutlined,SyncOutlined,Map
    },
    setup(props,{attrs,emit}) {
        let Map = ref()
        const updateForm = ref()//弹框组件
        let formData = reactive({
          formType:attrs.tableData.formType,//表单渲染格式
          formValue:{},//通过行数据传递的弹框初始显示的值
          formStyleName:attrs.tableData.formStyleName,//表单样式名
          autoList:attrs.tableData.autoList,//被填充的表单项值名
          rowId:'',//当前点击行的id,显示弹框获取，确定保存时传递
        })
        let tableData = reactive({
            selectedRowKeys:[],//当前选中行的id
            allChecked:false,//全选checkbox的状态
            filtersData:attrs.tableData.dataSource,//表格正文数据,用于筛选时复原数据使用
            dataSource:attrs.tableData.dataSource,//表格正文数据,渲染页面数据用
            dialogWidth:attrs.tableData.dialogWidth,//弹框宽度
            columns:attrs.tableData.columns,//表格头
            alreadyFilters:[],//已经有的所有筛选条件
            styleName:attrs.tableData.tableStyleName,//表格样式名
            isMap:attrs.tableData.isMap,//是否显示地图
            mapFirstPosition:attrs.tableData.mapFirstPosition,//地图初始视角点位置
            nowPageNumber:1,//当前页码
            nowPageSize:10,//当前每页展示条数
            allPageNum:100,//总页数
            changePageNumber(page, pageSize){
              attrs.tableData.changePageNumber(page, pageSize)//分页器自带参数返回当前页码和每页显示条数
            },
            onSelectChange:(row) => {//每次点击checkBox都循环一遍表格内容获取选中状态的表格行id
                tableData.selectedRowKeys = []
                if(row){//点击的是表格行的checkbox
                  let isChecked = null //全选状态
                  let isCheckedIsChange = false //控制变量，用于当表格有未选中的时候在接着循环表格内容时只操作一次全选状态变量
                  tableData.dataSource.map(item=>{
                    if(item.checked){
                      tableData.selectedRowKeys.push(item.id)
                      isChecked = isCheckedIsChange==false?true:false//当控制变量为false则说明当前循环还没有未选中的数据，则全选状态为true
                    }else{
                      isChecked = false//循环到了当前行未选中，则全选状态为false并修改控制变量下次循环不在修改全选状态
                      isCheckedIsChange = true//有未选中的表格行则修改控制变量
                    }
                  })//判断表格有无未选中的
                  tableData.allChecked = isChecked//赋值全选状态选中与否
                }else{//点击的是全选的checkbox
                  tableData.dataSource.map(item=>{
                    item.checked = tableData.allChecked//将所有行checkbox赋值为全选checkbox状态
                    if(item.checked){
                      tableData.selectedRowKeys.push(item.id)
                    }
                  })
                }
                attrs.tableData.getSelectRowId(tableData.selectedRowKeys)//返回选中行数据的id
            },
            openFile:(file)=>{ attrs.tableData.openFile(file)},
            tableDataFormatter:(type,text)=>{return attrs.tableData.tableDataFormatter(type,text)},
            getFilters:()=>{//获取筛选项
              tableData.alreadyFilters = []//每次确定时清空已选择的筛选项目
              tableData.columns.map(item=>{//循环列获取所有列项
                if(item.filters){//只对有筛选项的列操作
                  item.chooseItem.map(item1=>{//循环该筛选列的多选项
                    tableData.alreadyFilters.push({dataIndex:item.dataIndex,value:item1})//添加至所有的筛选项数组中
                  })
                }
              })
              attrs.dataFun.getList(tableData.alreadyFilters)//调用查询表格数据方法传递所有筛选项
            },
            onFilter:(column,type)=>{//筛选函数
              if(type){////是否是重置筛选，是则清空当前筛选项
                column.chooseItem=[]
              }
              tableData.getFilters()//筛出已选择的筛选项
            }
        })
        let formFun = reactive({
          dialogStatus:false,//弹框显隐
          dialogName:'',//弹框标题
          onDelete:(id)=>{
            attrs.dataFun.deleteData(id)
          },//删除方法
          onUpdate(row){
            formData.formValue=JSON.parse(JSON.stringify(row))//传递当前行值给表单
            formData.rowId = row.id[[]]
            this.dialogName='编辑'
            this.dialogStatus=true
          },//修改按钮传递行参数
          onAdd(){
            formData.formType.map((item) => {
              formData.formValue[item.valueName] = null;
              if(item.type=='moreSelects'){
                formData.formValue[item.valueName] = [];
              }
            });//新增将表单所有数据换为null
            this.dialogName='新增'
            this.dialogStatus=true
          },//修改按钮传递行参数
          closeDialog(){
            this.dialogStatus=false
          },//关闭表单弹框
          onFinish(){
            let data = JSON.parse(JSON.stringify(updateForm.value.formValue))
            if(attrs.dataFun.formCheck(data)){//通过校验方法判断是否符合校验
              return
            }
            if(this.dialogName=='编辑'){
              data.id=formData.rowId//修改保存时添加打开弹窗时行数据id
              attrs.dataFun.updateData(data)
            }else if(this.dialogName=='新增'){
              attrs.dataFun.addData(data)
            }
            this.onCancel()//表单操作完成后做关闭操作
          },//确认方法，循环判断有无空值，无则继续下一步
          onCancel(){
            for(let value in updateForm.value.formValue){
                updateForm.value.formValue[value]=null
            }//置空表单
            if(Map.value){//有地图时关闭弹框销毁地图
              this.getLonLatBtnShow=false//隐藏赋值经纬度按钮
              Map.value.mapFun.endAddEntity()//结束地图监听打点事件
              Map.value.mapFun.destroy()//销毁地图
            }
            this.closeDialog()
          },//取消修改关闭弹框
          otherOperate(recond){
            attrs.tableData.otherOperate(recond)
          },//一些其余操作方法
          getLonLatBtnShow:false,//经纬度按钮
          setLonLat(){
            updateForm.value.formValue.lonLat = Map.value.mapFun.clickPosition//获取地图存储的经纬度赋值表单按钮
            this.getLonLatBtnShow=false//隐藏赋值经纬度按钮
            Map.value.mapFun.endAddEntity()//结束地图监听打点事件
            attrs.tableData.fillAddress(updateForm.value.formValue)
          },//赋值经纬度
          refashCamera(){
            Map.value.mapFun.refashCamera()
          },//复原视角
        })
        return {
            formData,//传递的控制表单显示的内容
            ...toRefs(formFun),//弹框操作方法
            ...toRefs(tableData),//表格数据
            updateForm,//表单组件
            Map,//地图组件
        }
    }
}
</script>

<style lang='scss'>
@import './css/table-css/table-first.scss';//导入相应表格渲染样式
@import './css/dialog-css/dialog-first.scss';//导入相应弹框样式
.null-data{//暂无数据的样式
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>