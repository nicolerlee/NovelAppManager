import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

/**
 * 批量构建WebSocket工具类
 * 用于处理批量构建和发布的实时日志和状态更新
 * 使用STOMP over SockJS
 */
class BatchBuildWebSocket {
  constructor() {
    this.stompClient = null
    this.batchTaskId = null
    this.taskType = null // 'build' 或 'publish'
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.messageHandlers = {
      log: [],
      status: []
    }
    this.isConnecting = false
    this.isConnected = false
    this.subscriptions = []
  }

  /**
   * 连接WebSocket
   * @param {string} batchTaskId - 批量任务ID
   * @param {string} taskType - 任务类型 ('build' 或 'publish')
   * @returns {Promise}
   */
  connect(batchTaskId, taskType = 'build') {
    return new Promise((resolve, reject) => {
      // 如果已经连接到相同的任务，直接返回
      if (this.isConnected && this.batchTaskId === batchTaskId && this.taskType === taskType) {
        console.log('[WebSocket] 已连接到相同任务，无需重新连接')
        resolve()
        return
      }

      // 如果正在连接中，等待连接完成
      if (this.isConnecting) {
        console.log('[WebSocket] 正在连接中，请稍候...')
        setTimeout(() => {
          if (this.isConnected) {
            resolve()
          } else {
            reject(new Error('连接超时'))
          }
        }, 5000)
        return
      }

      // 断开现有连接
      if (this.stompClient) {
        this.disconnect()
      }

      this.batchTaskId = batchTaskId
      this.taskType = taskType
      this.isConnecting = true

      console.log('[WebSocket] 正在连接 STOMP，batchTaskId:', batchTaskId, 'taskType:', taskType)

      try {
        // 创建SockJS连接（不带认证，因为/ws/**已经在白名单中）
        const socket = new SockJS(`${window.location.protocol}//${window.location.host}/ws`)
        
        // 创建STOMP客户端
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          // 暂时不添加认证头，因为WebSocket端点在白名单中
          // connectHeaders: token ? {
          //   'Authorization': `Bearer ${token}`
          // } : {},
          debug: (str) => {
            console.log('[STOMP Debug]', str)
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: () => {
            console.log('[WebSocket] STOMP连接成功')
            this.isConnected = true
            this.isConnecting = false
            this.reconnectAttempts = 0
            
            // 订阅批量任务的主题
            this.subscribeToBatchTask()
            
            resolve()
          },
          onStompError: (frame) => {
            console.error('[WebSocket] STOMP错误:', frame)
            this.isConnecting = false
            if (!this.isConnected) {
              reject(new Error('STOMP连接错误: ' + (frame.headers?.message || '未知错误')))
            }
          },
          onWebSocketClose: (event) => {
            console.log('[WebSocket] 连接关闭:', event)
            this.isConnected = false
            this.isConnecting = false
            
            // 清理订阅
            this.subscriptions = []
          },
          onWebSocketError: (error) => {
            console.error('[WebSocket] 连接错误:', error)
            this.isConnecting = false
            if (!this.isConnected) {
              reject(error)
            }
          }
        })

        // 激活STOMP客户端
        this.stompClient.activate()
      } catch (error) {
        this.isConnecting = false
        console.error('[WebSocket] 创建连接失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 订阅批量任务的主题
   */
  subscribeToBatchTask() {
    if (!this.stompClient || !this.isConnected) {
      console.warn('[WebSocket] 未连接，无法订阅')
      return
    }

    // 订阅批量任务状态更新
    const statusSubscription = this.stompClient.subscribe(
      `/topic/batch-${this.taskType}-status/${this.batchTaskId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body)
          console.log('[WebSocket] 收到状态更新:', data)
          this.handleMessage({ type: 'status', ...data })
        } catch (error) {
          console.error('[WebSocket] 解析状态消息失败:', error)
        }
      }
    )
    this.subscriptions.push(statusSubscription)

    // 订阅批量任务日志
    const logSubscription = this.stompClient.subscribe(
      `/topic/batch-${this.taskType}-logs/${this.batchTaskId}`,
      (message) => {
        try {
          const data = JSON.parse(message.body)
          console.log('[WebSocket] 收到日志:', data)
          this.handleMessage({ type: 'log', ...data })
        } catch (error) {
          console.error('[WebSocket] 解析日志消息失败:', error)
        }
      }
    )
    this.subscriptions.push(logSubscription)

    console.log('[WebSocket] 已订阅主题:', [
      `/topic/batch-${this.taskType}-status/${this.batchTaskId}`,
      `/topic/batch-${this.taskType}-logs/${this.batchTaskId}`
    ])
  }

  /**
   * 断开WebSocket连接
   */
  disconnect() {
    if (this.stompClient) {
      console.log('[WebSocket] 主动断开连接')
      
      // 取消所有订阅
      this.subscriptions.forEach(subscription => {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.error('[WebSocket] 取消订阅失败:', error)
        }
      })
      this.subscriptions = []
      
      // 断开STOMP连接
      this.stompClient.deactivate()
      this.stompClient = null
      this.isConnected = false
      this.isConnecting = false
      this.batchTaskId = null
      this.taskType = null
      this.reconnectAttempts = 0
    }
  }

  /**
   * 处理接收到的消息
   * @param {Object} data - 消息数据
   */
  handleMessage(data) {
    const { type, ...payload } = data

    // 触发对应类型的处理器
    if (this.messageHandlers[type]) {
      this.messageHandlers[type].forEach(handler => {
        try {
          handler(payload)
        } catch (error) {
          console.error(`[WebSocket] 处理${type}消息失败:`, error)
        }
      })
    }
  }

  /**
   * 注册消息处理器
   * @param {string} type - 消息类型 ('log' 或 'status')
   * @param {Function} handler - 处理函数
   */
  onMessage(type, handler) {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = []
    }
    this.messageHandlers[type].push(handler)
  }

  /**
   * 取消注册消息处理器
   * @param {string} type - 消息类型
   * @param {Function} handler - 处理函数
   */
  offMessage(type, handler) {
    if (this.messageHandlers[type]) {
      const index = this.messageHandlers[type].indexOf(handler)
      if (index > -1) {
        this.messageHandlers[type].splice(index, 1)
      }
    }
  }

  /**
   * 清空所有回调函数
   */
  clearCallbacks() {
    this.messageHandlers = {
      log: [],
      status: []
    }
  }

  /**
   * 发送消息
   * @param {string} destination - 目标地址
   * @param {Object} data - 要发送的数据
   */
  send(destination, data) {
    if (this.stompClient && this.isConnected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(data)
      })
    } else {
      console.warn('[WebSocket] 未连接，无法发送消息')
    }
  }
}

// 导出单例
export default new BatchBuildWebSocket()
