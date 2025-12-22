# 全屏蒙版组件使用指南

## 快速开始

全屏蒙版组件已经在 `App.vue` 中全局注册，无需单独引入即可使用。

### 基本使用步骤

1. **导入状态管理**
```javascript
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()
```

2. **显示蒙版**
```javascript
// 简单显示蒙版
appStore.showMask()

// 自定义蒙版配置
appStore.showMask({
  loadingText: '正在执行操作...',
  showLoading: true,
  preventClick: true
})
```

3. **隐藏蒙版**
```javascript
appStore.hideMask()
```

## 自动化任务集成

### 1. 开始任务
```javascript
appStore.startAutoTask('数据处理任务', {
  maskConfig: {
    loadingText: '正在处理数据...',
    showProgress: true
  }
})
```

### 2. 更新任务进度
```javascript
// 更新进度百分比（0-100）
appStore.updateTaskProgress(50)

// 添加任务日志
appStore.addTaskLog('执行第一步操作', 'info')
appStore.addTaskLog('数据处理完成', 'success')
appStore.addTaskLog('发生错误', 'error')
```

### 3. 完成或失败任务
```javascript
// 任务完成
appStore.completeTask('任务执行成功')

// 任务失败
appStore.failTask('任务执行失败')
```

### 4. 重置任务
```javascript
appStore.resetTask()
```

## API 参考

### 状态管理 API

#### 显示/隐藏蒙版
```javascript
// 显示蒙版，可自定义配置
appStore.showMask(config)

// 隐藏蒙版
appStore.hideMask()

// 更新蒙版配置
appStore.updateMaskConfig(config)
```

#### 自动化任务控制
```javascript
// 开始自动化任务
appStore.startAutoTask(taskName, config)

// 更新任务进度（0-100）
appStore.updateTaskProgress(progress)

// 添加任务日志
appStore.addTaskLog(content, type)

// 完成任务
appStore.completeTask(message)

// 任务失败
appStore.failTask(message)

// 重置任务
appStore.resetTask()
```

### 配置选项

#### 蒙版配置（maskConfig）

| 配置项 | 类型 | 默认值 | 描述 |
|-------|------|-------|------|
| opacity | Number | 0.7 | 蒙版透明度 (0-1) |
| backgroundColor | String | 'rgba(0,0,0,0.7)' | 背景颜色 |
| showLoading | Boolean | false | 是否显示加载动画 |
| loadingText | String | '自动化任务执行中...' | 加载提示文本 |
| showProgress | Boolean | false | 是否显示进度条 |
| preventClick | Boolean | true | 是否禁止点击穿透 |

#### 任务配置（autoTaskConfig）

| 配置项 | 类型 | 默认值 | 描述 |
|-------|------|-------|------|
| currentTask | String | null | 当前任务名称 |
| taskStatus | String | 'idle' | 任务状态 (idle/running/completed/error) |
| taskProgress | Number | 0 | 任务进度 (0-100) |
| taskLogs | Array | [] | 任务日志列表 |

## 使用示例

### 示例1：基本蒙版使用

```vue
<template>
  <div>
    <el-button type="primary" @click="showBasicMask">显示基本蒙版</el-button>
    <el-button type="success" @click="hideMask">隐藏蒙版</el-button>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()

// 显示基本蒙版
const showBasicMask = () => {
  appStore.showMask({
    loadingText: '正在加载...',
    showLoading: true
  })
  
  // 3秒后自动隐藏
  setTimeout(() => {
    appStore.hideMask()
  }, 3000)
}

// 隐藏蒙版
const hideMask = () => {
  appStore.hideMask()
}
</script>
```

### 示例2：带进度的自动化任务

```vue
<template>
  <div>
    <el-button type="primary" @click="startTask">开始数据处理</el-button>
    <el-button type="danger" @click="cancelTask">取消任务</el-button>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()

// 开始数据处理任务
const startTask = async () => {
  try {
    // 开始任务
    appStore.startAutoTask('数据处理', {
      maskConfig: {
        loadingText: '正在处理数据...',
        showProgress: true
      }
    })
    
    // 模拟数据处理过程
    const totalSteps = 10
    for (let i = 0; i < totalSteps; i++) {
      // 更新进度
      const progress = Math.round(((i + 1) / totalSteps) * 100)
      appStore.updateTaskProgress(progress)
      
      // 添加日志
      appStore.addTaskLog(`完成第 ${i + 1}/${totalSteps} 步处理`, 'info')
      
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // 任务完成
    appStore.completeTask('数据处理完成')
    
    // 2秒后隐藏蒙版
    setTimeout(() => {
      appStore.hideMask()
    }, 2000)
    
  } catch (error) {
    // 任务失败
    appStore.failTask(`数据处理失败: ${error.message}`)
  }
}

// 取消任务
const cancelTask = () => {
  appStore.addTaskLog('任务被取消', 'error')
  appStore.failTask('任务执行失败')
  appStore.hideMask()
}
</script>
```

## 在现有组件中使用

### 示例：在自动化构建页面中使用

```vue
<template>
  <div>
    <el-button type="primary" @click="startBuild">开始构建</el-button>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/appStore'
import { buildService } from '../services/buildService'

const appStore = useAppStore()

// 开始构建任务
const startBuild = async () => {
  try {
    // 开始构建任务
    appStore.startAutoTask('小程序构建', {
      maskConfig: {
        loadingText: '正在构建小程序...',
        showProgress: true
      }
    })
    
    // 调用构建服务
    const result = await buildService.buildApp({
      onProgress: (progress) => {
        // 实时更新进度
        appStore.updateTaskProgress(progress)
      },
      onLog: (message, type = 'info') => {
        // 添加构建日志
        appStore.addTaskLog(message, type)
      }
    })
    
    // 构建完成
    appStore.completeTask('小程序构建成功')
    
    // 显示成功信息
    ElMessage.success('构建成功')
    
    // 2秒后隐藏蒙版
    setTimeout(() => {
      appStore.hideMask()
    }, 2000)
    
  } catch (error) {
    // 构建失败
    appStore.failTask(`构建失败: ${error.message}`)
    ElMessage.error('构建失败')
    
    // 3秒后隐藏蒙版
    setTimeout(() => {
      appStore.hideMask()
    }, 3000)
  }
}
</script>
```

## 常见问题

### Q: 如何自定义蒙版样式？

A: 通过 `showMask` 方法的配置参数可以自定义蒙版的透明度、背景色、加载文本等。

### Q: 如何在任务执行过程中显示详细日志？

A: 使用 `addTaskLog` 方法添加日志，支持不同类型的日志（info、success、error）。

### Q: 如何允许特定区域的点击事件？

A: 设置 `maskConfig.preventClick = false`，然后在需要禁止点击的元素上添加 `@click.stop`。

### Q: 如何在组件中访问当前任务状态？

A: 通过 Pinia 的计算属性访问：

```javascript
import { computed } from 'vue'
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()
const taskStatus = computed(() => appStore.autoTaskConfig.taskStatus)
const taskProgress = computed(() => appStore.autoTaskConfig.taskProgress)
```

## 注意事项

1. 确保在组件卸载前隐藏蒙版，避免蒙版一直显示
2. 长时间运行的任务应该提供取消选项
3. 任务完成后，建议显示适当的成功信息并自动隐藏蒙版
4. 进度更新不要过于频繁，以免影响性能

## 总结

全屏蒙版组件提供了一个简洁而强大的方式来处理自动化任务的显示和用户交互。通过与 Pinia 状态管理的集成，可以轻松实现任务的开始、进度更新、完成和失败等状态管理，为用户提供良好的视觉反馈。
