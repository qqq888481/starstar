<template>
	<div class="loading-box"><a-spin size="large" tip="加载中..." /></div>
</template>

<script>
export default {}
</script>

<style lang="scss">
.loading-box {
	position: absolute;
	z-index: 3;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(51, 47, 47, 0.329);
	color: white;
	.ant-spin-lg .ant-spin-dot {
		font-size: 32px !important;
	}
}
</style>
