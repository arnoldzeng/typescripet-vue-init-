import { ZegoClient } from 'webrtc-zego';
import { ChatInfo, ERRO, StreamInfo, UserInfo } from 'webrtc-zego/sdk/common/zego.entity';
import { classToken, fetch } from './api';
import store from '@/store';
import { setChatInfo, setUersInfo, webrtcReset, setCameraStatus, setAllStudentStatus } from '@/store/mutations';
import { Room, WhiteWebSdk } from 'white-web-sdk';
import Vue from 'vue';

let v = new Vue();

class WebrtcService {
    private zg!: ZegoClient;
    public idName: string = new Date().getTime() + '';
    private isPreviewed = false;
    private previewVideo!: HTMLVideoElement;
    private previewStreamId!: string;
    public banUserlist: string[] = [];

    private previewScreenVideo!: HTMLVideoElement | null;
    public useLocalStreamList: StreamInfo[] = [];
    private logined = false;
    public room!: Room;
    private roomJson!: { uuid: string; roomToken: string };
    private publishStreamId = 'stream' + this.idName;

    private pushCallBackStack: { [index: string]: any } = {};
    private playCallBackStack: { [index: string]: any } = {};

    private isLogin = false;
    public constructor() {
        this.zg = new ZegoClient();
        this.zg.setUserStateUpdate(true);

        this.zg.onRecvRoomMsg = this.onRecvRoomMsg;
        this.zg.onRecvCustomCommand = (from_idName, from_nickName, custom_content: any) => {
            store.commit(setAllStudentStatus, custom_content.studentBan);
            console.error('onRecvCustomCommand', custom_content);
        };
        this.zg.onPublishQualityUpdate = (streamid, quality) => {
            console.info(
                '#' +
                    streamid +
                    '#' +
                    'publish ' +
                    ' audio: ' +
                    quality.audioBitrate +
                    ' video: ' +
                    quality.videoBitrate +
                    ' fps: ' +
                    quality.videoFPS,
            );
        };

        this.zg.onPlayQualityUpdate = (streamid, quality) => {
            console.info(
                '#' +
                    streamid +
                    '#' +
                    'play ' +
                    ' audio: ' +
                    quality.audioBitrate +
                    ' video: ' +
                    quality.videoBitrate +
                    ' fps: ' +
                    quality.videoFPS,
            );
        };
        const that: this = this;
        this.zg.onStreamUpdated = (type, streamList) => {
            // console.log("TCL: WebrtcService -> this.zg.onStreamUpdated -> type", streamList)
            if (type == 0) {
                // console.log("TCL: WebrtcService -> this.zg.onStreamUpdated -> type", type)
                // console.log("TCL: WebrtcService -> this.zg.onStreamUpdated -> type", streamList)
                for (let i = 0; i < streamList.length; i++) {
                    that.useLocalStreamList.push(streamList[i]);
                    that.play(streamList[i]);
                }
            } else if (type == 1) {
                for (let k = 0; k < that.useLocalStreamList.length; k++) {
                    for (let j = 0; j < streamList.length; j++) {
                        if (that.useLocalStreamList[k].stream_id === streamList[j].stream_id) {
                            that.zg.stopPlayingStream(that.useLocalStreamList[k].stream_id);

                            console.info(that.useLocalStreamList[k].stream_id + 'was devared');
                            that.stopPlay(streamList[j], that.useLocalStreamList.length === 1);
                            that.useLocalStreamList.splice(k, 1);
                            break;
                        }
                    }
                }
            }
        };
        this.zg.onUserStateUpdate = (
            roomId: string,
            userList: {
                action: 1 | 2;
                idName: string;
                nickName: string;
                role: 1 | 2;
                logintime: string;
            }[],
        ) => {
            console.warn('onUserStateUpdate call', userList.length);
            let changeUserList = [...store.state.userList];
            userList.forEach(user => {
                if (user.action === 1) {
                    changeUserList.push(user);
                } else if (user.action === 2) {
                    const index = changeUserList.findIndex(item => item.idName === user.idName);
                    changeUserList.splice(index, 1);
                }
                store.commit(setUersInfo, changeUserList);
            });
        };
        this.zg.onGetTotalUserList = (
            roomId: string,
            userList: {
                idName: string;
                nickName: string;
                role: 1 | 2;
                logintime: string;
            }[],
        ) => {
            console.warn('onGetTotalUserList call', userList.length);
            store.commit(setUersInfo, userList);
        };

        this.zg.onRecvEndJoinLiveCommand = (
            requestId: string,
            from_userid: string,
            from_username: string,
            roomid: string,
        ) => {
            this.onRecvEndJoinLiveCommand(requestId, from_userid, from_username, roomid);
        };

        this.zg.onStreamExtraInfoUpdated = (streamList: StreamInfo[]) => {
            this.onStreamExtraInfoUpdated(streamList);
            streamList.forEach(stream => {
                if (stream.extra_info.includes('cameraStatus')) {
                    const extraInfo = JSON.parse(stream.extra_info);
                    store.commit(setCameraStatus, extraInfo.cameraStatus);
                }
                if (stream.stream_id.startsWith('stream')) {
                    const extraInfo = JSON.parse(stream.extra_info);
                    store.commit(setAllStudentStatus, !!extraInfo.studentBan);
                }
            });
        };
        this.zg.onRecvReliableMessage = (type: string, seq: number, data: string) => {
            // 停止因为暴力退出，不能下线的学生
            if (data) {
                const msg: any = JSON.parse(data);
                if (msg.forceToDelete === 1 && msg.streamId) {
                    const m = this.useLocalStreamList.findIndex(s => s.stream_id === msg.streamId);
                    if (m > -1) {
                        that.stopPlay(this.useLocalStreamList[m], this.useLocalStreamList.length === 1);
                        this.useLocalStreamList.splice(m, 1);
                    }
                }
            }
        };

        this.zg.onPublishStateUpdate = (type: number, streamid: string, error: ERRO | number) => {
            if (this.pushCallBackStack[streamid]) {
                if (type === 1) {
                    typeof this.pushCallBackStack[streamid]['count'] != 'undefined'
                        ? ++this.pushCallBackStack[streamid]['count']
                        : (this.pushCallBackStack[streamid]['count'] = 1);
                    if (this.pushCallBackStack[streamid]['count'] > 2) {
                        v.$message.error('由于网络原因，推流失败了，刷新页面再重试一下吧！！');
                        console.error('推流', streamid, error);
                    } else {
                        this.pushCallBackStack[streamid].error();
                    }
                } else if (type === 0) {
                    this.pushCallBackStack[streamid].success();
                }
            }
        };
        this.zg.onPlayStateUpdate = (type: number, streamid: string, error: ERRO | number) => {
            if (this.playCallBackStack[streamid]) {
                if (type === 1) {
                    typeof this.playCallBackStack[streamid]['count'] != 'undefined'
                        ? ++this.playCallBackStack[streamid]['count']
                        : (this.playCallBackStack[streamid]['count'] = 1);
                    if (this.playCallBackStack[streamid]['count'] > 2) {
                        v.$message.error('由于网络原因，拉流失败了，刷新页面再重试一下吧！！');
                        console.error('拉流', streamid, error);
                    } else {
                        this.playCallBackStack[streamid].error();
                    }
                } else if (type === 0) {
                    this.playCallBackStack[streamid].success();
                }
            }
        };
        this.zg.onDisconnect = (err: any) => {
            v.$message.error('由于网络原因，直播服务器断开了，刷新页面再重试一下吧！！');
            console.error('onDisconnect', err);
        };
    }

