cc.Class({
    extends: cc.Component,

    properties: {
        audioMng: cc.Node
    },

    onLoad: function () {
        // this.audioMng = this.audioMng.getComponent('AudioMng');
        // this.audioMng.playMusic();
        cc.director.preloadScene('table', function () {});
        let userData = cc.find('userData');
        if (!userData){
            userData = new cc.Node();
            userData.setName('userData');
            cc.game.addPersistRootNode(userData);
        }
    },
    playGame: function (event, matchType) {
        let userData = cc.find('userData');
        if (userData){
            userData.matchType = matchType;
        }
        cc.director.loadScene('table');
    },
    update: function (dt) {

    },
});
