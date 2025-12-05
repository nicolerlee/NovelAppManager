/**
 * 文曲智能体配置文件
 * 此文件用于集中管理文曲智能体的所有配置，方便频繁修改
 */

const WenquAgentConfig = {
  // 智能体基础配置
  config: {
    bot_id: "7532714420175847487",
  },
  
  // 组件属性配置
  componentProps: {
    title: "文曲智能对话",
  },
  
  // 鉴权配置 - 经常需要修改的部分
  auth: {
    type: "token",
    token: "pat_9ijomGiq9KtbZX9Uxtr2AIoP71YCTU1v3G3LAvoCBC3OPugsM0LGiyqw5qOynmpd",
    onRefreshToken: function () {
      return "pat_9ijomGiq9KtbZX9Uxtr2AIoP71YCTU1v3G3LAvoCBC3OPugsM0LGiyqw5qOynmpd";
    },
  },
  
  // 整体UI效果配置
  ui: {
    base: {
      icon: "/images/logo/wenqu_logo.png",
      layout: "pc",
      zIndex: 1000,
    },
    asstBtn: {
      isNeed: false,
    },
    footer: {
      isShow: true,
      expressionText: "Powered by Wenqu AI",
    },
  },
  
  // 聊天框的 UI 和基础能力
  chatBot: {
    title: "文曲智能对话",
    uploadable: true,
    width: 800,
    // 设置是否支持对智能体或应用回复的消息进行追问
    isNeedQuote: true,
    // 当聊天框隐藏的时候，会回调该方法
    onHide: () => {},
    // 当聊天框显示的时候，会回调该方法
    onShow: () => {},
    el: null,
  },
};

export default WenquAgentConfig;