    public config(id: any) {
        let { VUE_APP_SDK_SERVER: sdkServer, NODE_ENV: currentEnv } = process.env;
        // console.log('sdkServer', sdkServer.replace(/{id}/, id));
        this.zg.config({
            appid: id,
            idName: this.idName,
            nickName: 'u' + this.idName,
            //server: 'wss://webliveroom-test.zego.im/ws',
            // server: `wss://webliveroom${id}-api.zego.im/ws`, // 正式环境
            server: sdkServer.replace(/{id}/, id),
            logLevel: 0,
            logUrl: '',
            remoteLogLevel: 0,
            audienceCreateRoom: true,
            // testEnvironment: currentEnv !== 'production',
        });
    }

    public login(roomId: string, role: 1 | 2, appId: number, userId: string, isForce?: boolean) {
        this.config(appId);
        return new Promise<StreamInfo[]>((resolve, reject) => {
            // 进入页面前 已经登录过判断是否开播
            if (this.isLogin && !isForce) {
                resolve(this.useLocalStreamList);
            } else {
                fetch
                    .post(classToken, {
                        idname: this.idName,
                        app_id: appId,
                        user_id: userId,
                    })
                    .then(
                        async (res: any) => {
                            const { token } = res;
                            this.zg.login(
                                roomId,
                                role,
                                token,
                                (list: StreamInfo[]) => {
                                    this.logined = true;
                                    this.useLocalStreamList = list;
                                    this.isLogin = true;
                                    resolve(list);
                                },
                                (err: ERRO) => {
                                    this.logined = false;
                                    // 主要的问题就是 token 错误
                                    v.$message.error('开启直播失败，请检查AppId或者AppSign是否正确');
                                    console.error(err);
                                    reject(err);
                                },
                            );
                        },
                        () => {
                            v.$message.error('获取token失败！！');
                        },
                    );
            }
        });
    }

