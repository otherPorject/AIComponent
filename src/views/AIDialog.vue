<template>
    <div style="width: 100%; height: 100%; box-sizing: border-box; padding-bottom: 40px">
<!--        <el-button @click="sendMsg">点我</el-button>-->
        <ts-ai-agent ref="tsAiAgentRef" :api-options="apiOptions" />
    </div>
</template>
<script setup lang="ts">
import { tsAiAgent } from '@/components/index';
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
import { queryFileAssistantDto } from '@/apis/index';
import { ElMessage } from 'element-plus';

const inputs = ref({
    age: '',
    p_icd: '',
    allerg: '',
    sex: '',
    icd: '',
    med_depart: ''
});
const currentdeCodeVo = ref({});
const tsAiAgentRef = ref(null);
const apiKey = ref('app-swudglBXoNWB3haZZcit5jKB')

async function handlerMessage(event) {
    console.log('页面收到消息:', event.data);

    const { data: eventData = {} } = event || {};
    const { data, type } = eventData;
    if (type == 'openAI') {
        apiKey.value = data.apiKey;
        await getMedicalRecordWritingAssistance(data.visitInfo);
        await getOtherMessage(currentdeCodeVo.value);
        const requiredKeyMap = {
            age: '年龄',
            sex: '性别',
            med_depart: '挂号科室',
            icd: '当前诊断'
        };
        let msgText = '';
        Object.keys(requiredKeyMap).forEach(key => {
            if (!inputs.value[key]) {
                msgText += `${requiredKeyMap[key]}，`;
            }
        });
        if (msgText) {
            ElMessage.warning(`${msgText.slice(0, -1)} 未填写`);
        }
        window.parent.postMessage(
            {
                type: 'openAI'
            },
            '*'
        );
        tsAiAgentRef.value?.inputEnter(data.query||'病历书写辅助');
    }
}
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

const apiOptions = computed(() => {
    const { type, apiKey } = props;
    const { AIType = type, AIApiKey = apiKey, AIStream = true } = window as any;
    if (AIType == 'dify') {
        return {
            type: 'dify',
            url: '/tansenAI-dify/chat-messages',
            stream: true,
            inputs: inputs.value,
            apiKey: AIApiKey
        };
    } else {
        return {
            type: AIType,
            url: 'http://192.168.1.177:8000/v1/chat/completions',
            model: 'Qwen3:8B',
        };
    }
});
watch(
    () => {
        return apiKey.value;
    },
    newVal => {
        apiOptions.value.apiKey = newVal;
    },
    {
        immediate: true,
        deep: true
    }
);
watch(
    () => {
        return inputs.value;
    },
    newVal => {
        apiOptions.value.inputs = newVal;
    },
    {
        immediate: true,
        deep: true
    }
);
onMounted(() => {
    window.addEventListener('message', handlerMessage);
});
onBeforeUnmount(() => {
    window.removeEventListener('message', handlerMessage);
});

function getOtherMessage(deCodeVo) {
    console.log('deCodeVo', deCodeVo);
    return new Promise(resolve => {
        window.parent.postMessage(
            {
                type: 'getOtherMessage',
                data: JSON.parse(JSON.stringify(deCodeVo))
            },
            '*'
        );

        function messageHandler(event) {
            console.log('AI页面获取到消息', event);
            if (event.data.type == 'setOtherMessage') {
                const data = event.data.data;
                console.log('AI页面获取到消息,这是入参', { ...inputs.value });
                console.log('AI页面获取到消息,这是拿到的参数', { ...data });
                inputs.value = {
                    ...inputs.value,
                    ...data
                };
                window.removeEventListener('message', messageHandler);
                resolve(data);
            }
        }

        window.addEventListener('message', messageHandler);
    });
}

async function getMedicalRecordWritingAssistance(patientInfo) {
    const res = await queryFileAssistantDto(patientInfo.visitId);
    console.log('res', res);
    if (res.Code == 200) {
        const { deCodeVo, ...rest } = res.data;
        currentdeCodeVo.value = deCodeVo;
        await getOtherMessage(deCodeVo);
        inputs.value = {
            ...inputs.value,
            age: rest.age,
            p_icd: rest.historyIcd,
            allerg: rest.allerg,
            sex: rest.sex,
            icd: rest.icd,
            med_depart: rest.medDepart
        };
        console.log('AI请求到消息,inputs', { ...inputs.value });
    }
}

function sendMsg() {
    tsAiAgentRef.value?.inputEnter('病历书写辅助');
}
</script>

<style scoped lang="scss"></style>
