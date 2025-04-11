# TsAiAgent 组件使用文档

## 安装

Vue3 Node.js ≥ 18.x

```bash
npm install @trasen/trasenAiAgent
```

## 全局引入

```javascript
// 在 main.js 中引入
import { createApp } from 'vue';
import App from './App.vue';
import '@trasen/trasenAiAgent/trasenAiAgent.css';
import trasenAiAgent from '@trasen/trasenAiAgent';
const app = createApp(App);
app.use(trasenAiAgent);
app.mount('#app');
```

## 局部引入

```javascript
import { TsAiAgent } from '@trasen/trasenAiAgent';
import '@trasen/trasenAiAgent/trasenAiAgent.css';
```

## Props

- **title** (String): 聊天窗口的标题，默认为 "创星医疗AI助手"。
- **apiOptions** (Object): 配置API的选项，包括URL、模型标识和是否启用流式传输。

ollama 配置

```javascript
{
    type: 'ollama',
    url: 'http://192.168.18.229:11434/api/chat',
    model: 'deepseek-r1:32b',
    sysMsg: '你是一个医疗专家，请根据用户的问题给出专业的回答。',
}
```

dify 配置

```javascript
{
    type: 'dify',
    url: 'http://192.168.208.29:5001/v1/chat-messages',
    apiKey: 'app-9FxRptPkVKERXRHQ9Nb',
}
```

- **drag** (Boolean): 是否启用悬浮按钮，默认为 false。

## 事件

- **operation**: 回答下方的按钮回调事件

## 插槽

- **actions**: 自定义聊天项的操作按钮。
- **title**: 自定义聊天窗口的标题。
- **icon**: 自定义悬浮图标。

## 使用

```vue
<template>
    <TsAiAgent :title="title" :apiOptions="apiOptions" />
</template>
```

# TsAiChat 使用文档

## 安装

Vue3 Node.js ≥ 18.x

```bash
npm install @trasen/trasenAiAgent
```

## 全局引入

```javascript
// 在 main.js 中引入
import { createApp } from 'vue';
import App from './App.vue';
import '@trasen/trasenAiAgent/trasenAiAgent.css';
import trasenAiAgent from '@trasen/trasenAiAgent';
const app = createApp(App);
app.use(trasenAiAgent);
app.mount('#app');
```

```javascript
inject('tsAiChat', tsAiChat);
```

## 局部引入

```javascript
import { tsAiChat } from '@trasen/trasenAiAgent';
```

## 使用示例

```javascript
<template>
    <div  @click="startChat">sdk测试</div>
</template>
data() {
    return {
        tsAiChat: null
    }
},
methods: {
    async startChat() {
        this.tsAiChat = new tsAiChat();

		//ollama 配置
        const ollamaOptions = {
            url: 'http://192.168.18.229:11434/api/chat',
            type: 'ollama',
            data: {
                model: 'deepseek-r1:32b',
                stream: true,
                messages: [{ role: 'system', content: '你是一个医疗专家，请根据用户的问题给出专业的回答。' }, { role: 'user', content: '你好，这是一个测试消息' }]
            }
        }

		//dify 配置  dify的提示词在工作室编排中配置
        const difyOptions = {
            url: 'http://192.168.208.29:5001/v1/chat-messages',
            type: 'dify',
            apiKey: 'app-9FxRptPkVKERXRHQ9Nb',
            data: {
                inputs: {},
                query: '你好，这是一个测试消息',
                response_mode: 'streaming',
                conversation_id: '',
                user: 'abc-123'
            }
        }

		const response = await this.tsAiChat.chatStream(ollamaOptions);

        // 处理流式响应
        await this.tsAiChat.processStream(response, {
            onMessage: content => {
                console.log('收到消息:', content);
            },
            onComplete: () => {
                console.log('对话结束');
            }
        });
    }

    stopChat() {
        this.tsAiChat.stopStream();
    }
}
```
