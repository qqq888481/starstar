<template>
  <div id='analyze-table'>
      <div class='section-title'> 
        <div v-for='(column,columnIndex) in tableColumnList' :key="columnIndex" class='column-name' :style="'width:'+column.width+'rem'" v-show='column.show'>
          <div v-if='column.isSort' class='sort-column'>
            <div class='sort-name'>{{column.name}}</div>
            <div class='sort'>
              <div @click="column.isSort('up',columnIndex)"   :class='column.sortType=="up"?"choose":""'></div>
              <div @click="column.isSort('down',columnIndex)" :class='column.sortType=="down"?"choose":""'></div>
            </div>
          </div>
          <div v-else class='name'>{{column.name}}</div>
        </div>
      </div>
      <div class='section-content'> 
        <div v-for='(column,columnIndex) in tableColumnList' :key="columnIndex" class='data-column' :style="'width:'+column.width+'rem'" v-show='column.show'>
          <div v-for='(data,dataIndex) in tableDataList' :key="dataIndex" class='data-line' >
            <div v-if='column.dataName!="operate"' class='data'>
              <div v-if='column.specialShow=="waterType"' :style='column.setStyle(data[column.dataName])' class='water-type table-data'>{{data[column.dataName]}}</div>
              <div v-else-if='column.specialShow=="isStandard"' :style='column.setStyle(data[column.dataName])' class='is-standard table-data'>{{data[column.dataName]}}</div>
              <div v-else-if='column.specialShow=="standardFactor"' :style='column.setStyle(data[column.dataName])' class='standard-factor table-data'>{{data[column.dataName]}}</div>
              <div v-else-if='column.specialShow=="eutrophication"' :style='column.setStyle(data[column.dataName])' class='eutrophication table-data'>{{data[column.dataName]}}</div>
              <!-- 特殊显示点 -->
              <div v-else :title='data[column.dataName]' class='table-data'>
                <div v-show='data.isChange'> <!-- 显示表单控件进行修改 -->
                  <a-input v-if='column.dataType=="input"' style="width: 80%" v-model:value="data[column.dataName]" />
                  <a-select v-else-if='column.dataType=="select"' style="width:80%" v-model:value="data[column.dataName]">
                    <a-select-option v-for="(choose, chooseIndex) in column.chooseList" :key="chooseIndex" :value="choose.value">{{ choose.label }}</a-select-option>
                  </a-select>
                  <div v-else>{{data[column.dataName]}}</div> <!-- 不需要修改的项显示文字 -->
                </div>
                <div v-show='!data.isChange'> <!-- 显示原先文字 -->
                  {{data[column.dataName]}}
                </div>
              </div>
            </div>
            <div v-else class='operat'>
              <div v-show='data.isChange' @click="column.change(dataIndex)">完成</div>
              <div v-show='!data.isChange' @click='dataChange(dataIndex)'>编辑</div>
              <div @click="column.delete(data)">删除</div>
            </div>
          </div>
        </div>  
      </div>
      <div class='table-pagination'>
        <a-pagination v-model:current="tablePagination.current" :show-total='tablePagination.showTotal' show-quick-jumper :pageSize='tablePagination.pageSize' :total="tablePagination.total" @change="tablePagination.change()" />
      </div>
  </div>
</template>

<script>
import {ref,reactive,watch,toRefs,onMounted } from 'vue'
export default {
    setup(props,{attrs,emit}) {
        let tableMail = reactive({
            isSlider:attrs.tableData.isSlider,//数据项是否滑动显示
            tableColumnList:[],//列项
            tableDataList:[],//数据项
            tablePagination:{},//翻页器
            dataChange(index){
              tableMail.tableDataList[index].isChange = true
            },
            setNewTableData(data){//设置显示新数据
              tableMail.tableColumnList=data.tableColumnList
              tableMail.tableDataList=data.tableDataList
              tableMail.tablePagination=data.tablePagination
            }
        })
        watch(
          ()=>attrs.tableData,
          (news,olds)=>{
            tableMail.setNewTableData(news)
          },
          {deep:true}
        )
        onMounted(()=>{
          tableMail.setNewTableData(attrs.tableData)
        })

        return{
            ...toRefs(tableMail),
        }
    }
}
</script>

<style lang='scss'>
    
    #analyze-table{
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow: auto;
          .section-title{
            width: 100%;
            height: 48rem;
            display: flex;
            border: 1px solid #DEE5EF;
            .column-name{
              height: 48rem;
              flex-grow: 1;
              flex-shrink: 0;
              background-color: #E8F1F9;
              white-space: nowrap;
              .name{
                width:100%;
                height: 48rem;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .sort-column{
                width:100%;
                height: 48rem;
                display: flex;
                align-items: center;
                background-color: #E8F1F9;
                white-space: nowrap;
                position: relative;
                .sort-name{
                  width: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                .sort{
                  width: 10rem;
                  height: 24rem;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-around;
                  align-items: center;
                  position: absolute;
                  right: 10rem;
                  top: 12rem;
                  .choose{
                    background-color: #1989FA;
                  }
                  div{
                    width: 8rem;
                    height: 8rem;
                    background-color: #7b818a;
                    cursor: pointer;
                  }
                  div:first-child{
                    clip-path: polygon(50% 0, 100% 100%, 0 100%)
                  }
                  div:last-child{
                    clip-path: polygon(0% 0, 100% 0%, 50% 100%)
                  }
                }
              }
            }
          }
          .section-content{
            display: flex;
            .data-column:first-child{
              border-left: 1px solid #DEE5EF;
            }
            .data-column:last-child{
              border-right: 1px solid #DEE5EF;
            }
            .data-column{
              flex-grow: 1;
              flex-shrink: 0;
            }
            .data-line{
              width: 100%;
              height: 48rem;
              border-bottom: 1px solid #E8F1F9;
              .operat{
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
                div{
                  cursor: pointer;
                  color:#1989FA
                }
              }
              .data{
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                .table-data{
                  width: 100%;
                  text-align: center;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  .ant-select-selection-item{
                    text-align: left;
                  }
                }
                .water-type{
                  width: 70rem;
                  height: 24rem;
                  text-align: center;
                  border-radius: 5px 5px 5px 5px;
                }
                .is-standard{
                  width: 70rem;
                  height: 24rem;
                  text-align: center;
                  border-radius: 5px 5px 5px 5px;
                }
                .standard-factor{

                }
                .eutrophication{
                  width: 70rem;
                  height: 24rem;
                  text-align: center;
                  border-radius: 5px 5px 5px 5px;
                }
              }
            }
          }
          .table-pagination{
            height: 62rem;
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }
    }
</style>