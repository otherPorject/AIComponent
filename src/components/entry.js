// src/entry.js
import { defineCustomElement } from 'vue'
import tsAiAgent from './tsAiAgent.vue'

// 转换为自定义元素
const tsAiAgentWebComponent = defineCustomElement(tsAiAgent)

// 注册自定义元素（必须包含短横线）
customElements.define('ts-ai-agent', tsAiAgentWebComponent)