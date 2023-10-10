<script setup>
import { reactive, ref } from 'vue'
import { AllROUTERSMAP } from '@/router'
import { useRoute } from 'vue-router'

let myRoute = reactive({})
const route = useRoute()
let curRoute = ref(route.path) // 当前的路由路径

myRoute = AllROUTERSMAP.get('main')

function calRouter(item, state) {
	let newRoute = myRoute.path + '/' + item.path
	if (state === 'updateState') {
		curRoute.value = newRoute
	}

	return newRoute
}
</script>

<template>
	<div id="main">
		<template v-for="(item, index) in myRoute.children" :key="index">
			<router-link
				:to="calRouter(item)"
				:class="curRoute.indexOf(calRouter(item)) > -1 ? 'act' : ''"
				@click="calRouter(item, 'updateState')"
			>
				<div class="header-nav">{{ item.meta.name }}</div>
			</router-link>
		</template>
	</div>
	<router-view></router-view>
</template>

<style lang="scss">
#main {
	background-color: bisque;
	display: flex;
	column-gap: 20rem;
	position: absolute;
	z-index: 1;
	// width: 100%;
	padding: 0rem 20rem;
	.header-nav {
		cursor: pointer;
		color: red;
	}

	a.act,
	a:hover {
		background: rgba($color: #0000ff, $alpha: 0.2);
	}
}
</style>
