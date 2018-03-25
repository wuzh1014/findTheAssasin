cc.Class({
    extends: cc.Component,
    properties: {
        curAction: {
            default: -1
        },
        speed: 70,
        appendSpeed: 0,
        walkFlag: [cc.Integer],
        blockFlag: [cc.Integer],
        operator: [cc.Prefab],
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
                    'walk_13',
                    'walk_03',
                    'walk_07',
                    'walk_10',
                ];
            }
        }
    },
    onLoad: function () {
        this.posStack = [];
        this.loadTouch();
    },
    touchJudge: function (event, customEventData) {
        if (customEventData === '1'){
            this.node.parent.getComponent('PlayMap').judgeUser(this.node.user.userId);
        }
        if (customEventData === '2'){
            this.node.parent.getComponent('PlayMap').killUser(this.node.user.userId);
        }
    },
    loadTouch: function () {
        let self = this;
        let judgeBtn = self.node.getChildByName('judgeBtn');
        let killBtn = self.node.getChildByName('killBtn');
        function onTouchDown (event) {
        }
        function onTouchUp (event) {
            let userId = self.node.parent.getComponent('PlayMap').userId;
            if (self.node.user.userId === userId){
                return;
            }
            if (judgeBtn.opacity) {
                judgeBtn.opacity = 0;
            }else {
                judgeBtn.opacity = 255;
            }
            if (killBtn.opacity) {
                killBtn.opacity = 0;
            }else {
                killBtn.opacity = 255;
            }
        }
        this.node.on('touchstart', onTouchDown, this.node);
        this.node.on('touchend', onTouchUp, this.node);
        this.node.on('touchcancel', onTouchUp, this.node);
    },
    // var playerInfoPos = cc.find('anchorPlayerInfo', anchor).getPosition();
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
    pushWalk: function (position) {
        this.posStack.push(position);
    },
    update: function (dt) {
        if (this.node.stackRunner){
            if (this.posStack && this.posStack.length > 0){
                let thisStack = this.posStack[0];
                let dist = Math.sqrt((this.node.x - thisStack[0]) * (this.node.x - thisStack[0]) + (this.node.y - thisStack[1]) * (this.node.y - thisStack[1]));
                if (dist < 1){
                    this.posStack.splice(i, 1);
                    return;
                }
                let admitSpeed = dt * this.speed * 1.2;
                let xSmooth = - (this.node.x - thisStack[0]) * admitSpeed / dist;
                let ySmooth = - (this.node.y - thisStack[1]) * admitSpeed / dist;
                if (xSmooth > 0.1){
                    this.walkFlag[2] = 0;
                    this.walkFlag[3] = 1;
                }else if (xSmooth < -0.1){
                    this.walkFlag[2] = 1;
                    this.walkFlag[3] = 0;
                }else {
                    this.walkFlag[2] = 0;
                    this.walkFlag[3] = 0;
                }
                if (ySmooth > 0.1){
                    this.walkFlag[0] = 1;
                    this.walkFlag[1] = 0;
                }else if (ySmooth < -0.1){
                    this.walkFlag[0] = 0;
                    this.walkFlag[1] = 1;
                }else {
                    this.walkFlag[0] = 0;
                    this.walkFlag[1] = 0;
                }
                let toX = this.node.x + xSmooth;
                let toY = this.node.y + ySmooth;
                let calDist = Math.sqrt((toX - this.node.x) * (toX - this.node.x) + (toY - this.node.y) * (toY - this.node.y));
                if (calDist > dist){
                    this.node.x = thisStack[0];
                    this.node.y = thisStack[1];
                }else {
                    this.node.x = toX;
                    this.node.y = toY;
                }
                this.doWalkAction();
            }else {
                this.walkFlag = [0, 0, 0, 0];
                this.doWalkAction();
            }
        }else {
            this.node.x += (this.walkFlag[3] * this.blockFlag[3] - this.walkFlag[2] * this.blockFlag[2]) * this.speed * dt + (!this.blockFlag[3]?-1:0) + (!this.blockFlag[2]?1:0);
            this.node.y += (this.walkFlag[0] * this.blockFlag[0] - this.walkFlag[1] * this.blockFlag[1]) * this.speed * dt + (!this.blockFlag[0]?-1:0) + (!this.blockFlag[1]?1:0);
        }
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
