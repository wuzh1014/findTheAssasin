let Man = require('Man');

cc.Class({
    extends: Man,
    properties: {
        includeKeys: [cc.Integer]
    },
    onLoad: function () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.includeKeys = [cc.KEY.w, cc.KEY.s, cc.KEY.a, cc.KEY.d];
    },
    onDestroy: function () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },
    onKeyDown: function (event) {
        if (this.includeKeys.indexOf(event.keyCode) === -1){
            return;
        }
        this.walkFlag[this.includeKeys.indexOf(event.keyCode)] = 1;
        this.doWalkAction();
        this.doEmit();
    },
    doEmit: function (event) {
        this.kcpobj.send(JSON.stringify({
            matchId: this.node.matchId,
            userId: this.node.user.userId,
            position: [this.node.x, this.node.y],
            walkFlag: this.walkFlag,
        }));
    },
    onKeyUp: function (event) {
        if (this.includeKeys.indexOf(event.keyCode) === -1){
            return;
        }
        this.walkFlag[this.includeKeys.indexOf(event.keyCode)] = 0;
        this.doWalkAction();
        this.doEmit();
    }
});
