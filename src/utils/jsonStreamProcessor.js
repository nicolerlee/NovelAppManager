import { ref } from 'vue';

/**
 * JSON流处理器 - 用于处理流式返回的JSON数据
 * 支持识别和解析包裹在特定标识符中的JSON内容
 */

export default function useJsonStreamProcessor() {
  // 配置存储对象
  const config = ref({});
  
  // JSON流处理状态
  const streamingState = ref({
    isStreaming: false,     // 是否正在接收JSON流
    currentDataType: '',    // 当前处理的数据类型
    currentSubStructure: '',// 当前处理的子结构
    jsonBuffer: ''          // JSON内容缓冲区
  });

  /**
   * 检查字符串是否为有效的JSON
   */
  const isJsonString = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * 检查字符串是否包含JSON开始标识符（容错处理）
   */
  const checkJsonStartMarker = (str) => {
    const match = str.match(/json?Start-(\w+)-(\w+)/i);
    if (match) {
      return {
        dataType: match[1],
        subStructure: match[2],
        startIndex: match.index
      };
    }
    return null;
  };

  /**
   * 检查字符串是否包含JSON结束标识符（容错处理）
   */
  const checkJsonEndMarker = (str) => {
    const match = str.match(/json?End-(\w+)-(\w+)/i);
    if (match) {
      return {
        dataType: match[1],
        subStructure: match[2],
        endIndex: match.index
      };
    }
    return null;
  };

  /**
   * 处理可能包含JSON开始或结束标记的内容
   */
  const processContent = (content) => {
    // 如果不在JSON流处理状态
    if (!streamingState.value.isStreaming) {
      // 检查是否包含开始标记
      const startInfo = checkJsonStartMarker(content);
      if (startInfo) {
        // 进入JSON流处理状态
        streamingState.value.isStreaming = true;
        streamingState.value.currentDataType = startInfo.dataType;
        streamingState.value.currentSubStructure = startInfo.subStructure;
        
        // 提取开始标记之后的内容到缓冲区
        const startMarkerEnd = startInfo.startIndex + `jsonStart-${startInfo.dataType}-${startInfo.subStructure}`.length;
        streamingState.value.jsonBuffer = content.substring(startMarkerEnd).trim();
        
        console.log('开始接收JSON流:', startInfo.dataType, startInfo.subStructure);
        return true; // 表示已处理为JSON流开始
      }
    } else {
      // 已经在JSON流处理状态，继续收集内容
      streamingState.value.jsonBuffer += content;
      
      // 检查是否包含结束标记
      const endInfo = checkJsonEndMarker(streamingState.value.jsonBuffer);
      if (endInfo) {
        // 检查结束标记是否匹配当前处理的类型和子结构
        if (endInfo.dataType === streamingState.value.currentDataType && 
            endInfo.subStructure === streamingState.value.currentSubStructure) {
          
          // 提取结束标记之前的JSON内容
          const jsonContent = streamingState.value.jsonBuffer.substring(0, endInfo.endIndex).trim();
          
          // 尝试解析JSON
          if (isJsonString(jsonContent)) {
            try {
              const parsedJson = JSON.parse(jsonContent);
              
              // 按照指定格式存储JSON数据
              if (!config.value[streamingState.value.currentDataType]) {
                config.value[streamingState.value.currentDataType] = {};
              }
              
              config.value[streamingState.value.currentDataType][streamingState.value.currentSubStructure] = parsedJson;
              
              console.log(`保存JSON配置: ${streamingState.value.currentDataType}.${streamingState.value.currentSubStructure}`, parsedJson);
              console.log('当前配置结构:', config.value);
            } catch (e) {
              console.error('解析JSON内容失败:', e);
              console.error('JSON内容:', jsonContent);
            }
          } else {
            console.warn('提取的内容不是有效的JSON:', jsonContent);
          }
        }
        
        // 重置JSON流处理状态
        streamingState.value.isStreaming = false;
        streamingState.value.currentDataType = '';
        streamingState.value.currentSubStructure = '';
        streamingState.value.jsonBuffer = '';
        
        console.log('结束JSON流接收');
        return true; // 表示已处理为JSON流结束
      }
    }
    
    // 检查是否为普通JSON（非流式）
    if (!streamingState.value.isStreaming && content.trim() && isJsonString(content.trim())) {
      try {
        const parsedJson = JSON.parse(content.trim());
        // 将普通JSON合并到主配置中
        Object.assign(config.value, parsedJson);
        console.log('保存普通JSON配置:', parsedJson);
        return true;
      } catch (e) {
        console.error('解析普通JSON失败:', e);
      }
    }
    
    return false; // 表示未处理为JSON
  };

  /**
   * 获取当前配置
   */
  const getConfig = () => {
    return config.value;
  };

  /**
   * 重置配置
   */
  const resetConfig = () => {
    config.value = {};
    streamingState.value = {
      isStreaming: false,
      currentDataType: '',
      currentSubStructure: '',
      jsonBuffer: ''
    };
    console.log('重置JSON流处理器配置');
  };

  return {
    config,
    processContent,
    getConfig,
    resetConfig
  };
}
