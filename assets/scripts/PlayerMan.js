'use strict';

var Man = require('Man');

cc.Class({
    extends: Man,
    properties: {
        includeKeys: [cc.Integer]
    },
    onLoad: function onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.includeKeys = [cc.KEY.w, cc.KEY.s, cc.KEY.a, cc.KEY.d];
        this.loadTouch();
    },
    onDestroy: function onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },
    onKeyDown: function onKeyDown(event) {
        if (this.includeKeys.indexOf(event.keyCode) === -1) {
            return;
        }
        this.walkFlag[this.includeKeys.indexOf(event.keyCode)] = 1;
        this.doWalkAction();
        this.doEmit();
    },
    doEmit: function doEmit() {
        this.node.socket.emit('move', {
            matchId: this.node.matchId,
            userId: this.node.user.userId,
            position: [this.node.x, this.node.y],
            walkFlag: this.walkFlag
        });
    },
    onKeyUp: function onKeyUp(event) {
        if (this.includeKeys.indexOf(event.keyCode) === -1) {
            return;
        }
        this.walkFlag[this.includeKeys.indexOf(event.keyCode)] = 0;
        this.doWalkAction();
        this.doEmit();
    }
});