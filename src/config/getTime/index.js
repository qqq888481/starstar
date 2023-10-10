let timeType  = {
  'year':{
    set:(times,changeNum)=>{times.setFullYear(times.getFullYear()+changeNum);return times},
    value:(nowTime,symbol)=>nowTime.slice(0,4)
  },
  'month':{
    set:(times,changeNum)=>{times.setMonth(times.getMonth()+changeNum);return times},
    value:(nowTime,symbol)=>nowTime.slice(0,4)+symbol[0]+nowTime.slice(4,6)
  },
  'day':{
    set:(times,changeNum)=>{times.setDate(times.getDate()+changeNum);return times},
    value:(nowTime,symbol)=>nowTime.slice(0,4)+symbol[0]+nowTime.slice(4,6)+symbol[0]+nowTime.slice(6,8)
  },
  'hour':{
    set:(times,changeNum)=>{times.setHours(times.getHours()+changeNum);return times},
    value:(nowTime,symbol)=>nowTime.slice(0,4)+symbol[0]+nowTime.slice(4,6)+symbol[0]+nowTime.slice(6,8)+" "+nowTime.slice(8,10)
  },
  'minute':{
    set:(times,changeNum)=>{times.setMinutes(times.getMinutes()+changeNum);return times},
    value:(nowTime,symbol)=>nowTime.slice(0,4)+symbol[0]+nowTime.slice(4,6)+symbol[0]+nowTime.slice(6,8)+" "+nowTime.slice(8,10)+symbol[1]+nowTime.slice(10,12)
  },
  'second':{
    set:(times,changeNum)=>{times.setSeconds(times.getSeconds()+changeNum);return times},
    value:(nowTime,symbol)=>nowTime.slice(0,4)+symbol[0]+nowTime.slice(4,6)+symbol[0]+nowTime.slice(6,8)+" "+nowTime.slice(8,10)+symbol[1]+nowTime.slice(10,12)+symbol[1]+nowTime.slice(12,14)
  },
}
let weekList = ["日","一","二","三","四","五","六"]
const TIME = {
    getNeedTime(timeValue){
      let type = timeValue.needReturnType?timeValue.needReturnType:"second"//所需时间类型
      let changeNum = timeValue.needChangeNum?Number(timeValue.needChangeNum):0//变化时间个数
      let needData = timeValue.needData//是否需要从指定时间开始
      let symbol = timeValue.needReturnSymbol&&timeValue.needReturnSymbol.length==2?timeValue.needReturnSymbol:['-',':']//需要时间格式间隔符号
      let times = needData?new Date(needData):new Date()
      times = timeType[type].set(times,changeNum)
      let year = times.getFullYear();
      let month = times.getMonth()+1;//获取当前月份的日期
      month=month<10?'0'+month:month
      let day = times.getDate();
      day=day<10?'0'+day:day
      let hour = times.getHours();
      hour=hour<10?'0'+hour:hour
      let minute = times.getMinutes();
      minute=minute<10?'0'+minute:minute
      let second = times.getSeconds();
      second=second<10?'0'+second:second
      let nowTime = year+month+day+hour+minute+second+''
        return timeType[type].value(nowTime,symbol)
    },
    completeTime(type){//补全日期格式
      if(type=="year"){
        return "-01-01 00:00:00"
      }else if(type=="month"){
        return "-01 00:00:00"
      }else if(type=="day"){
        return " 00:00:00"
      }else if(type=="hour"){
        return ":00:00"
      }else if(type=="minute"){
        return ":00"
      }
    },
    getWeekDay(times){
      let time = new Date(times).getDay()
      // let index = time
      return "星期"+weekList[time]
    }
}
export default TIME