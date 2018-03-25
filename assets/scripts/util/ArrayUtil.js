let ArrayUtil = {
    getIndex: function (walkFlag) {
        for (let i = 0; i < walkFlag.length; i++){
            if (walkFlag[i]){
                return i;
            }
        }
        return -1;
    },
    setOne: function (array) {
        for (let i = 0; i < array.length; i++){
            array[i] = 1;
        }
    },
    setZero: function (array) {
        for (let i = 0; i < array.length; i++){
            array[i] = 0;
        }
    },
    hasOne: function (array) {
        for (let i = 0; i < array.length; i++){
            if (array[i]){
                return true;
            }
        }
        return false;
    },
};
