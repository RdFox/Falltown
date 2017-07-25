FTRPG.Model.Munition = function (config) {
    if(Object.keys(config).length !== 9){ // 8 is the number of munitions properties
        throw new FTRPG.Model.Exception('Invalid munitions');
    }
    _.forEach(Object.getOwnPropertyNames(config), function (propName) {
        this[propName] = config[propName];
    }, this);
};

FTRPG.Model.Munition.prototype = {
    constructor: FTRPG.Model.Munition,
    munitionLeftText:'',
    weaponName:'',
    name: '',
    damage: 0.0,
    precision: 0.0,
    price: 0,
    resell: 0,
    images: [],
    sound: ''
};
