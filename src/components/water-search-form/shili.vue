<template>
	<div id="indicator-contribution-home">
		<div class='top-form'>
      <SearchForm :searchFormList='searchFormList'></SearchForm>
    </div>
	</div>
</template>

<script>
import {reactive,ref, onMounted, onUnmounted ,toRefs,nextTick} from 'vue'
import * as echarts from 'echarts'
import SearchForm from '@/components/water-search-form/index.vue'
export default {
  components:{SearchForm},
	setup(props, { attrs, slots, emit }) {
    let  districtMail = reactive({
        searchFormList:[
          // {width:"200rem",show:true,name:'控制级别',value:[],type:"select",change:(value)=>{console.log(value)},chooseList:[{label:'国控',value:"国控"},{label:'省控',value:"省控"}],moreChoose:true},
          // {width:"200rem",show:true,name:'控制级别',value:"",type:"select",change:(value)=>{console.log(value)},chooseList:[{label:'国控',value:"国控"},{label:'省控',value:"省控"}]},
          // {width:"300rem",show:true,name:'累计月份',value:"",type:"radio",change:(value)=>{console.log(value)},chooseList:[{label:'国控',value:"国控"},{label:'省控',value:"省控"},{label:'市控',value:"市控"}]},
          // {width:"300rem",show:true,name:'控制界别',value:[],type:"checkbox",change:(value)=>{console.log(value)},chooseList:[{label:'国控',value:"国控"},{label:'省控',value:"省控"},{label:'市控',value:"市控"}]},
          // {width:"200rem",show:true,name:'时间选择',value:"",type:"time",  change:(value)=>{console.log(value)},detail:"year",showType:"YYYY"},
          // {width:"200rem",show:true,name:'时间选择',value:"",type:"time",  change:(value)=>{console.log(value)},detail:"month",showType:"YYYY-MM"},
          // {width:"200rem",show:true,name:'时间选择',value:"",type:"time",  change:(value)=>{console.log(value)},detail:"date",showType:"YYYY-MM-DD"},
          // {width:"200rem",show:true,name:'',value:"",type:"input", change:(value)=>{console.log(value)},},
          // {width:"200rem",show:true,name:'季度选择',value:"",type:"cascader",change:(value)=>{console.log(value)},chooseList:[{label:'2022',value:"2022",children:[{label:"第一季度",value:'1'}]},{label:'2023',value:"2023",children:[{label:"第一季度",value:'1'}]}]},
          // {width:"400rem",show:true,name:'时间范围',value:[],type:"timeRange",change:(value)=>{console.log(value)},detail:'year',showType:"YYYY"},
          // {width:"400rem",show:true,name:'时间范围',value:[],type:"timeRange",change:(value)=>{console.log(value)},detail:'month',showType:"YYYY-MM"},
          // {width:"400rem",show:true,name:'时间范围',value:[],type:"timeRange",change:(value)=>{console.log(value)},detail:'date',showType:"YYYY-MM-DD HH",timeType:"HH"},
          {width:"150rem",show:true,name:'断面',value:[],type:"select",change:(value)=>{},chooseList:[{label:'全选',value:"all"},{label:'国控国控国控国控',value:"国控"},{label:'省控',value:"省控"},{label:'市控',value:"市控"}]},
          {width:"150rem",show:true,name:'时间选择',value:"",type:"cascader", change:(value)=>{console.log(value)},chooseList:[
            {label:'全选',value:"all"},
            {label:'国控国控国控国控',value:"国控",children:[{label:'国控',value:"1"},{label:'国控',value:"2"}]},
            {label:'省控',value:"省控",children:[{label:'国控',value:"1"},{label:'国控',value:"2"}]},
            {label:'市控',value:"市控",children:[{label:'国控',value:"1"},{label:'国控',value:"2"}]}
          ]},
          {isOperate:true,formValue:[],search:(value)=>{console.log(value)}},
        ]
    })
    onMounted(() => { 
	  })
	  onUnmounted(() => {

	  })
	  return {
          ...toRefs(districtMail)
	  }
  }
}
</script>

<style lang="scss">
#indicator-contribution-home{
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 16rem;
    background-color: rgba(238, 241, 250, 1);
    .top-form{
      width: 100%;
      height: 120rem;
      display: flex;
      position: relative;
      flex-wrap: wrap;
      background-color: white;
    }
}
</style>
