<template>
    <div style="width: 100%; height: 100%; box-sizing: border-box; padding-bottom: 40px">
        <ts-ai-agent ref="tsAiAgentRef" :api-options="apiOptions" />
    </div>
</template>
<script setup lang="ts">
import { tsAiAgent } from '@/components/index';
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { queryFileAssistantDto } from '@/apis/index';
import { ElMessage } from 'element-plus';

const inputs = ref({});
const openAI = ref(false);
const patientInfo = ref({});
const currentdeCodeVo=ref({})
const tsAiAgentRef = ref(null)
async function handlerMessage(event) {
    console.log('页面收到消息:', event.data)

    const { data: eventData = {} } = event || {};
    const { data, type } = eventData;
    if (type == 'visitInfo') {
        patientInfo.value = {
            ...patientInfo.value,
            ...data
        };
        getMedicalRecordWritingAssistance();
    }
    else if (type == 'openAI') {
        await getOtherMessage(currentdeCodeVo.value)
        const requiredKeyMap = {
            age: '年龄',
            sex: '性别',
            med_depart: '主诉',
            icd: '当前诊断'
        };
        let msgText = ''
        Object.keys(requiredKeyMap).forEach(key => {
            if (!inputs.value[key]) {
                msgText += `${requiredKeyMap[key]}，`
            }
        })
        if (msgText) {
            ElMessage.warning(`${msgText.slice(0, -1)} 未填写`)
        }
        openAI.value = true;
        tsAiAgentRef.value?.inputEnter('病历书写辅助')
    }
}

const apiOptions = computed( () => {
        return {
            type: 'dify',
            url: '/tansenAI-dify/chat-messages',
            stream: true,
            apiKey: 'app-swudglBXoNWB3haZZcit5jKB',
            inputs: inputs.value,
        };
});
onMounted(() => {
    window.addEventListener('message', handlerMessage);
});
onBeforeUnmount(()=>{
    window.removeEventListener('message', handlerMessage)
})

function getOtherMessage(deCodeVo) {
    return new Promise((resolve) => {
        window.parent.postMessage({
            type: 'getOtherMessage',
            data: deCodeVo
        }, '*');

        function messageHandler(event) {
            if(event.data.type == 'setOtherMessage') {
                const data= event.data.data
                inputs.value = {
                    ...inputs.value,
                    ...data
                };
                window.removeEventListener('message',messageHandler)
                resolve(data)
            }
        }

        window.addEventListener('message', messageHandler)
    })
}

async function getMedicalRecordWritingAssistance() {
    const res = await queryFileAssistantDto(patientInfo.value.visitId);
    console.log('res', res);
    if (res.Code == 200) {
        const { deCodeVo, ...rest } = res.data;
        currentdeCodeVo.value= deCodeVo
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
        console.log('inputs', inputs.value);
    }
}
</script>

<style scoped lang="scss"></style>