    public live(
        localVideo: HTMLVideoElement,
        streamId: string,
        extroInfo?: {
            withWB: 1 | 0;
            withScreen: 1 | 0;
            WBJson: any;
        },
        cameraStatus?: boolean,
        suc?: () => void,
    ) {
        if (this.logined) {
            return this.zg.startPreview(
                localVideo,
                {
                    audio: true,
                    //@ts-ignore
                    audioInput: null,
                    //@ts-ignore
                    videoInput: null,
                    video: true,
                    videoQuality: 2,
                    horizontal: true,
                    facingMode: 'user',
                },
                () => {
                    this.isPreviewed = true;
                    this.previewVideo = localVideo;
                    this.publishStreamId = streamId ? streamId : this.publishStreamId;
                    if (extroInfo && extroInfo.withWB === 1) {
                        extroInfo = { ...extroInfo, WBJson: this.roomJson };
                    }

                    this.zg.startPublishingStream(
                        this.publishStreamId,
                        localVideo,
                        extroInfo ? JSON.stringify(extroInfo) : '{}',
                        {
                            videoDecodeType: 'VP8',
                        },
                    );
                    this.pushCallBackStack[this.publishStreamId] = {
                        error: () => {
                            this.zg.startPublishingStream(
                                this.publishStreamId,
                                localVideo,
                                extroInfo ? JSON.stringify(extroInfo) : '{}',
                                {
                                    videoDecodeType: 'VP8',
                                },
                            );
                        },
                        success: () => {
                            console.warn(this.publishStreamId, 'publish succed');
                        },
                    };
                    if (cameraStatus) {
                        this.toggleVideo(false);
                    }
                    suc && suc();
                },
                (err: any) => {
                    console.error('preview failed', err);
                },
            );
        } else {
            return false;
        }
    }

