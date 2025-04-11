import tsAiAgent from './tsAiAgent.vue';
import tsAiChat from './tsAiChat.js';

const install = (app) => {
    app.component('TsAiAgent', tsAiAgent);
    app.provide('tsAiChat', tsAiChat);
};

export { tsAiAgent, tsAiChat };

const trasenAiAgent = {
    install
}

export default trasenAiAgent;
