# 自动创建模式组件飞入动画实现方案

## 实现概述

本方案提供了在FreeLayoutMain.vue组件中实现自动创建模式下组件从左侧模块待选区飞入手机模拟框架区的动画效果。

## 已创建的文件

1. **componentAnimation.js** - 动画函数的核心实现
2. **AnimationPlugin.js** - Vue插件版本
3. **componentAnimation.css** - 动画样式文件
4. **autoComponentAnimation.js** - 独立自动执行脚本
5. **autoAnimationObserver.js** - DOM观察者脚本

## 手动集成步骤

### 方法一：在FreeLayoutMain.vue中直接添加动画代码

1. **在onMounted函数中添加动画调用**：

```javascript
onMounted(() => {
  console.log(TAG,'onMounted appStore:',appStore.getAutoTaskConfig);
  if(appStore.getAutoTaskConfig.taskStatus === 'running' && appStore.getAutoTaskConfig.currentTask!=null){
    autoCreateModel.value=true
  }else{
    autoCreateModel.value=false
  }
  console.log(TAG,'onMounted autoCreateModel:',autoCreateModel.value);
  updateCanvasBounds();
  window.addEventListener('resize', updateCanvasBounds);
  
  // 如果是自动创建模式，执行组件飞入动画
  if (autoCreateModel.value) {
    console.log('开始执行组件飞入动画...');
    
    // 延迟执行，确保DOM已渲染完成
    setTimeout(() => {
      // 逐个动画组件
      availableComponents.value.forEach((component, index) => {
        // 为每个组件设置不同的延迟时间
        setTimeout(() => {
          const componentType = component.type;
          
          // 获取占位区域元素
          const modulePlaceholder = document.querySelector(`.module-placeholder[data-module-type="${componentType}"]`);
          if (modulePlaceholder && !usedComponentTypes.value.has(componentType)) {
            // 获取占位区域的实际尺寸和位置
            const placeholderRect = modulePlaceholder.getBoundingClientRect();
            const appArea = document.querySelector('.phone-app-area');
            
            if (appArea) {
              const appRect = appArea.getBoundingClientRect();
              
              // 计算实际组件尺寸和位置
              const componentWidth = placeholderRect.width - 20; // 减去边距
              const componentHeight = placeholderRect.height - 20; // 减去边距
              const targetX = placeholderRect.left - appRect.left;
              const targetY = placeholderRect.top - appRect.top;
              
              // 创建临时动画元素
              const tempElement = document.createElement('div');
              tempElement.className = 'temp-animated-component';
              tempElement.style.cssText = `
                position: absolute;
                width: 200px;
                height: 100px;
                background: ${component.gradient};
                color: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
              `;
              tempElement.textContent = component.name;
              
              // 获取左侧组件位置（源位置）
              const sourceElement = document.querySelector(`[data-type="${componentType}"]`);
              if (sourceElement) {
                const sourceRect = sourceElement.getBoundingClientRect();
                tempElement.style.left = `${sourceRect.left}px`;
                tempElement.style.top = `${sourceRect.top}px`;
                document.body.appendChild(tempElement);
                
                // 计算动画目标位置（相对于页面）
                const targetLeft = appRect.left + targetX;
                const targetTop = appRect.top + targetY;
                
                // 执行动画
                tempElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
                tempElement.style.left = `${targetLeft}px`;
                tempElement.style.top = `${targetTop}px`;
                tempElement.style.width = `${componentWidth}px`;
                tempElement.style.height = `${componentHeight}px`;
                
                // 动画完成后处理
                setTimeout(() => {
                  // 移除临时动画元素
                  document.body.removeChild(tempElement);
                  
                  // 标记组件为已使用
                  usedComponentTypes.value.add(componentType);
                  
                  // 更新占位区域状态
                  modulePlaceholder.classList.add('occupied');
                  modulePlaceholder.style.borderStyle = 'solid';
                  modulePlaceholder.style.opacity = '0.3';
                  
                  // 创建实际组件并添加到布局
                  const newComponent = {
                    id: nextComponentId.value++,
                    type: componentType,
                    position: { x: targetX, y: targetY },
                    width: componentWidth,
                    height: componentHeight,
                    props: {},
                    isCompleted: false,
                    config: {}
                  };
                  
                  // 确保组件属性有效
                  if (typeof targetX === 'number' && typeof targetY === 'number' && componentWidth > 0 && componentHeight > 0) {
                    // 添加到布局中
                    currentLayout.value.push(newComponent);
                    
                    // 触发响应式更新
                    currentLayout.value = [...currentLayout.value];
                    
                    console.log(`组件 ${componentType} 动画完成并添加到布局`);
                  } else {
                    console.error('无效的组件属性:', {targetX, targetY, componentWidth, componentHeight});
                    // 如果有ElMessage可用，显示错误信息
                    if (typeof ElMessage !== 'undefined') {
                      ElMessage.error(`组件 ${componentType} 创建失败: 无效的位置或尺寸`);
                    }
                  }
                }, 800);
              }
            }
          }
        }, index * 500); // 每个组件间隔500ms开始动画
      });
    }, 1000);
  }
  
  // 尝试从全局变量中恢复数据（从AutoCreateStep6返回时）
  // ... 原有代码 ...
});
```

