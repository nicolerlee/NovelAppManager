// 动画插件 - 用于FreeLayoutMain组件

export default {
  install(app) {
    app.config.globalProperties.$componentAnimation = {
      // 初始化动画
      initAnimation(autoCreateModel, componentTypes = []) {
        if (!autoCreateModel) return;
        
        console.log('动画插件: 开始执行组件飞入动画...');
        
        // 组件位置映射关系
        const componentPositions = {
          'basic-config': { x: 15, y: 59 },
          'general-config': { x: 15, y: 154 },
          'payment': { x: 15, y: 249 },
          'advertisement': { x: 175, y: 249 },
          'ui-config': { x: 15, y: 344 },
          'weiju-config': { x: 175, y: 344 }
        };
        
        // 可用组件列表
        const availableComponents = [
          { type: 'basic-config', name: '基础配置', color: '#409eff', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
          { type: 'general-config', name: '通用配置', color: '#67c23a', gradient: 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)' },
          { type: 'payment', name: '支付', color: '#e6a23c', gradient: 'linear-gradient(135deg, #ffb74d 0%, #f57c00 100%)' },
          { type: 'advertisement', name: '广告', color: '#f56c6c', gradient: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)' },
          { type: 'ui-config', name: 'UI配置', color: '#13c2c2', gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)' },
          { type: 'weiju-config', name: '微距', color: '#722ed1', gradient: 'linear-gradient(135deg, #9c27b0 0%, #6a0080 100%)' }
        ];
        
        // 已使用的组件类型
        const usedComponentTypes = new Set(componentTypes);
        
        // 延迟执行，确保DOM已渲染完成
        setTimeout(() => {
          // 逐个动画组件
          availableComponents.forEach((component, index) => {
            // 为每个组件设置不同的延迟时间
            setTimeout(() => {
              const componentType = component.type;
              const position = componentPositions[componentType];
              
              if (position && !usedComponentTypes.has(componentType)) {
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
                
                // 获取左侧组件位置
                const sourceElement = document.querySelector(`[data-type="${componentType}"]`);
                if (sourceElement) {
                  const sourceRect = sourceElement.getBoundingClientRect();
                  tempElement.style.left = `${sourceRect.left}px`;
                  tempElement.style.top = `${sourceRect.top}px`;
                  document.body.appendChild(tempElement);
                  
                  // 获取手机框架位置
                  const appArea = document.querySelector('.phone-app-area');
                  if (appArea) {
                    const appRect = appArea.getBoundingClientRect();
                    const targetLeft = appRect.left + position.x;
                    const targetTop = appRect.top + position.y;
                    
                    // 执行动画
                    tempElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    tempElement.style.left = `${targetLeft}px`;
                    tempElement.style.top = `${targetTop}px`;
                    tempElement.style.width = '90px';
                    tempElement.style.height = '50px';
                    
                    // 动画完成后清理
                    setTimeout(() => {
                      document.body.removeChild(tempElement);
                      
                      // 更新占位区域状态
                      const modulePlaceholder = document.querySelector(`.module-placeholder[data-module-type="${componentType}"]`);
                      if (modulePlaceholder) {
                        modulePlaceholder.classList.add('occupied');
                        modulePlaceholder.style.borderStyle = 'solid';
                        modulePlaceholder.style.opacity = '0.3';
                      }
                    }, 1000);
                  }
                }
              }
            }, index * 500);
          });
        }, 500);
      }
    };
  }
};
