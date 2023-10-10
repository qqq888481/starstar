<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Axios from 'axios'

const username = ref(1)
const password = ref(1222)
const router = useRouter()

Axios.get(import.meta.env.VITE_VUE_APP_BASE_API1 + '/test/Nice', {
  params: { username: '122', password: '111' },
  cache: false
}).then(r => {
  console.warn(r.data)
})

function jump() {
  router.push({ path: '/main' })

  // Axios.get('http://10.150.18.199:8553/xxl-job-admin/sso/login', {
  // 	params: { username: 'admin', password: '123456' },
  // 	cache: true,
  // }).then(r => {
  // 	console.warn(r)
  // })
}
function jump1() {
  // router.push({ path: '/main' })

  Axios.get('http://10.150.18.199:8553/xxl-job-admin/sso/login', {
    params: { username: '1', password: '1' },
    cache: false
  })
}

const perAry = [
  // '大黄 app',
  //'陈劲 three.js',
  // '余梓豪 vuex',
  // '史玉方 vue3',
  // '陈新杰 pinia',
  // '包容 canvas',
  // '晓峰 webGL',
  '苏方方 sass',
  '雷玉洁 git指令'

  // '大黄 Primitive',
  // '陈劲 webpack',
  // '余梓豪 vite',
  // '史玉方 nodejs',
  // '陈新杰 高德api',
  // '包容 正则表达式',
  // '戈晓峰 diff算法',

  // 'flutter',
  // 'vue-router',
  // '前端动画特效',
  // 'react',
  // 'mobx',
  // 'es6开始至今更新的js内容'，
  // 'ts'
  // 'sonarlint对应规则优化方法'
]
console.warn(perAry[Math.floor(Math.random() * perAry.length)])
</script>

<template>
  <div id="login">
    <div className="login-d">
      <a-input v-model="username" placeholder="账号" />
      <a-input v-model="password" placeholder="密码" />
      <a-button @click="jump">登录</a-button>
    </div>
  </div>
</template>

<style lang="scss">
#login {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(#141e30, #243b55);
  height: 100%;

  .login-d {
    background-color: red;
    display: flex;
    flex-direction: column;
    row-gap: 40rem;
    justify-content: center;
    align-items: center;
    padding: 40rem 80rem;
    background-color: #0c1622;

    border-radius: 10px;
    box-shadow: 0 15px 25px 0 rgba(0, 0, 0, 0.6);

    button {
      width: 100rem;
    }
  }
}
</style>
