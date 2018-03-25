'use strict';

var serverUrl = 'http://47.88.54.29:3000';
// let serverUrl = 'http://localhost:3000';
cc.Class({
    extends: cc.Component,
    properties: {
        manPref: {
            default: null,
            type: cc.Prefab
        },
        playerPref: {
            default: null,
            type: cc.Prefab
        },
        randManCount: {
            default: 10
        }
    },
    onLoad: function onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
        // manager.enabledDrawBoundingBox = true;


        this.matchType = 1;
        this.timeFix = 0;
        this.matchId = '';
        this.userId = '';

        var userData = cc.find('userData');
        if (userData) {
            this.matchType = userData.matchType;
        }
        this.userId = '' + new Date().getTime();
        var that = this;
        $.ajax({
            type: "POST",
            url: serverUrl + "/game/getInMatch",
            data: {
                userId: this.userId,
                matchType: this.matchType
            },
            success: function success(data) {
                that.matchId = data.matchId;
                that.type = data.type;
                if (data.type === 'start') {
                    that.users = data.users;
                } else {
                    cc.find("AlertMsg/msg").getComponent('cc.Label').string = '请等待游戏开始';
                }
                that.asyncTime();
                that.initSocket();
            }
        });
    },
    asyncTime: function asyncTime() {
        var that = this;
        setInterval(function () {
            $.ajax({
                type: "POST",
                url: serverUrl + "/game/asyncTime",
                data: {
                    userId: that.userId,
                    matchId: that.matchId
                },
                success: function success(data) {
                    that.timeFix = new Date().getTime() - data.timeStamp;
                }
            });
        }, 5000);
    },
    judgeUser: function judgeUser(judgeId) {
        var that = this;
        $.ajax({
            type: "POST",
            url: serverUrl + "/game/judgeUser",
            data: {
                userId: this.userId,
                matchId: this.matchId,
                judgeId: judgeId
            },
            success: function success(data) {
                var result = data.result;
                var alertMsg = cc.find("AlertMsg/msg").getComponent('cc.Label');
                if (result === 'wrong') {
                    alertMsg.string = '对方不是刺客!';
                    setTimeout(function () {
                        alertMsg.string = '';
                    }, 1500);
                } else {
                    for (var i = 0; i < that.node.children.length; i++) {
                        if (that.node.children[i].user) {
                            if (that.node.children[i].user.userId === judgeId) {
                                that.node.children[i].destroy();
                                break;
                            }
                        }
                    }
                    if (result === 'right') {
                        alertMsg.string = '正确！对方是刺客';
                        setTimeout(function () {
                            alertMsg.string = '';
                        }, 1500);
                    }
                    if (result === 'win') {
                        alertMsg.string = '你已胜利';
                        setTimeout(function () {
                            alertMsg.string = '';
                            cc.director.loadScene('menu');
                        }, 1500);
                    }
                }
            }
        });
    },
    killUser: function killUser(killId) {
        $.ajax({
            type: "POST",
            url: serverUrl + "/game/killUser",
            data: {
                userId: this.userId,
                matchId: this.matchId,
                killId: killId
            },
            success: function success(data) {
                var result = data.result;
                if (result) {
                    for (var i = 0; i < that.node.children.length; i++) {
                        if (that.node.children[i].user) {
                            if (that.node.children[i].user.userId === dataUser.userId) {
                                actionUser = that.node.children[i];
                            }
                        }
                    }
                    // alert
                } else {}
            }
        });
    },
    initSocket: function initSocket() {
        this.socket = io(serverUrl);
        var that = this;
        this.socket.on(this.matchId, function (data) {
            if (that.type !== 'start') {
                cc.find("AlertMsg/msg").getComponent('cc.Label').string = '';
                that.type = 'start';
            }
            var type = data.type;
            if (type === 'end') {
                var _dataUser = void 0;
                for (var k = 0; k < data.users.length; k++) {
                    if (data.users[k].userId === that.userId) {
                        _dataUser = data.users[k];
                        break;
                    }
                }
                if (!_dataUser) {
                    cc.find("AlertMsg/msg").getComponent('cc.Label').string = '你已被识破';
                } else {
                    cc.find("AlertMsg/msg").getComponent('cc.Label').string = '你已胜利';
                }
                setTimeout(function () {
                    cc.director.loadScene('menu');
                }, 1500);
                return;
            }

            if (type === 'kill') {
                for (var _k = 0; _k < data.users.length; _k++) {
                    for (var i = 0; i < that.node.children.length; i++) {
                        if (that.node.children[i].user) {
                            if (that.node.children[i].user.userId === data.users[_k].userId) {
                                that.node.children[i].destroy();
                                break;
                            }
                        }
                    }
                }
                return;
            }

            var timeStamp = data.timeStamp;
            for (var _k2 = 0; _k2 < data.users.length; _k2++) {
                var _dataUser2 = data.users[_k2];

                var _actionUser = void 0;
                for (var _i = 0; _i < that.node.children.length; _i++) {
                    if (that.node.children[_i].user) {
                        if (that.node.children[_i].user.userId === _dataUser2.userId) {
                            _actionUser = that.node.children[_i];
                        }
                    }
                }
                if (_actionUser) {
                    if (_dataUser2.userId === that.userId) {
                        return;
                    }

                    _actionUser.getComponent('Man').pushWalk(_dataUser2.position);
                } else {
                    if (_dataUser2.userId === that.userId) {
                        _actionUser = cc.instantiate(that.playerPref);
                        _actionUser.socket = that.socket;
                        _actionUser.stackRunner = false;
                        _actionUser.matchId = that.matchId;
                        _actionUser.user = _dataUser2;
                        that.node.addChild(_actionUser);
                        // actionUser.setPosition(this.getNewManPosition());
                        _actionUser.setPosition(_dataUser2.position[0], _dataUser2.position[1]);
                    } else {
                        _actionUser = cc.instantiate(that.manPref);
                        _actionUser.socket = that.socket;
                        _actionUser.stackRunner = true;
                        _actionUser.matchId = that.matchId;
                        _actionUser.user = _dataUser2;
                        that.node.addChild(_actionUser);
                        _actionUser.setPosition(_dataUser2.position[0], _dataUser2.position[1]);
                    }
                }
            }
        });
    },
    getNewManPosition: function getNewManPosition() {
        var maxX = this.node.width / 2 - 20;
        var randX = cc.randomMinus1To1() * maxX;
        var maxY = this.node.height / 2 - 20;
        var randY = cc.randomMinus1To1() * maxY;
        return cc.p(randX, randY);
    }
});