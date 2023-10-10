<script setup>
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
onMounted(() => {
	let map = L.map('map').setView([36.667317387570925, 119.07394409179689], 9)

	map.on('click', function (e) {
		console.warn(e)
	})


	L.tileLayer
		.wms('http://61.50.111.214:16181/IMEE-GlobeServer/weifang/wms', {
			layers: 'weifang:nature',
			service: 'WMS',
			transparent: true,
			format: 'image/png',
			crs: L.CRS.EPSG4326,
			maxZoom: 100,
			zIndex: 999,
		})
		.addTo(map)

	// a.on('click', function (e) {
	// 	console.warn(e)
	// })


})
</script>
<template>
	<div id="B">
		<div id="map"></div>
	</div>
</template>
<style lang="scss">
#B {
	position: absolute;
	top: 25px;

	#map {
		height: 900px;
		width: 900px;
		position: absolute;
	}
}
</style>
