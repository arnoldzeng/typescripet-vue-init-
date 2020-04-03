import { GlobalState } from '@/entitys/globleState';
import { ChatInfo, UserInfo } from 'webrtc-zego/sdk/common/zego.entity';

export const setLoginStatus = 'setLoginStatus';
export const setAllStudentStatus = 'setAllStudentStatus';
export const setCameraStatus = 'setCameraStatus';
export const setUersInfo = 'setUersInfo';
export const setChatInfo = 'setChatInfo';
export const webrtcReset = 'webrtcReset';
export const setStartStatus = 'setStartStatus';

export default {
    [setLoginStatus](state: GlobalState, login: boolean) {
        state.isLogin = login;
    },
    [setAllStudentStatus](state: GlobalState, ban: boolean) {
        state.isAllBan = ban;
    },
    [setCameraStatus](state: GlobalState, camera: boolean) {
        state.cameraStatus = camera;
    },
    [setStartStatus](state: GlobalState, start: 0 | 1 | 2) {
        state.isStart = start;
    },
    [setUersInfo](state: GlobalState, users: UserInfo[]) {
        state.userList = users;
    },
    [setChatInfo](state: GlobalState, chatInfos: ChatInfo[]) {
        state.chatList = [...state.chatList, ...chatInfos];
    },
    [webrtcReset](state: GlobalState) {
        state.chatList = [];
        state.userList = [];
        state.isLogin = false;
    },
};
