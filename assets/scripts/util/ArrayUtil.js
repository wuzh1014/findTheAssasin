"use strict";

var ArrayUtil = {
    getIndex: function getIndex(walkFlag) {
        for (var i = 0; i < walkFlag.length; i++) {
            if (walkFlag[i]) {
                return i;
            }
        }
        return -1;
    },
    setOne: function setOne(array) {
        for (var i = 0; i < array.length; i++) {
            array[i] = 1;
        }
    },
    setZero: function setZero(array) {
        for (var i = 0; i < array.length; i++) {
            array[i] = 0;
        }
    },
    hasOne: function hasOne(array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i]) {
                return true;
            }
        }
        return false;
    }
};