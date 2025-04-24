import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const build = {
        outDir: mode == 'web' ? 'smartCode' : 'trasenAiAgent',
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: mode == 'web' ? [] : ['vue'],
            output:
                mode == 'web'
                    ? {}
                    : {
                          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                          globals: {
                              vue: 'Vue'
                          }
                      }
        }
    };
    if (mode != 'web') {
        build.lib = {
            entry: path.resolve(__dirname, './src/components/index.js'),
            name: 'trasenAiAgent',
            fileName: 'trasenAiAgent'
        };
    }
    return {
        base: '/smartCode',
        plugins: [vue()],
        build,
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            proxy: {
                '/ts-bs-his/ts-pfs-emr': {
                    target: 'http://192.168.209.103:9099',
                    secure: false,
                    changeOrigin: true,
                    configure: (proxy) => {
                        const encryptedList = ['appId', 'randomStr', 'timestamp', 'version', 'sign']
                        proxy.on('proxyReq', function(proxyReq, req) {
                            encryptedList.forEach((item) => {
                                proxyReq.setHeader(item, req.headers[item.toLocaleLowerCase()] || req.headers[item])
                            })
                        })
                    }
                },
                '/tansenAI-dify': {
                    target: 'http://192.168.208.29:5001/v1',
                    secure: true,
                    changeOrigin: true,
                    rewrite: path => {
                        return path.replace(/^\/tansenAI-dify/, '');
                    }
                },
                '/tansenAI-ollama': {
                    target: 'http://192.168.18.229:11434/api',
                    secure: true,
                    changeOrigin: true,
                    rewrite: path => {
                        return path.replace(/^\/tansenAI-ollama/, '');
                    }
                }
            }
        }
    };
});
