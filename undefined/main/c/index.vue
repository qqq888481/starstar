<script setup>
import { onMounted, reactive } from 'vue'

const dateFormat = 'YYYY-MM-DD'

const pageSize = 7
const typeAry = [
	{
		value: -1,
		label: '全部',
	},
	{
		value: 0,
		label: '空气质量分析日报',
	},
	{
		value: 1,
		label: '空气质量分析周报',
	},
	{
		value: 2,
		label: '空气质量分析月报',
	},
	{
		value: 3,
		label: '空气质量分析季报',
	},
	{
		value: 4,
		label: '空气质量分析年报',
	},
	{
		value: 5,
		label: '氮氧化物热点卫星遥感监控报告',
	},
	{
		value: 6,
		label: '对流层甲醛浓度卫星遥感监控报告',
	},
	{
		value: 7,
		label: '建筑裸地分布报告',
	},
	{
		value: 8,
		label: '雷达走航报告',
	},
	{
		value: 9,
		label: '石家庄市空气质量典型污染过程分析报告',
	},
]
const pageRea = reactive({
	current: 1,
	total: 50,
	time: [],
	//  [dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)],
	curType: typeAry[0].value,
	handleChange: e => {
		// console.warn(e)
	},

	data: [],

	search: () => {
		console.warn(pageRea.curType)
		console.warn(pageRea.time)

		console.warn(pageRea.current)
		console.warn(pageSize)

		let param = {
			pageSize: pageSize,
			page: pageRea.current,
		}
		if (pageRea.time) {
			param.startTime = pageRea.time[0]
			param.endTime = pageRea.time[1]
		}
		if (pageRea.curType !== typeAry[0].value) {
			param.type = pageRea.curType
		}

		// 调接口，传param
	},
})

onMounted(() => {
	pageRea.search()
})
</script>
<template>
	<div id="c">
		<div className="t-d">
			<a-select ref="select" v-model:value="pageRea.curType" style="width: 7.5rem" @change="pageRea.handleChange">
				<a-select-option v-for="(item, index) in typeAry" :key="index" :value="item.value">{{ item.label }}
				</a-select-option>
			</a-select>

			<a-range-picker v-model:value="pageRea.time" :format="dateFormat" />

			<div className="" @click="pageRea.search">查询</div>
		</div>
		<div className="b-d">
			<table>
				<thead>
					<tr>
						<th>Month</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in pageRea.data">
						<td>{{ item.name }}</td>
					</tr>
				</tbody>
			</table>
			<a-pagination v-model:current="pageRea.current" :total="pageRea.total" show-less-items />
		</div>
	</div>
</template>
<style lang="scss">
#c {
	background-color: rosybrown;
	padding-top: 3.125rem;

	.t-d {
		display: flex;
		align-items: center;
	}

	.b-d {
		display: flex;
		align-items: center;
		flex-direction: column;
	}
}
</style>
