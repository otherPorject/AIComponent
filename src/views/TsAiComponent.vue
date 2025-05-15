<template>
    <div style="width: 100%; height: 100%; box-sizing: border-box; padding-bottom: 40px">
        <ts-ai-agent ref="tsAiAgentRef" :api-options="apiOptions" />
    </div>
</template>
<script setup lang="ts">
import { tsAiAgent } from '@/components/index';
import { computed, ref } from 'vue';

interface propsType {
    type: string;
    apiKey: string;
    showDebugger: boolean;
}

const props = withDefaults(defineProps<propsType>(), {
    type: 'dify',
    sysMsg: '你是一个医疗专家，请根据用户的问题给出专业的回答。',
    showDebugger: false
});
const tsAiAgentRef = ref(null);
const apiOptions = computed(() => {
    const { type, apiKey } = props;
    const { AIType = type, AIApiKey = apiKey, AIStream = true } = window as any;
    if (AIType == 'dify') {
        return {
            type: AIType,
            url: '/tansenAI-dify/chat-messages',
            stream: AIStream,
            apiKey: AIApiKey
        };
    } else {



        // return {
        //     type: AIType,
        //     url: '/tansenAI-ollama/chat',
        //     model: 'deepseek-r1:32b',
        //     sysMsg: AISysMsg
        // };
        return {
            type: AIType,
            url: 'http://192.168.3.177:8000/v1/chat/completions',
            model: 'Qwen3:8B',
        };
    }
});
</script>

<style scoped lang="scss"></style>
