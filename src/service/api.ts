import axios from 'axios';
// axios.defaults.withCredentials = true;
axios.interceptors.response.use(
    (response: any) => {
        if (response.status === 200) {
            return response.data;
        } else {
            return response;
        }
    },
    (error: any) => {
        return Promise.reject(error);
    },
);
export const fetch = axios;

let { VUE_APP_HTTP_PREFIX: http_prefix } = process.env;
console.log('http_prefix', http_prefix);
export const classToken = http_prefix + '/class/token'; // 获取token
export const classLogin = http_prefix + '/class/login'; // 登录
