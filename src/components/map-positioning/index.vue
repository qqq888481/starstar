<script>
import { onMounted } from 'vue'
import { myToken } from '@/config/sysConfig.js'
import Viewer from '@/IMEE/viewer.js'
import axios from 'axios'
export default {
  name: 'MapPosition',
  props: {},
  components: {},
  setup(props, { attrs, slots, emit }) {
    let viewer = null
    onMounted(() => {
      axios('./config/mapCfg.json').then(res => {
        viewer = new Viewer('modalMap', [119, 28, 1e6], true, res.data, myToken, 0)
      })
    })
    return {}
  },
  unmounted() {}
}
</script>
<template>
  <div id="modalMap" class="modalMap"></div>
</template>
<style lang="scss" scoped>
.modalMap {
  height: 100%;
  width: 100%;
}
</style>
