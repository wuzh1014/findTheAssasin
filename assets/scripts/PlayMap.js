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
		manager.enabledDebugDraw = true;
		manager.enabledDrawBoundingBox = true;

        // this.userId = '123456';
        this.userId = '' + new Date().getTime();
        let that = this;
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/game/getInMatch",
            data: {
                userId: this.userId
            },
            success: function(data){
                that.users = data.users;
                that.matchId = data.matchId;
                that.loopSocket();
                that.init();
            }
        });
    },
    loopSocket: function () {
        this.socket = io('http://localhost:3000');
        let that = this;
        this.socket.on(this.matchId, function(data){
            let actionUser;
            for (let i = 0; i < that.node.children.length; i++) {
                if (that.node.children[i].user){
                    if (that.node.children[i].user.userId === data.userId){
                        actionUser = that.node.children[i];
                    }
                }
            }
            if (!actionUser){
                if (data.userId !== that.userId){
                    actionUser = cc.instantiate(that.manPref);
                    actionUser.socket = that.socket;
                    actionUser.user = data;
                    that.node.addChild(actionUser);
                    actionUser.setPosition(that.getNewManPosition());
                }
            }

            if (actionUser){
                if (data.userId !== that.userId){
                    actionUser.getComponent('Man').walkFlag = data.walkFlag;
                    actionUser.getComponent('Man').doWalkAction();
                    actionUser.getComponent('Man').node.x = data.position[0];
                    actionUser.getComponent('Man').node.y = data.position[1];
                }
            }
        });
    },
    init: function () {
        let newMan;
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].userId === this.userId){
                newMan = cc.instantiate(this.playerPref);
                newMan.socket = this.socket;
                newMan.matchId = this.matchId;
                newMan.user = this.users[i];
                this.node.addChild(newMan);
                newMan.setPosition(this.getNewManPosition());
            }
        }
    },
    onDestroy: function () {

    },
    getNewManPosition: function () {
        let maxX = this.node.width / 2 - 20;
        let randX = cc.randomMinus1To1() * maxX;
        let maxY = this.node.height / 2 - 20;
        let randY = cc.randomMinus1To1() * maxY;
        return cc.p(randX, randY);
    },
    update: function (dt) {
    }

});
