<template>
    <div class="app-container">
        <div v-if="showDebugger" class="app-left">
            <button style="margin-bottom: 20px; cursor: pointer" @click="startChat">sdk测试</button>
            <div>
                你好，这是一个测试消息
                <button @click="sendMessage">发送</button>
            </div>
        </div>
        <div class="app-right">
            <ts-ai-agent ref="tsAiAgent" :api-options="apiOptions"></ts-ai-agent>
        </div>
    </div>
</template>

<script>
import { tsAiAgent, tsAiChat } from './components';
export default {
    components: {
        tsAiAgent
    },
    props: {
        type: {
            type: String,
            default: 'dify'
        },
        apiKey: {
            type: String,
            default: 'app-WboObg89hf3DbXnl1lekstBS'
        },
        sysMsg: {
            type: String,
            default: '你是一个医疗专家，请根据用户的问题给出专业的回答。'
        },
        showDebugger: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            tsAiChat: null
        };
    },
    computed: {
        apiOptions() {
            const { type, apiKey, sysMsg } = this.$props;
            const { AIType = type, AIApiKey = apiKey, AIStream = true, AISysMsg = sysMsg } = window;
            if (type == 'dify') {
                return {
                    type: AIType,
                    url: '/tansenAI-dify/chat-messages',
                    stream: AIStream,
                    apiKey: AIApiKey
                };
            }
            else {
                return {
                    type: AIType,
                    url: '/tansenAI-ollama/chat',
                    model: 'deepseek-r1:32b',
                    sysMsg: AISysMsg
                };
            }
        }
    },
    methods: {
        sendMessage() {
            this.$refs.tsAiAgent.inputEnter('你好，这是一个测试消息');
        },
        // 使用 async 函数来调用
        async startChat() {
            try {
                if (this.$props.type == 'ollama') {
                    // 调用 chatStream 方法获取流
                    this.tsAiChat = new tsAiChat();

                    const response = await this.tsAiChat.chatStream({
                        url: '/tansenAI-ollama/chat',
                        type: 'ollama',
                        data: {
                            model: 'deepseek-r1:32b',
                            stream: true,
                            messages: [
                                {
                                    role: 'user',
                                    content: '你好，这是一个测试消息'
                                }
                            ]
                        }
                    });

                    // 处理流式响应
                    await this.tsAiChat.processStream(response, {
                        onMessage: content => {
                            console.log('收到消息:', content);
                        },
                        onComplete: () => {
                            console.log('对话结束');
                        }
                    });
                } else if (this.type == 'dify') {
                    // 调用 chatStream 方法获取流
                    this.tsAiChat = new tsAiChat();

                    const response = await this.tsAiChat.chatStream({
                        url: '/tansenAI-dify/chat-messages',
                        type: 'dify',
                        apiKey: 'app-9FxRptPkVKERXRHQ9NbedOWn',
                        data: {
                            inputs: {},
                            query: '你好，这是一个测试消息',
                            response_mode: 'streaming',
                            conversation_id: '',
                            user: 'abc-123'
                        }
                    });

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
            } catch (error) {
                console.error('对话出错:', error);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.app-container {
    width: 100%;
    height: 100%;
    display: flex;

    .app-left {
        flex: 1;
        padding: 20px;
    }

    .app-right {
        flex: 1;
    }
}
</style>
