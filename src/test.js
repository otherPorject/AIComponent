export class MockSSEResponse {
    // 构造函数初始化 MockSSEResponse 类
    constructor(data, delay = 300, error = false) {
        this.data = data; // 存储模拟数据
        this.delay = delay; // 延迟时间，默认为300毫秒
        this.error = error; // 是否模拟错误
        this.encoder = new TextEncoder(); // 文本编码器
        this.stream = new ReadableStream({
            // 流的开始方法
            start: (controller) => {
                this.controller = controller; // 存储流控制器
                if (!this.error) {
                    setTimeout(() => this.pushData(), this.delay); // 如果没有错误，开始推送数据
                }
            },
            // 流的取消方法
            cancel: (reason) => {
                console.log('Stream canceled', reason); // 打印取消原因
            }
        });
    }


    // 推送数据方法
    pushData() {
        if (this.data.length === 0) {
            this.controller.close(); // 如果数据为空，关闭控制器
            return;
        }
        try {
            const chunk = this.data.slice(0, 1); // 获取数据的第一部分
            this.data = this.data.slice(1); // 更新剩余数据
            this.controller.enqueue(this.encoder.encode(chunk)); // 将数据块加入队列
            if (this.data.length > 0) {
                setTimeout(() => this.pushData(), this.delay); // 如果还有数据，继续推送
            } else {
                setTimeout(() => this.controller.close(), this.delay); // 没有数据时，延迟后关闭控制器
            }
        } catch (error) {
            console.error('Error in pushData:', error); // 捕获并打印错误
        }
    }

    // 获取响应方法
    getResponse() {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.error) {
                    const errorResponseOptions = { status: 500, statusText: 'Internal Server Error' }; // 错误响应选项
                    resolve(new Response(null, errorResponseOptions)); // 解析为错误响应
                } else {
                    resolve(new Response(this.stream)); // 解析为正常响应

                }
            }, this.delay);
        });
    }
}
