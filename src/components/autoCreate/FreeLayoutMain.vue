<template>
  <div class="free-layout-module">
    <el-card class="main-card">
      <template #header>
        <div class="header-content">
          <h2>自由编排工作台</h2>
          <el-button type="primary" @click="handleSaveLayout">保存编排</el-button>
        </div>
      </template>
      <div class="workspace-container">
        <div class="sidebar">
          <h3>模块</h3>
          <div class="component-list">
            <div 
              v-for="item in filteredComponents" 
                    :key="item.type"

              class="component-item" 
              draggable="true" 
              @dragstart.native="handleDragStart" 
              :data-type="item?.type"
            >
              <div :style="getComponentStyle(item)"
                  class="component-card">
                  <span style="color: white; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">{{ item.name }}</span>
                </div>
            </div>
          </div>
        </div>
      
        <div class="main-content">
          <div class="canvas-container" ref="canvasRef" @dragover.prevent @drop="handleDrop">
            <div class="canvas-placeholder" v-if="currentLayout.length === 0">
              <el-empty description="将左侧组件拖放到此处开始编排"></el-empty>
            </div>
            <div 
                v-for="component in currentLayout" 
                :key="component.id" 
                :class="['component component-' + component.type, { 'component-selected': selectedComponent?.id == component.id }]"
                :style="[
                      { transform: `translate(${component.position.x}px, ${component.position.y}px) ${selectedComponent?.id == component.id ? 'scale(1.1)' : ''}` },
                      getCanvasComponentStyle(component)
                    ]"
              :data-component-id="component.id"
              @mousedown="startDrag(component, $event)"
              @click="selectComponent(component)"
              :data-id="component.id"
            >
              <div class="component-header">
                <ElIcon class="delete-icon" @click.stop="removeComponent(component)">
                  <Close />
                </ElIcon>
              </div>
              <div class="component-label">{{ getComponentName(component.type) }}</div>
            </div>
          </div>
        </div>
        <div class="properties-panel">
            <h3>属性面板</h3>
            <div v-if="selectedComponent" class="component-properties">
              <h4>{{ getComponentName(selectedComponent.type) }} 属性</h4>
              <el-form size="small">
                <el-form-item label="组件类型">
                  <el-input v-model="selectedComponent.type" disabled></el-input>
                </el-form-item>

              </el-form>
            </div>
            <div v-else class="no-selection">
              <el-empty description="选择组件以编辑属性"></el-empty>
            </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { ElMessage, ElEmpty, ElCard, ElForm, ElFormItem, ElInput, ElIcon } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { inject } from 'vue'

const auth = inject('auth')
const router = useRouter()
const currentLayout = ref([])
const nextComponentId = ref(1)
const draggedComponent = ref(null)
const isDragging = ref(false)
  const usedComponentTypes = ref(new Set())
  const selectedComponent = ref(null)
const canvasRef = ref(null)
const canvasBounds = ref({})
let draggedElement = null;
let dragStartPos = null;

  // 选择组件
  const selectComponent = (component) => {
    selectedComponent.value = component;
  }


  // 获取组件样式
  const getComponentStyle = (item) => {
    return {
      background: item.gradient,
      borderRadius: '8px',
      padding: '20px',
      width: '100%',
      height: '80px',
      'box-sizing': 'border-box',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
      cursor: 'grab'
    };
  }

  // 初始化画布边界
  onMounted(() => {
    updateCanvasBounds();
    window.addEventListener('resize', updateCanvasBounds);
  })

  // 更新画布边界
  const updateCanvasBounds = () => {
    if (canvasRef.value) {
      const rect = canvasRef.value.getBoundingClientRect();
      canvasBounds.value = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
    }
  }


  // 可用组件列表
  const availableComponents = ref([
      { type: 'basic-config', name: '基础配置', color: '#409eff', gradient: 'linear-gradient(135deg, #409eff 0%, #69b1ff 100%)' },
      { type: 'general-config', name: '通用配置', color: '#67c23a', gradient: 'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)' },
      { type: 'payment', name: '支付', color: '#e6a23c', gradient: 'linear-gradient(135deg, #e6a23c 0%, #f3d19e 100%)' },
      { type: 'advertisement', name: '广告', color: '#f56c6c', gradient: 'linear-gradient(135deg, #f56c6c 0%, #f89898 100%)' },
      { type: 'ui-config', name: 'UI配置', color: '#13c2c2', gradient: 'linear-gradient(135deg, #13c2c2 0%, #1890ff 100%)' },
      { type: 'macro', name: '微距', color: '#722ed1', gradient: 'linear-gradient(135deg, #722ed1 0%, #a06ee1 100%)' }
    ])
