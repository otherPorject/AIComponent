<template>
    <div style="width: 100%; height: 100%">
        <ts-ai-agent ref="tsAiAgentRef" :api-options="apiOptions" />
    </div>
</template>
<script setup lang="ts">
import { tsAiAgent } from './index';
import { computed, ref } from 'vue';

interface propsType {
    type: string;
    apiKey: string;
    sysMsg: string;
    showDebugger: boolean;
}

const props = withDefaults(defineProps<propsType>(), {
    type: 'dify',
    apiKey: '',
    sysMsg: '你是一个医疗专家，请根据用户的问题给出专业的回答。',
    showDebugger: false
});
const tsAiAgentRef = ref(null);
const apiOptions = computed(() => {
    const { type, apiKey, sysMsg } = props;
    const { AIType = type, AIApiKey = apiKey, AIStream = true, AISysMsg = sysMsg } = window as any;
    if (type == 'dify') {
        return {
            type: AIType,
            url: '/tansenAI-dify/chat-messages',
            stream: AIStream,
            apiKey: AIApiKey
        };
    } else {
        return {
            type: AIType,
            url: '/tansenAI-ollama/chat',
            model: 'deepseek-r1:32b',
            sysMsg: AISysMsg
        };
    }
});
</script>

<style scoped lang="scss"></style>
