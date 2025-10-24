<template>
  <div class="app-manager-page">
    <div class="header">
      <h1>小程序模块管理中心</h1>
      <p>统一管理您的小程序配置和数据</p>
    </div>
    <div class="feature-grid">
      <el-card class="feature-card" shadow="hover" @click="navigateToGeneralConfig">
        <div class="feature-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <div class="feature-title">通用配置</div>
        <div class="feature-desc">管理小程序的基础配置信息</div>
        <el-button type="primary" plain>进入配置</el-button>
      </el-card>

      <el-card class="feature-card" shadow="hover" @click="navigateToUIConfig">
        <div class="feature-icon">
          <el-icon><Picture /></el-icon>
        </div>
        <div class="feature-title">UI配置</div>
        <div class="feature-desc">自定义小程序的界面样式</div>
        <el-button type="primary" plain>进入配置</el-button>
      </el-card>

      <el-card class="feature-card" shadow="hover" @click="navigateToAdManagement">
        <div class="feature-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="feature-title">广告管理</div>
        <div class="feature-desc">配置和管理小程序内的广告</div>
        <el-button type="primary" plain>进入管理</el-button>
      </el-card>

      <el-card class="feature-card" shadow="hover" @click="navigateToPayment">
        <div class="feature-icon">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="feature-title">支付管理</div>
        <div class="feature-desc">管理小程序的支付相关设置</div>
        <el-button type="primary" plain>进入管理</el-button>
      </el-card>

      <el-card class="feature-card" shadow="hover" disabled>
        <div class="feature-icon not-open">
          <el-icon><Bell /></el-icon>
        </div>
        <div class="feature-title">数据分析</div>
        <div class="feature-desc">查看小程序的运营数据报告</div>
        <el-button type="info" plain disabled>即将开放</el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { inject } from 'vue'


const router = useRouter()
const auth = inject('auth')

// 导航到通用配置
const navigateToGeneralConfig = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  router.push('/home/general-config')
}

// 导航到UI配置
const navigateToUIConfig = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  router.push('/home/ui-config')
}

// 导航到广告管理
const navigateToAdManagement = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  router.push('/home/ads')
}

// 导航到支付管理
const navigateToPayment = () => {
  if (!auth.isLogin.value) {
    auth.showLogin()
    return
  }
  router.push('/home/payment')
}
</script>

<style scoped>
.app-manager-page {
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
}

.header p {
  font-size: 16px;
  color: #666;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 32px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 260px;
  border-radius: 16px;
  transition: box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
  padding: 32px 16px 24px 16px;
  background: linear-gradient(135deg, #f8fafc 60%, #f0f5ff 100%);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.el-button {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  margin-top: 10px;
  margin: 0 auto;
  display: block;
}

.feature-card:hover {
  box-shadow: 0 6px 24px 0 rgba(97, 93, 229, 0.122);
  transform: translateY(-4px) scale(1.03);
}

.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(97, 93, 229, 0.102) 0%, rgba(64, 158, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 18px;
  color: #5652d8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon.not-open {
  color: #909399;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #222;
  text-align: center;
}

.feature-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 18px;
  text-align: center;
  min-height: 40px;
}

.el-button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 自定义按钮样式 */
:deep(.el-button--primary) {
  background-color: #5652d8 !important;
  border-color: #5652d8 !important;
  color: #fff !important;
}

:deep(.el-button--primary:hover) {
  background-color: rgb(86, 82, 216) !important;
  border-color: rgb(86, 82, 216) !important;
}

:deep(.el-button--info) {
  background-color: #909399 !important;
  border-color: #909399 !important;
  color: #fff !important;
}
</style>