console.log('可用组件初始数据:', availableComponents.value);
  
// 过滤有效的组件
const filteredComponents = computed(() => {
  return availableComponents.value
    .filter(item => item && item.type)
    .filter(item => !usedComponentTypes.value.has(item.type));
})

  
  // 拖拽功能实现
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copy'
    // 直接从事件绑定元素获取组件类型
      // 直接从事件绑定元素获取组件类型
      const componentType = e.currentTarget.dataset.type;
      if (!componentType) {
        console.error('Component type not found on element:', e.currentTarget);
        return;
      }
      e.dataTransfer.setData('text/plain', componentType);
  }
const handleDrop = (e) => {
    e.preventDefault()
    const componentType = e.dataTransfer.getData('text/plain')
    if (!componentType) return

    // 获取画布容器位置
    const canvas = document.querySelector('.canvas-container')
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect()
    const canvasWidth = rect.width
    const canvasHeight = rect.height
    // 使用实际渲染尺寸（与拖拽时保持一致）
    const componentWidth = 200;
    const componentHeight = 100; // 匹配实际渲染高度

    // 计算初始位置（鼠标位置直接映射，无额外偏移）
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // 边界限制（应用画布内边距）
    const canvasPadding = 15;
    x = Math.max(canvasPadding, Math.min(x, canvasWidth - componentWidth - canvasPadding));
    y = Math.max(canvasPadding, Math.min(y, canvasHeight - componentHeight - canvasPadding));

    // 创建带正确初始位置的组件
    const newComponent = {
      id: nextComponentId.value++,
      type: componentType,
      position: { x: x, y: y },
      props: {},
      isEditingComplete: false
    }

    // 添加到布局中
    currentLayout.value.push(newComponent)
    // 标记组件类型为已使用
    usedComponentTypes.value.add(componentType)
    // 触发响应式更新
    usedComponentTypes.value = new Set(usedComponentTypes.value)
    ElMessage.success(`已添加${getComponentName(componentType)}组件`)
  }

  // 根据组件类型获取渐变背景
  const getComponentGradient = (type) => {
    const component = availableComponents.value.find(item => item.type === type);
    return component ? component.gradient : 'linear-gradient(135deg, #409eff 0%, #69b1ff 100%)';
  }

  // 获取画布组件样式
  const getCanvasComponentStyle = (component) => {
    // 未完成编辑状态使用灰色背景
    if (!component.isEditingComplete) {
      return {
        background: 'linear-gradient(135deg, #909399 0%, #c9cdd4 100%)',
        borderRadius: '8px',
        padding: '20px',
        'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'box-sizing': 'border-box',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        transition: 'all 0.3s ease'
      };
    }
    // 已完成编辑状态使用渐变绿色背景
    return {
      background: 'linear-gradient(135deg, #b7eb8f 0%, #87e8de 100%)',
      borderRadius: '8px',
      padding: '20px',
      'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)',
      'box-sizing': 'border-box',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      transition: 'all 0.3s ease'
    };
  }


  // 获取组件名称
  const getComponentName = (type) => {
    const names = {
      'basic-config': '基础配置',
      'general-config': '通用配置',
      'payment': '支付',
      'advertisement': '广告',
      'ui-config': 'UI配置',
      'macro': '微距'
    }
    return names[type] || type
  }

