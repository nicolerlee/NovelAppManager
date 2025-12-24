// 组件自动飞入完成后的UI刷新修复方案
// 这个文件包含了修复后的完整代码，用于替换FreeLayoutMain.vue中的相关部分

// 修复后的组件动画完成处理逻辑
const handleAnimationComplete = (component, componentType, targetX, targetY, componentWidth, componentHeight) => {
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
        
        // 使用nextTick确保DOM已经更新后再设置数据
        nextTick(() => {
            if(componentType === 'basic-config'){
                // 从currentLayout中找到刚添加的组件
                const layoutComponent = currentLayout.value.find(item => item.type === 'basic-config');
                if (layoutComponent) {
                    const baseConfig = {
                        config: appStore.getRouteTempData().createNovelApp.baseConfig
                    };
                    
                    // 更新组件配置
                    layoutComponent.config = { ...baseConfig.config };
                    
                    // 选中该组件
                    selectedComponent.value = layoutComponent;
                    
                    // 初始化基础配置
                    initBasicConfig(selectedComponent.value);
                    
                    // 再次使用nextTick确保所有数据更新后UI完全刷新
                    nextTick(() => {
                        console.log('基础配置数据设置完成，UI已刷新');
                    });
                }
            } else if(componentType === 'ui-config'){ 
                // UI配置组件处理
                const uiComponent = currentLayout.value.find(item => item.type === 'ui-config');
                if (uiComponent) {
                    uiComponent.config = appStore.getRouteTempData().createNovelApp.uiConfig || {};
                }
            } else if(componentType === 'general-config'){
                // 通用配置组件处理
                const generalComponent = currentLayout.value.find(item => item.type === 'general-config');
                if (generalComponent) {
                    generalComponent.config = appStore.getRouteTempData().createNovelApp.generalConfig || {};
                }
            } else if(componentType === 'payment'){
                // 支付配置组件处理
                const paymentComponent = currentLayout.value.find(item => item.type === 'payment');
                if (paymentComponent) {
                    paymentComponent.config = appStore.getRouteTempData().createNovelApp.paymentConfig || {};
                }
            } else if(componentType === 'advertisement'){
                // 广告配置组件处理
                const adComponent = currentLayout.value.find(item => item.type === 'advertisement');
                if (adComponent) {
                    adComponent.config = appStore.getRouteTempData().createNovelApp.adConfig || {};
                }
            } else if(componentType === 'weiju-config'){
                // 微距配置组件处理
                const weijuComponent = currentLayout.value.find(item => item.type === 'weiju-config');
                if (weijuComponent) {
                    weijuComponent.config = appStore.getRouteTempData().createNovelApp.weijuConfig || {};
                }
            }
        });
    } else {
        console.error('无效的组件属性:', {targetX, targetY, componentWidth, componentHeight});
        // 如果有ElMessage可用，显示错误信息
        if (typeof ElMessage !== 'undefined') {
            ElMessage.error(`组件 ${componentType} 创建失败: 无效的位置或尺寸`);
        }
    }
};

// 手动替换指南：
// 1. 在FreeLayoutMain.vue中找到组件动画完成后的处理逻辑（大约在960-990行附近）
// 2. 替换掉原来的代码，使用上面的修复后的逻辑
// 3. 确保所有需要的变量都已正确定义（nextTick, currentLayout, nextComponentId, appStore等）
// 4. 替换完成后，组件自动飞入完成并设置数据后，UI将会正确刷新

// 修复说明：
// 1. 使用了nextTick确保DOM更新后再设置数据
// 2. 从currentLayout中找到实际添加的组件进行操作，而不是直接使用临时变量
// 3. 分步骤更新组件配置、选中组件、初始化配置
// 4. 再次使用nextTick确保所有数据更新后UI完全刷新
// 5. 为其他类型的组件也添加了类似的数据设置逻辑