class TsAiAgent {
    constructor() {
        this.controller = new AbortController();
    }

    async chatStream(options = {}) {
        this.type = options.type;
        try {
            const response = await fetch(options.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: options.type == 'dify' ? `Bearer ${options.apiKey}` : ''
                },
                body: JSON.stringify(options.data),
                signal: this.controller.signal
            });
            return response;
        } catch (error) {
            return {
                ok: false,
                statusText: error.message
            };
        }
    }

    async processStream(response, options) {
        const { onMessage, onComplete } = options;
        if (!response.ok) {
            onComplete?.(false, response.statusText);
            return;
        }
        const reader = response?.body?.getReader();
        this.reader = reader;
        if (!reader) return;

        const decoder = new TextDecoder('utf-8', { stream: true });

        let buffer = '';
        let isDone = false;
        // 持续读取数据
        while (!isDone) {
            const { done, value } = await reader.read();
            if (done) {
                isDone = true;
                onComplete?.(true);
                break;
            }
            // 解码并累积数据
            buffer += decoder.decode(value, { stream: true });
            // 按换行符分割行
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留未处理的不完整行
            // 处理每行 JSON
            for (const line of lines) {
                if (line.trim() === '') continue; // 忽略空行
                try {
                    if (this.type == 'ollama') {
                        const json = JSON.parse(line);
                        onMessage(json);
                    } else if (this.type == 'dify') {
                        if (line.startsWith('data:') && line.endsWith('}')) {
                            const json = JSON.parse(line.slice(5).trim());
                            if (json.event == 'message') {
                                onMessage(json);
                            }
                        }
                    } else if (this.type == 'vllm') {
                        if (line.startsWith('data:') && line.endsWith('}')) {
                            const json = JSON.parse(line.slice(5).trim());
                            onMessage(json);
                        }
                    }
                } catch (err) {
                    console.warn('JSON 解析失败:', err, '原始数据:', line);
                }
            }
        }
    }

    stopStream() {
        this.reader && this.reader.cancel();
        this.controller && this.controller.abort();
    }
}

export default TsAiAgent;
