<template>
    <drag-side @handleClick="isChatVisible = !isChatVisible" v-if="drag">
        <slot name="icon"></slot>
    </drag-side>
    <div class="chat-container" :class="{ 'chat-container-fixed': drag }" v-show="isChatVisible">
        <div class="chat-header">
            <slot name="header">
                <img src="../assets/logo.png" alt="logo" class="chat-header-logo" />
                <div class="chat-header-title">{{ title }}</div>
                <div class="chat-header-close" v-if="drag" @click="isChatVisible = false">×</div>
            </slot>
        </div>
        <div class="chat-content">
            <t-chat ref="chatRef" layout="both" style="height: 100%" :clear-history="chatList.length > 0 && !isStreamLoad" @clear="clearConfirm">
                <template v-for="(item, index) in chatList" :key="index">
                    <t-chat-item
                        :avatar="item.avatar"
                        :role="item.role"
                        :datetime="item.datetime"
                        :content="item.content"
                        :text-loading="index === 0 && loading"
                        :variant="item.variant || 'text'"
                    >
                        <template v-if="!isStreamLoad" #actions>
                            <slot name="actions">
                                <t-chat-action
                                    :operation-btn="['replay', 'copy']"
                                    :content="item.content"
                                    @operation="(type, { e }) => handleOperation(type, { e, index })"
                                />
                            </slot>
                        </template>
                    </t-chat-item>
                </template>
                <template #footer>
                    <t-chat-input :stop-disabled="isStreamLoad" @send="sendMessage" @stop="onStop"></t-chat-input>
                </template>
            </t-chat>
        </div>
    </div>
</template>
<script>
import avatar from '../assets/avatar.png';
import { Chat, ChatItem, ChatInput, ChatAction } from '@tdesign-vue-next/chat';
import '@tdesign-vue-next/chat/es/style/index.css';
import tsAiChat from './tsAiChat.js';
import DragSide from './dragSide.vue';

export default {
    name: 'TsChat',
    components: {
        TChat: Chat,
        TChatItem: ChatItem,
        TChatInput: ChatInput,
        TChatAction: ChatAction,
        DragSide
    },
    props: {
        title: {
            type: String,
            default: '创星医疗AI助手'
        },
        apiOptions: {
            type: Object,
            default: () => ({
                type: 'ollama',
                url: 'http://192.168.18.229:11434/api/chat',
                model: 'deepseek-r1:32b',
                sysMsg: '你是一个医疗专家，请根据用户的问题给出专业的回答。'
            })
        },
        drag: {
            type: Boolean,
            default: false
        }
    },
    created() {
        if (!this.drag) {
            this.isChatVisible = true;
        }
    },
    data() {
        return {
            loading: false,
            isStreamLoad: false,
            chatRef: null,
            chatList: [],
            tsAiChat: null,
            isChatVisible: false
        };
    },
    expose: {
        inputEnter(inputValue) {
            this.inputEnter(inputValue);
        }
    },
    methods: {
        backBottom() {
            this.chatRef.scrollToBottom({
                behavior: 'smooth'
            });
        },
        clearConfirm() {
            this.chatList = [];
        },
        handleOperation(type, options) {
            if (type === 'replay') {
                const userQuery = this.chatList[options.index + 1].content;
                this.inputEnter(userQuery);
            }
            this.$emit('operation', type, options, this.chatList[options.index + 2]);
        },
        sendMessage(inputValue) {
            this.$emit('send', inputValue);
            this.inputEnter(inputValue);
        },
        inputEnter(inputValue) {
            if (this.isStreamLoad) {
                return;
            }
            if (!inputValue) return;
            const params = {
                avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
                name: '自己',
                variant: 'base',
                content: inputValue,
                role: 'user'
            };
            this.chatList.unshift(params);
            // 空消息占位
            const params2 = {
                avatar: avatar,
                content: '',
                role: 'assistant'
            };
            this.chatList.unshift(params2);
            this.handleData(inputValue);
        },
        onStop() {
            this.tsAiChat.stopStream();
            this.loading = false;
        },
        async handleData(inputValue) {
            this.loading = true;
            this.isStreamLoad = true;
            const lastItem = this.chatList[0];

            try {
                // 调用 chatStream 方法获取流
                this.tsAiChat = new tsAiChat();
                let options = {};
                if (this.apiOptions.type == 'ollama' || this.apiOptions.type == 'vllm') {
                    options = {
                        url: this.apiOptions.url || 'http://192.168.18.229:11434/api/chat',
                        type: 'ollama',
                        data: {
                            model: this.apiOptions.model || 'deepseek-r1:32b',
                            messages: this.apiOptions.sysMsg
                                ? [
                                      { role: 'system', content: this.apiOptions.sysMsg },
                                      { role: 'user', content: inputValue }
                                  ]
                                : [
                                      { role: 'system', content: '你是一个医疗专家，请根据用户的问题给出专业的回答。' },
                                      { role: 'user', content: inputValue }
                                  ],
                            stream: true
                        }
                    };
                } else if (this.apiOptions.type == 'dify') {
                    options = {
                        url: this.apiOptions.url || 'http://192.168.208.29:5001/v1/chat-messages',
                        type: 'dify',
                        apiKey: this.apiOptions.apiKey,
                        data: {
                            inputs: this.apiOptions.inputs || {},
                            query: inputValue,
                            response_mode: 'streaming',
                            conversation_id: '',
                            user: 'abc-123'
                        }
                    };
                }

                const stream = await this.tsAiChat.chatStream(options);

                // 处理流式响应
                await this.tsAiChat.processStream(stream, {
                    onMessage: res => {
                        this.loading = false;
                        if (this.apiOptions.type == 'ollama') {
                            lastItem.content += res.message.content;
                        } else if (this.apiOptions.type == 'dify') {
                            if (res.event == 'message') {
                                lastItem.content += res.answer;
                            }
                        } else if (this.apiOptions.type == 'vllm') {
                            const content = res?.choices?.[0].delta.content;
                            if (content) {
                                lastItem.content += content;
                            }
                        }
                    },
                    onComplete: (isOk, msg) => {
                        if (!isOk) {
                            lastItem.role = 'error';
                            lastItem.content = msg;
                        }
                        // 控制终止按钮
                        this.isStreamLoad = false;
                        this.loading = false;
                        this.$emit('complete', lastItem);
                    }
                });
            } catch (error) {
                console.error('对话出错:', error);
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.chat-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .chat-header {
        width: 100%;
        height: 50px;
        background-color: #3b82f6;
        color: #fff;
        display: flex;
        align-items: center;
        border-radius: 4px;
        margin-bottom: 20px;
        position: relative;

        .chat-header-logo {
            width: 30px;
            height: 30px;
            margin: 0 10px;
        }

        .chat-header-title {
            font-size: 22px;
        }

        .chat-header-close {
            position: absolute;
            right: 12px;
            top: 8px;
            cursor: pointer;
            font-size: 32px;
        }
    }

    .chat-content {
        flex: 1;
        overflow: hidden;

        :deep(.t-chat) {
            .t-chat__detail {
                .t-chat__text__assistant {
                    color: #404040;
                }
            }
        }
    }
}

.chat-container-fixed {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    height: calc(100vh - 80px);
    z-index: 1000;
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}
</style>
