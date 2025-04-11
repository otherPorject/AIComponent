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
                    'Authorization': options.type == 'dify' ? `Bearer ${options.apiKey}` : ''
                },
                body: JSON.stringify(options.data),
                signal: this.controller.signal
            });
            return response;
        } catch (error) {
            return {
                ok: false,
                statusText: error.message
            }
        }
    }

    async processStream(response, options) {
        let self = this;
        const { onMessage, onComplete } = options;
        if (!response.ok) {
            onComplete?.(false, response.statusText);
            return;
        }
        const reader = response?.body?.getReader();

        this.reader = reader;
        const decoder = new TextDecoder();
        if (!reader) return;
        const bufferArr = [];

        reader.read().then(function processText({ done, value }) {
            if (done) {
                onComplete?.(true);
                return;
            }
            const chunk = decoder.decode(value, { stream: true });
            const buffers = chunk.toString().split(/\r?\n/);
            bufferArr.push(...buffers);
            let i = 0;
            if (self.type == 'ollama') {
                while (i < bufferArr.length) {
                    if (bufferArr[i] && bufferArr[i].startsWith('{') && bufferArr[i].endsWith('}')) {
                        const line = JSON.parse(bufferArr[i]);
                        onMessage(line);
                    }
                    bufferArr.splice(i, 1);
                }
            } else if (self.type == 'dify') {
                while (i < bufferArr.length) {
                    if (bufferArr[i].startsWith('data:') && bufferArr[i].endsWith('}')) {
                        const line = JSON.parse(bufferArr[i].slice(5).trim());
                        if (line.event == 'message') {
                            onMessage(line);
                        }
                    }
                    bufferArr.splice(i, 1);
                }
            }
            reader.read().then(processText);
        });
    }
    stopStream() {
        this.reader && this.reader.cancel();
        this.controller && this.controller.abort();
    }
}


export default TsAiAgent;