### 方法二：使用独立脚本

1. **将autoAnimationObserver.js文件复制到项目中**
2. **在FreeLayoutMain.vue的模板中添加脚本引用**：

```html
<template>
  <!-- 原有模板代码 -->
</template>

<script setup>
// 原有脚本代码
</script>

<script src="./autoAnimationObserver.js"></script>

<style lang="scss" scoped>
/* 原有样式代码 */
</style>
```

## 动画效果说明

1. **依次飞入**：组件将按照预定义的顺序依次从左侧模块待选区飞入手机模拟框架区
2. **平滑过渡**：使用cubic-bezier(0.25, 0.8, 0.25, 1)缓动函数，实现平滑的动画效果
3. **位置映射**：每个组件类型都有预定义的目标位置，确保准确落在对应的模块占位区域
4. **状态更新**：动画完成后，自动将组件标记为已使用，并更新占位区域的状态

## 组件位置映射

```javascript
const componentPositions = {
  'basic-config': { x: 15, y: 59 },
  'general-config': { x: 15, y: 154 },
  'payment': { x: 15, y: 249 },
  'advertisement': { x: 175, y: 249 },
  'ui-config': { x: 15, y: 344 },
  'weiju-config': { x: 175, y: 344 }
};
```

## 可用组件配置

```javascript
const availableComponents = [
  { type: 'basic-config', name: '基础配置', color: '#409eff', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
  { type: 'general-config', name: '通用配置', color: '#67c23a', gradient: 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)' },
  { type: 'payment', name: '支付', color: '#e6a23c', gradient: 'linear-gradient(135deg, #ffb74d 0%, #f57c00 100%)' },
  { type: 'advertisement', name: '广告', color: '#f56c6c', gradient: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)' },
  { type: 'ui-config', name: 'UI配置', color: '#13c2c2', gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)' },
  { type: 'weiju-config', name: '微距', color: '#722ed1', gradient: 'linear-gradient(135deg, #9c27b0 0%, #6a0080 100%)' }
];
```

## 注意事项

1. **自动创建模式判断**：动画只会在`autoCreateModel.value`为true时执行
2. **DOM依赖**：动画依赖于特定的DOM元素结构，确保模板中包含以下类名的元素：
   - `.canvas-container`
   - `.phone-app-area`
   - `.module-placeholder[data-module-type="组件类型"]`
   - `[data-type="组件类型"]`
3. **性能优化**：动画使用了CSS过渡和临时DOM元素，不会对性能造成显著影响
4. **不影响手动模式**：动画只在自动创建模式下执行，不会影响原有的手动创建模式

## 自定义配置

1. **调整动画速度**：修改`transition`属性的`0.8s`值
2. **调整动画延迟**：修改`setTimeout`的时间值
3. **调整目标位置**：修改`componentPositions`对象中的坐标值
4. **调整组件样式**：修改临时元素的CSS样式

## 故障排除

1. **动画不执行**：检查`autoCreateModel.value`是否为true，以及DOM元素是否存在
2. **组件位置不正确**：检查`componentPositions`中的坐标值是否正确
3. **动画效果不佳**：调整缓动函数或动画持续时间
4. **性能问题**：减少同时执行的动画数量或增加动画间隔时间

通过以上步骤，您应该能够成功实现自动创建模式下的组件飞入动画效果。如果您遇到任何问题，请参考已创建的文件或联系开发团队。