    public preview(
        localVideo: HTMLVideoElement,
        streamId: string,
        extroInfo?: {
            withWB: 1 | 0;
            withScreen: 1 | 0;
            WBJson: any;
            audio?: boolean;
            video?: boolean;
        },
    ) {
        return this.zg.startPreview(
            localVideo,
            {
                audio: true,
                //@ts-ignore
                audioInput: null,
                //@ts-ignore
                videoInput: null,
                video: true,
                videoQuality: 2,
                horizontal: true,
                facingMode: 'user',
            },
            () => {
                this.isPreviewed = true;
                this.previewVideo = localVideo;
                this.publishStreamId = streamId ? streamId : this.publishStreamId;
                if (extroInfo && extroInfo.withWB === 1) {
                    extroInfo = { ...extroInfo, WBJson: this.roomJson };
                }

                this.zg.startPublishingStream(
                    this.publishStreamId,
                    localVideo,
                    extroInfo ? JSON.stringify(extroInfo) : '{}',
                    {
                        videoDecodeType: 'VP8',
                    },
                );
            },
            (err: any) => {
                console.error('preview failed', err);
            },
        );
    }

    public stopPreview(video: HTMLVideoElement) {
        this.zg.stopPreview(video);
    }

    public stopPublish(streamId: string) {
        delete this.pushCallBackStack[streamId];
        this.zg.stopPublishingStream(streamId);
    }

    public reLive(
        localVideo: HTMLVideoElement,
        extroInfo: {
            withWB: 1 | 0;
            withScreen: 1 | 0;
            WBJson: any;
        },
        streamId: string,
        cameraStatus?: boolean,
    ) {
        if (this.isPreviewed) {
            this.isPreviewed = false;
            localVideo.srcObject = this.previewVideo.srcObject;
            this.isPreviewed = true;
            this.publishStreamId = streamId ? streamId : this.publishStreamId;
            if (extroInfo && extroInfo.withWB === 1) {
                extroInfo = { ...extroInfo, WBJson: this.roomJson };
            }
            this.updateStreamExtraInfo(streamId, JSON.stringify(extroInfo));
            return true;
        }
        return false;
    }

    public replay(localVideo: HTMLVideoElement, streamId: string) {
        this.zg.stopPlayingStream(streamId);
        this.pull(localVideo, streamId);
    }

    public pull(localVideo: HTMLVideoElement, streamId: string) {
        if (this.logined) {
            this.playCallBackStack[streamId] = {
                error: () => {
                    this.zg.startPlayingStream(streamId, localVideo, undefined, { videoDecodeType: 'VP8' });
                },
                success: () => {
                    console.warn(streamId, 'play succed');
                },
            };
            return this.zg.startPlayingStream(streamId, localVideo, undefined, { videoDecodeType: 'VP8' });
        } else {
            return false;
        }
    }

    // 外部覆盖 start
    public play(stream: StreamInfo) {}

    public onRecvReliableMessage(type: string, seq: number, data: string) {}

    public onRecvEndJoinLiveCommand(requestId: string, from_userid: string, from_username: string, roomid: string) {}

    public onStreamExtraInfoUpdated(streamList: StreamInfo[]) {}

    public stopPlay(stream: StreamInfo, isLastOne: boolean) {}

    // 外部覆盖 end

    public sendRoomMsg(content: string, userId: string) {
        if (!this.banUserlist.includes(userId)) {
            return new Promise((res, rej) => {
                this.zg.sendRoomMsg(
                    1,
                    1,
                    content,
                    (suc: any) => {
                        res(true);
                    },
                    (err: any) => {
                        console.error(err);
                        rej(false);
                    },
                );
            });
        }
    }

