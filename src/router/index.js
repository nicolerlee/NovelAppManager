import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
    {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/apps',
    name: 'AppList',
    component: () => import('../views/AppList.vue')
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('../components/appManager/WeijuConfig.vue')
  },
  {
    path: '/ads',
    name: 'AdManagement',
    component: () => import('../components/appManager/AdManagement.vue')
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('../components/appManager/Payment.vue')
  },
  { path: '/ui-config',
    name: 'UIConfig',
    component: () => import('../components/appManager/UIConfig.vue')
  },
  { path: '/app-manager',
    name: 'AppManager',
    component: () => import('../components/appManager/AppManagerEntry.vue'),
    meta: { title: '小程序管理中心' }
  },
  { path: '/general-config',
    name: 'GeneralConfig',
    component: () => import('../components/appManager/GeneralConfig.vue')
  },
  { path: '/toolbox',
    name: 'ToolBox',
    component: () => import('../views/ToolBox.vue'),
    meta: { title: '工具箱' }
  },
  { path: '/free-layout',
    name: 'FreeLayout',
    component: () => import('../components/autoCreate/FreeLayoutMain.vue'),
    meta: { title: '自由编排工作台' }
  },
  { path: '/wenqu-auto',
    name: 'WenquAuto',
    component: () => import('../views/WenquAuto.vue'),
    meta: { title: '文曲自动化' }
  },
  {
    path: '/auto-build',
    name: 'AutoBuild',
    component: () => import('../views/AutoBuild.vue'),
    meta: { title: '智能构建小程序' }
  },
  {
    path: '/auto-publish',
    name: 'AutoPublish',
    component: () => import('../views/AutoPublish.vue'),
    meta: { title: '全平台自动发布中心' }
  },
  {
    path: '/create-mode-selection',
    name: 'CreateModeSelection',
    component: () => import('../components/autoCreate/CreateModeSelection.vue'),
    meta: { title: '选择创建方式' }
  },
  {
    path: '/auto-create',
    name: 'AutoCreate',
    component: () => import('../views/AutoCreate.vue'),
    meta: { title: '创意小程序孵化器' }
  },
  {
    path: '/generate-app',
    name: 'generate-app',
    component: () => import('../components/autoCreate/AutoCreateGenerateApp.vue'),
    meta: {
      title: '小程序生成'
    }
  },
  { 
    path: '/wenqu-ai',
    name: 'WenquAi',
    component: () => import('../views/WenquAi.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: {
      title: '后台管理',
      requiresAdmin: true
    }
  },
  {
    path: '/generate-preview-qrcode',
    name: 'GeneratePreviewQrCode',
    component: () => import('../components/toolBox/generatePreviewQrCode.vue'),
    meta: {
      title: '生成预览二维码'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    // 从localStorage获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = localStorage.getItem('token')
    
    // 检查用户是否登录且类型为研发
    if (token && userInfo && userInfo.type === 0) {
      next()
    } else {
      ElMessage.error('无权限访问后台管理模块')
      next(from.path || '/')
    }
  } else {
    next()
  }
})

export default router