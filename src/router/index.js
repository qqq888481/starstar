import { createRouter, createWebHashHistory } from 'vue-router'

// 真实的路由嵌套结构
export const routes = [
  {
    path: '/:pathMatch(.*)',
    redirect: '/'
  },
  {
    path: '/',
    name: 'webgl',
    redirect: '/chaptor1',
    component: () => import('@/views/index.vue'),
    children: [
     {
      path:'chaptor1',
      name:'chaptor1',
      redirect:'/chaptor1/jupiter',
      component:()=>import('@/views/chaptor1/index.vue'),
      children:[
        {
          path:'jupiter',
          name:'jupiter',
          component:()=>import('@/views/chaptor1/jupiter.vue')
        },{
          path:'smile',
          name:'smile',
          component:()=>import('@/views/chaptor1/smile.vue')
        },{
          path:'hexagon',
          name:'hexagon',
          component:()=>import('@/views/chaptor1/hexagon.vue')
        },{
          path:'image',
          name:'image',
          component:()=>import('@/views/chaptor1/image.vue')
        }
      ]
     }
    ]
  }
]

// 创建的路由示例
export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})