    private onRecvRoomMsg(chat_data: ChatInfo[], server_msg_id: number, ret_msg_id: number) {
        store.commit(setChatInfo, chat_data);
        setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document!.querySelector('.chatBody')!.scrollTop = (document!.querySelector(
                '.chatBody ul li:last-child',
            )! as any).offsetTop!;
        }, 100);
    }

    public sendCustomCommand(userList: string[], obj: string | Record<string, any>) {
        return new Promise((res, rej) => {
            this.zg.sendCustomCommand(
                userList,
                obj,
                (suc: any) => {
                    res(true);
                },
                (err: any) => {
                    console.error(err);
                    rej(false);
                },
            );
        });
    }

    public leaveRoom() {
        if (this.isPreviewed) {
            this.zg.stopPreview(this.previewVideo);
            this.zg.stopPublishingStream(this.publishStreamId);
            this.isPreviewed = false;
        }

        for (var i = 0; i < this.useLocalStreamList.length; i++) {
            this.zg.stopPlayingStream(this.useLocalStreamList[i].stream_id);
        }

        this.useLocalStreamList = [];
        this.playCallBackStack = {};
        this.pushCallBackStack = {};
        this.zg.logout();
        this.logined = false;
        store.commit(webrtcReset);
        return true;
    }

    public previewScreen(video: HTMLVideoElement) {
        return new Promise((resolve, reject) => {
            this.zg.startScreenSharing({}, false, (suc: boolean, stream: MediaStream, err?: string | undefined) => {
                if (suc) {
                    video.srcObject = stream;
                    this.zg.startPreview(
                        video,
                        {
                            audio: true,
                            //@ts-ignore
                            audioInput: null,
                            //@ts-ignore
                            videoInput: null,
                            video: true,
                            videoQuality: 2,
                            horizontal: true,
                            externalCapture: true,
                        },
                        () => {
                            this.previewScreenVideo = video;
                            resolve();
                        },
                        (err: any) => {
                            reject(err);
                        },
                    );
                } else {
                    console.error('屏幕分享失败：', err);
                    reject(err);
                }
            });
        });
    }

    public pushScreen(streamId: string) {
        if (this.previewScreenVideo) {
            this.previewStreamId = streamId;
            this.zg.startPublishingStream(
                this.previewStreamId,
                this.previewScreenVideo,
                JSON.stringify({
                    withScreen: 1,
                }),
                {
                    videoDecodeType: 'VP8',
                },
            );
            this.pushCallBackStack[this.previewStreamId] = {
                error: () => {
                    this.zg.startPublishingStream(
                        this.previewStreamId,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.previewScreenVideo!,
                        JSON.stringify({
                            withScreen: 1,
                        }),
                        {
                            videoDecodeType: 'VP8',
                        },
                    );
                },
                success: () => {
                    console.warn(this.publishStreamId, 'publish succed');
                },
            };
        } else {
            console.error('还没预览');
        }
    }

    public dumpOptionsInfo(video: HTMLVideoElement) {
        if (video.srcObject) {
            const videoObject: any = video.srcObject;
            const videoTrack: any = videoObject.getVideoTracks()[0];
            videoTrack.onended = (a: any, b: any) => {
                // stopCapture();
                this.stopScreen();
            };
        }
    }

    public stopScreen() {
        if (this.previewStreamId) {
            this.zg.stopPublishingStream(this.previewStreamId);
            delete this.pushCallBackStack[this.previewStreamId];
            this.previewStreamId = '';
        }

        if (this.previewScreenVideo) {
            this.zg.stopPreview(this.previewScreenVideo);
            this.previewScreenVideo = null;
        }
    }

    public toggleVideo(status: boolean) {
        this.zg.enableCamera(this.previewVideo, status);
    }

    public toggleAudio(status: boolean) {
        this.zg.enableMicrophone(this.previewVideo, status);
    }

    public endJoinLive(destIdName: string, success: () => void, error: () => void) {
        return this.zg.endJoinLive(destIdName, success, error);
    }

    public updateStreamExtraInfo(streamId: string, extraInfo: string) {
        if (extraInfo) {
            let extroInfoObj = JSON.parse(extraInfo);
            if (extroInfoObj && extroInfoObj.withWB === 1) {
                extroInfoObj = { ...extroInfoObj, WBJson: this.roomJson };
            }
            return this.zg.updateStreamExtraInfo(streamId, JSON.stringify(extroInfoObj));
        }
    }

    public sendReliableMsgToDelete(streamId: string) {
        return this.zg.sendReliableMessage(
            '1',
            JSON.stringify({
                streamId,
                forceToDelete: 1,
            }),
            () => {},
            err => {
                console.error('sendReliableMessage', err);
            },
        );
    }
}

export default new WebrtcService();
