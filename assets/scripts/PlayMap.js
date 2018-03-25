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
    onLoad: function () {
        let manager = cc.director.getCollisionManager();
		manager.enabled = true;
		// manager.enabledDebugDraw = true;
		// manager.enabledDrawBoundingBox = true;

        this.matchType = 1;
        this.timeFix = 0;
        this.matchId = '';
        this.userId = '';

        let userData = cc.find('userData');
        if (userData){
            this.matchType = userData.matchType;
        }
        this.userId = '' + new Date().getTime();
        let that = this;
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/game/getInMatch",
            data: {
                userId: this.userId,
                matchType: this.matchType
            },
            success: function(data){
                that.matchId = data.matchId;
                that.type = data.type;
                if (data.type === 'start'){
                    that.users = data.users;
                }else {
                    cc.find("AlertMsg/msg").getComponent('cc.Label').string = '请等待游戏开始';
                }
                that.asyncTime();
                that.initSocket();
            }
        });
    },
    asyncTime: function () {
        let that = this;
        setInterval(function () {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/game/asyncTime",
                data: {
                    userId: that.userId,
                    matchId: that.matchId
                },
                success: function(data){
                    that.timeFix = new Date().getTime() - data.timeStamp;
                }
            });
        }, 5000);
    },
    judgeUser: function (judgeId) {
        let that = this;
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/game/judgeUser",
            data: {
                userId: this.userId,
                matchId: this.matchId,
                judgeId: judgeId,
            },
            success: function(data){
                let result = data.result;
                let alertMsg = cc.find("AlertMsg/msg").getComponent('cc.Label');
                if (result === 'wrong') {
                    alertMsg.string = '对方不是刺客!';
                    setTimeout(function () {
                        alertMsg.string = '';
                    }, 1500);
                }else {
                    for (let i = 0; i < that.node.children.length; i++) {
                        if (that.node.children[i].user){
                            if (that.node.children[i].user.userId === judgeId){
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
                    if (result === 'win'){
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
    killUser: function (killId) {
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/game/killUser",
            data: {
                userId: this.userId,
                matchId: this.matchId,
                killId: killId,
            },
            success: function(data){
                let result = data.result;
                if (result){
                    for (let i = 0; i < that.node.children.length; i++) {
                        if (that.node.children[i].user){
                            if (that.node.children[i].user.userId === dataUser.userId){
                                actionUser = that.node.children[i];
                            }
                        }
                    }
                    // alert
                }else{

                }
            }
        });
    },
    initSocket: function () {
        this.socket = io('http://localhost:3000');
        let that = this;
        this.socket.on(this.matchId, function(data){
            if (that.type !== 'start'){
                cc.find("AlertMsg/msg").getComponent('cc.Label').string = '';
                that.type = 'start'
            }
            let type = data.type;
            if (type === 'end'){
                let dataUser;
                for (let k = 0; k < data.users.length; k++) {
                    if (data.users[k].userId === that.userId) {
                        dataUser = data.users[k];
                        break;
                    }
                }
                if (!dataUser){
                    cc.find("AlertMsg/msg").getComponent('cc.Label').string = '你已被识破';
                }else {
                    cc.find("AlertMsg/msg").getComponent('cc.Label').string = '你已胜利';
                }
                setTimeout(function () {
                    cc.director.loadScene('menu');
                }, 1500);
                return;
            }

            if (type === 'kill'){
                for (let k = 0; k < data.users.length; k++) {
                    for (let i = 0; i < that.node.children.length; i++) {
                        if (that.node.children[i].user){
                            if (that.node.children[i].user.userId === data.users[k].userId){
                                that.node.children[i].destroy();
                                break;
                            }
                        }
                    }
                }
                return;
            }

            let timeStamp = data.timeStamp;
            for (let k = 0; k < data.users.length; k++) {
                let dataUser = data.users[k];

                let actionUser;
                for (let i = 0; i < that.node.children.length; i++) {
                    if (that.node.children[i].user){
                        if (that.node.children[i].user.userId === dataUser.userId){
                            actionUser = that.node.children[i];
                        }
                    }
                }
                if (actionUser){
                    if (dataUser.userId === that.userId) {
                        return;
                    }

                    actionUser.getComponent('Man').pushWalk(dataUser.position);
                }else {
                    if (dataUser.userId === that.userId){
                        actionUser = cc.instantiate(that.playerPref);
                        actionUser.socket = that.socket;
                        actionUser.stackRunner = false;
                        actionUser.matchId = that.matchId;
                        actionUser.user = dataUser;
                        that.node.addChild(actionUser);
                        // actionUser.setPosition(this.getNewManPosition());
                        actionUser.setPosition(dataUser.position[0], dataUser.position[1]);
                    }else {
                        actionUser = cc.instantiate(that.manPref);
                        actionUser.socket = that.socket;
                        actionUser.stackRunner = true;
                        actionUser.matchId = that.matchId;
                        actionUser.user = dataUser;
                        that.node.addChild(actionUser);
                        actionUser.setPosition(dataUser.position[0], dataUser.position[1]);
                    }
                }
            }
        });
    },
    getNewManPosition: function () {
        let maxX = this.node.width / 2 - 20;
        let randX = cc.randomMinus1To1() * maxX;
        let maxY = this.node.height / 2 - 20;
        let randY = cc.randomMinus1To1() * maxY;
        return cc.p(randX, randY);
    }
});