// 拖拽中 - 平衡跟手性与流畅度
  const handleDrag = (e) => {
    if (!isDragging.value || !draggedElement || !draggedComponent.value || !canvasBounds.value) return

    // 使用requestAnimationFrame优化性能，减少布局抖动
    requestAnimationFrame(() => {
      const offsetX = e.clientX - dragStartPos.startX;
      const offsetY = e.clientY - dragStartPos.startY;
      const newX = dragStartPos.initialX + offsetX;
      const newY = dragStartPos.initialY + offsetY;

      // 统一使用两位小数精度计算边界
      const canvasPadding = 15;
      const maxX = canvasBounds.value.width - 200 - canvasPadding;
      const maxY = canvasBounds.value.height - 100 - canvasPadding;
      const boundedX = Math.max(canvasPadding, Math.min(newX, maxX)).toFixed(2);
      const boundedY = Math.max(canvasPadding, Math.min(newY, maxY)).toFixed(2);

      // 应用硬件加速并更新位置
      draggedElement.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
    });
  }

  // 结束拖拽 - 精确同步位置并清理事件
  const stopDrag = () => {
    if (!isDragging.value || !draggedElement || !draggedComponent.value) return

    // 精确提取transform值，避免舍入误差
    const transform = draggedElement.style.transform;
    const match = transform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
    if (match) {
        // 使用亚像素精度同步最终位置，避免释放时突变if (match) {
        // 统一使用parseFloat避免Number构造函数带来的精度问题
        draggedComponent.value.position = {
          x: parseFloat(parseFloat(match[1]).toFixed(2)),
          y: parseFloat(parseFloat(match[2]).toFixed(2))
        };
      }

    // 确保事件监听器正确移除
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);

    isDragging.value = false;
    // 清理样式和引用
    draggedElement.style.transition = '';
    draggedElement.style.willChange = 'auto';
    draggedElement.style.backfaceVisibility = 'visible';
    draggedElement = null;
    draggedComponent.value = null;
    dragStartPos = { x: 0, y: 0, startX: 0, startY: 0, initialX: 0, initialY: 0 };
  }

  // 删除组件
  const removeComponent = (component) => {
    // 从布局中移除组件
    currentLayout.value = currentLayout.value.filter(item => item.id !== component.id)
    // 从已使用类型中移除
    usedComponentTypes.value.delete(component.type)
    // 触发响应式更新
    usedComponentTypes.value = new Set(usedComponentTypes.value)
    // 取消选中状态
    if (selectedComponent.value?.id === component.id) {
      selectedComponent.value = null
    }
    ElMessage.success(`已移除${getComponentName(component.type)}组件`)
  }

// 开始拖拽 - 优化事件绑定和初始位置
const startDrag = (component, e) => {
  const el = e.currentTarget;
  if (!el || !component || !canvasBounds.value) return

  // 移除旧事件监听防止多重绑定
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);

  draggedComponent.value = component;
  draggedElement = el;
  // 使用精确初始位置，避免取整导致偏移
  dragStartPos = {
    startX: e.clientX,
    startY: e.clientY,
    initialX: parseFloat(component.position.x.toFixed(2)),
    initialY: parseFloat(component.position.y.toFixed(2))
  };
  isDragging.value = true;
  // 优化样式提升性能
  el.style.transition = 'none';
  el.style.willChange = 'transform';
  el.style.backfaceVisibility = 'hidden';

  // 添加新事件监听
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  e.preventDefault();
}

// 保存编排
const handleSaveLayout = () => {
  if (!currentLayout.value) {
    ElMessage.warning('请先创建布局')
    return
  }
  // 这里将实现保存逻辑
  ElMessage.success('布局保存成功')
}
</script>

<style scoped>
.free-layout-module {
  padding: 20px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.workspace-container {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 20px;
  margin-top: 20px;
  height: calc(100vh - 220px);
}
.sidebar {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
  min-height: 300px;
  /* 隐藏滚动条但保留滚动功能 */
  ::-webkit-scrollbar {width: 0;}
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.component-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}
.component-item {
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  user-select: none;
  touch-action: none;
}

.component-item:active {
  cursor: grabbing;
}

.component-card {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.component-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

:deep(.component-item *) {
  pointer-events: none;
}
.main-content {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
}
.canvas-container {
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.component {
  position: absolute;
  width: 200px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: move;
  transition: all 0.3s ease;
  overflow: hidden;
  will-change: transform;
  z-index: 1;
}

.component-header {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px;
}

.delete-icon {
  color: #f56c6c;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.delete-icon:hover {
  background: rgba(255, 255, 255, 0.9);
}

.component-selected {
  border: none;
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.4);
  z-index: 20;
  transition: all 0.3s ease-out;
}

.component:active {
  transform: scale(0.98);
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.6);
  transition: all 0.1s ease;
}

.component:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.component-label {
  font-size: 14px;
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.properties-panel {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
}
.no-selection {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>