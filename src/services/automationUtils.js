/**
 * 自动化工具通用方法封装
 * 提供各种自动化任务所需的通用功能，与全屏蒙版组件集成
 */
import { useAppStore } from '../stores/appStore'
const TAG = 'AutomationUtils'

/**
 * 自动化工具类
 */
export class AutomationUtils {
  constructor() {
    this.appStore = null
    this.isInitialized = false
    this.router = null
  }

  /**
   * 初始化自动化工具
   * @param {Object} options - 初始化选项
   * @param {Object} options.router - Vue Router实例
   */
  init(options = {}) {
    this.appStore = useAppStore()
    this.isInitialized = true
    this.router = options.router || null
    return this
  }

  /**
   * 检查是否已初始化
   */
  _checkInitialized() {
    if (!this.isInitialized) {
      throw new Error('AutomationUtils not initialized. Call init() first.')
    }
  }

  createNovelApp(createConfigData) { 
    console.log(TAG,'createNovelApp', createConfigData)
    this._checkInitialized()
    this.appStore.startAutoTask('创建小程序任务', {
        maskConfig: {
            loadingText: '正在创建小程序...',
            showProgress: true
        }
    })
    //先统一跳转至/wenqu-auto
    if (this.router && typeof this.router.push === 'function') {
      this.router.push('/wenqu-auto')
    } else {
      console.error(TAG, 'Router not available or push method not found')
    }
  }
    
}



// 创建并导出单例实例
const automationUtils = new AutomationUtils()

export default automationUtils


