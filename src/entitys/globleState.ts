import { ChatInfo, UserInfo } from 'webrtc-zego/sdk/common/zego.entity';

export interface GlobalState {
    isLogin: boolean;
    cameraStatus: boolean;
    isAllBan: boolean;
    isStart: 0 | 1 | 2; // 0未知 1已开始 2未开始
    userList: UserInfo[];
    chatList: ChatInfo[];
}
