<template>
  <div id="water-table-info">
    <a-table :columns="tableData.columns" :data-source="tableData.data" :pagination="false">
      <template #bodyCell="{ column, text, index, record }">
        <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
      </template>
    </a-table>
    <a-pagination
      v-model:current="tableData.current"
      v-model:pageSize="PAGESIZE"
      show-quick-jumper
      :total="tableData.data.length"
      :show-total="total => `共 ${total} 条`"
      style="margin-top: 16rem"
    />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
let PAGESIZE = 10

const tableData = reactive({
  current: 1,
  columns: [],
  data: []
})

defineExpose({
  tableData: tableData
})
</script>
<style lang="scss">
#water-table-info {
  .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
    height: 0px;
    width: 0px;
  }
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td,
  .ant-table tfoot > tr > th,
  .ant-table tfoot > tr > td {
    padding: 11rem 15rem;
  }
  .ant-table-thead > tr > th {
    font-size: 14rem;
    color: #000;
    font-weight: 400;
    font-family: Microsoft YaHei;
  }
  .ant-table-tbody > tr > td {
    font-size: 14rem;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: #666666;
  }
  .ant-table-thead > tr > th {
    background: #e8f1f9;
  } //表头背景色
  .ant-table-cell-row-hover {
    background: #e8f1f9;
  } //鼠标经过表格变颜色
  .ant-pagination-options-size-changer.ant-select {
    display: none;
  } //取消展示每页多少条
  .ant-pagination {
    display: flex;
    justify-content: end;
  } //分页靠右
}
</style>
<style lang="scss" scoped></style>
