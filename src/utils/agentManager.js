// 全局智能体管理器
export const agentManager = {
  // 智能体可见性状态
  isVisible: false,
  
  // 回调函数列表
  callbacks: [],
  
  // 显示智能体
  show() {
    this.isVisible = true;
    this.notifyCallbacks();
    console.log('agentManager - show called, isVisible:', this.isVisible);
  },
  
  // 隐藏智能体
  hide() {
    this.isVisible = false;
    this.notifyCallbacks();
    console.log('agentManager - hide called, isVisible:', this.isVisible);
  },
  
  // 切换智能体可见性
  toggle() {
    this.isVisible = !this.isVisible;
    this.notifyCallbacks();
    console.log('agentManager - toggle called, isVisible:', this.isVisible);
  },
  
  // 添加回调函数
  onVisibilityChange(callback) {
    this.callbacks.push(callback);
    // 立即通知当前状态
    callback(this.isVisible);
  },
  
  // 移除回调函数
  offVisibilityChange(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  },
  
  // 通知所有回调函数
  notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.isVisible);
      } catch (error) {
        console.error('agentManager - callback error:', error);
      }
    });
  }
};