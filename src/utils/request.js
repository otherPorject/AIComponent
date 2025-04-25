/*
 * @Date: 2024-04-15 16:39:24
 * @LastEditors: AaronChu
 * @LastEditTime: 2024-11-28 10:36:41
 */
import axios from 'axios';
import CryptoJS from 'crypto-js';

const service = axios.create({
    baseURL: import.meta.env.VITE_APP_URL, // url = base url + request url
    timeout: 5000 // request timeout
});

// 请求拦截
service.interceptors.request.use(
    config => {
        config.headers['token'] = localStorage.getItem('token')||"3b2ad6c9-4d33-4d08-b00b-35e10cadc75e";
        // his6.0接入网关请求，后期可能会再增加其他接口前缀
        const appId = localStorage.getItem('appId') || sessionStorage.getItem('appId')||window.appId;
        const HISSignatureKey=localStorage.getItem('HISSignatureKey')||sessionStorage.getItem('HISSignatureKey')||window.HISSignatureKey
        let encrypted = {
            appId,
            randomStr: uuid(6),
            timestamp: new Date().getTime(),
            version: 'V1.0.0'
        };
        const queryString = Object.entries(encrypted)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        console.log('AI签名',HISSignatureKey,appId);
        const finalString = `${queryString}&${HISSignatureKey || 'e1ec93ae-e25f-434d-8a64-f70116430a33'}`;
        const signature = CryptoJS.MD5(finalString).toString();
        encrypted.sign = signature.toUpperCase();
        Object.assign(config.headers, encrypted);
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截
service.interceptors.response.use(
    response => {
        const res = response;
        if (res.status !== 200) {
            return Promise.reject(new Error(res.message || 'Error'));
        } else {
            const data = res.data;
            if (data.Code != 200) {
                return Promise.reject(data);
            }
            return res.data;
        }
    },
    error => {
        return Promise.reject(error);
    }
);

//  获取随机id，默认为16位
function uuid(num) {
    var s = [];
    var hexDigits = '0123456789abcdef';
    if (num) {
        var n = '';
        for (var i = 0; i < num; i++) {
            n = n + 'x';
        }
        return n.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0;
            var v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '';
    return s.join('');
}

export default service;
