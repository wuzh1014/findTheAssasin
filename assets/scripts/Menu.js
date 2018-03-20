cc.Class({
    extends: cc.Component,

    properties: {
        audioMng: cc.Node
    },

    onLoad: function () {
        // this.audioMng = this.audioMng.getComponent('AudioMng');
        // this.audioMng.playMusic();
        cc.director.preloadScene('table', function () {
            cc.log('Next scene preloaded');
        });
    },

    playGame: function () {
        cc.director.loadScene('table');
    },

    update: function (dt) {

    },
});
