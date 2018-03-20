cc.Class({
    extends: cc.Component,
    properties: {
        curAction: {
            default: -1
        },
        xspeed: 70,
        yspeed: 70,
        appendSpeed: 0,
        walkFlag: [cc.Integer],
        blockFlag: [cc.Integer],
        maxRandWalkSec: 5,
        walkAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        user: {
            visible: false,
            default: null,
        },
        actionList: {
            get: function () {
                return [
                    'walkUp',
                    'walkDown',
                    'walkLeft',
                    'walkRight'
                ];
            }
        },
        faceName: {
            get: function () {
                return [
                    '11',
                    '2',
                    '5',
                    '8'
                ];
            }
        }
    },
    onLoad: function () {
        // this.randWalk();
    },
    randWalk: function (){
        // let randSec = 1 + cc.random0To1() * this.maxRandWalkSec;
        // let moveFlag = cc.randomMinus1To1() > 0 ? 1 : 0;
        // ArrayUtil.setZero(this.walkFlag);
        // if (cc.random0To1() < 0.2){
        //     randSec = 1.5;
        // }else{
        //     if (cc.randomMinus1To1() > 0){
        //         this.walkFlag[2] = moveFlag;
        //         this.walkFlag[3] = this.walkFlag[2] ? 0 : 1;
        //     }else{
        //         this.walkFlag[0] = moveFlag;
        //         this.walkFlag[1] = this.walkFlag[0] ? 0 : 1;
        //     }
        // }
        // this.doWalkAction();
        // let that = this;
        // this.scheduleOnce(function() {
        //     that.randWalk();
        // }, randSec);
    },
    doWalkAction: function () {
        let thisAction = ArrayUtil.getIndex(this.walkFlag);
        if (thisAction !== this.curAction){
            if (thisAction !== -1) {
                this.getComponent(cc.Animation).play(this.actionList[thisAction]);
            } else {
                this.getComponent(cc.Animation).stop(this.actionList[this.curAction]);
                this.getComponent(cc.Sprite).spriteFrame = this.walkAtlas.getSpriteFrame(this.faceName[this.curAction]);
            }
            this.curAction = thisAction;
        }
    },
    update: function (dt) {
        this.node.x += (this.walkFlag[3] * this.blockFlag[3] - this.walkFlag[2] * this.blockFlag[2]) * this.xspeed * dt + (!this.blockFlag[3]?-1:0) + (!this.blockFlag[2]?1:0);
        this.node.y += (this.walkFlag[0] * this.blockFlag[0] - this.walkFlag[1] * this.blockFlag[1]) * this.yspeed * dt + (!this.blockFlag[0]?-1:0) + (!this.blockFlag[1]?1:0);
    },
    onCollisionEnter: function (other, self) {
        for (let i = 0; i < this.walkFlag.length; i++){
            if (this.walkFlag[i]){
                this.blockFlag[i] = 0;
            }
        }
    },
    onCollisionStay: function (other, self) {
        // other.world.aabb;
    },
    onCollisionExit: function (other, self) {
        ArrayUtil.setOne(this.blockFlag);
    }
});
