// 修复后的组件飞入动画逻辑
export function fixComponentAnimation(autoCreateModel, availableComponents, usedComponentTypes, nextComponentId, currentLayout) {
  if (autoCreateModel.value) {
    console.log('开始执行修复后的组件飞入动画...');
    
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
              
              // 计算实际组件尺寸和位置 - 不减去边距
              const componentWidth = placeholderRect.width; // 直接使用占位区域宽度
              const componentHeight = placeholderRect.height; // 直接使用占位区域高度
              const targetX = placeholderRect.left - appRect.left;
              const targetY = placeholderRect.top - appRect.top;
              
              // 创建临时动画元素
              const tempElement = document.createElement('div');
              tempElement.className = 'temp-animated-component';
              tempElement.style.position = 'absolute';
              tempElement.style.width = '200px';
              tempElement.style.height = '100px';
              tempElement.style.background = component.gradient;
              tempElement.style.color = 'white';
              tempElement.style.borderRadius = '8px';
              tempElement.style.display = 'flex';
              tempElement.style.alignItems = 'center';
              tempElement.style.justifyContent = 'center';
              tempElement.style.fontWeight = 'bold';
              tempElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              tempElement.style.zIndex = '1000';
              tempElement.textContent = component.name;
              
              // 获取左侧组件位置（源位置）
              const sourceElement = document.querySelector(`[data-type="${componentType}"]`);
              if (sourceElement) {
                const sourceRect = sourceElement.getBoundingClientRect();
                tempElement.style.left = `${sourceRect.left}px`;
                tempElement.style.top = `${sourceRect.top}px`;
                document.body.appendChild(tempElement);
                
                // 强制重排以确保动画正常触发
                void tempElement.offsetWidth;
                
                // 计算动画目标位置（相对于页面）
                const targetLeft = appRect.left + targetX;
                const targetTop = appRect.top + targetY;
                
                // 设置过渡属性
                tempElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
                
                // 执行动画
                setTimeout(() => {
                  tempElement.style.left = `${targetLeft}px`;
                  tempElement.style.top = `${targetTop}px`;
                  tempElement.style.width = `${componentWidth}px`;
                  tempElement.style.height = `${componentHeight}px`;
                }, 50);
                
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
                  }
                }, 850); // 略大于动画持续时间
              }
            }
          }
        }, index * 500); // 每个组件间隔500ms开始动画
      });
    }, 1000);
  }
}