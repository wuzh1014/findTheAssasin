'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        audioMng: cc.Node
    },

    onLoad: function onLoad() {
        // this.audioMng = this.audioMng.getComponent('AudioMng');
        // this.audioMng.playMusic();
        cc.director.preloadScene('table', function () {});
        var userData = cc.find('userData');
        if (!userData) {
            userData = new cc.Node();
            userData.setName('userData');
            cc.game.addPersistRootNode(userData);
        }
    },
    playGame: function playGame(event, matchType) {
        var userData = cc.find('userData');
        if (userData) {
            userData.matchType = matchType;
        }
        cc.director.loadScene('table');
    },
    update: function update(dt) {}
});