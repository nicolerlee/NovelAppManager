// 自动创建模式下的组件飞入动画
import { ref } from 'vue';

export const animateComponentsIntoFrame = (autoCreateModel, availableComponents, usedComponentTypes) => {
  if (!autoCreateModel) return;
  
  console.log('开始执行组件飞入动画...');
  
  // 组件位置映射关系
  const componentPositions = {
    'basic-config': { x: 15, y: 59 },
    'general-config': { x: 15, y: 154 },
    'payment': { x: 15, y: 249 },
    'advertisement': { x: 175, y: 249 },
    'ui-config': { x: 15, y: 344 },
    'weiju-config': { x: 175, y: 344 }
  };
  
  // 延迟执行，确保DOM已渲染完成
  setTimeout(() => {
    // 逐个处理组件
    availableComponents.forEach((component, index) => {
      // 为每个组件设置不同的延迟时间，形成依次飞入的效果
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
          
          // 获取左侧组件列表中的对应组件
          const sourceElement = document.querySelector(`.component-item[data-type="${componentType}"]`);
          if (sourceElement) {
            // 设置初始位置
            const sourceRect = sourceElement.getBoundingClientRect();
            tempElement.style.left = `${sourceRect.left}px`;
            tempElement.style.top = `${sourceRect.top}px`;
            document.body.appendChild(tempElement);
            
            // 获取手机框架和应用区域位置
            const appArea = document.querySelector('.phone-app-area');
            if (appArea) {
              // 计算目标位置
              const appRect = appArea.getBoundingClientRect();
              const targetLeft = appRect.left + position.x;
              const targetTop = appRect.top + position.y;
              
              // 应用动画效果
              tempElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
              tempElement.style.left = `${targetLeft}px`;
              tempElement.style.top = `${targetTop}px`;
              tempElement.style.width = '90px';
              tempElement.style.height = '50px';
              
              // 动画完成后清理
              setTimeout(() => {
                document.body.removeChild(tempElement);
                
                // 标记组件为已使用
                usedComponentTypes.add(componentType);
                
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
};
