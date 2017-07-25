FTRPG.Model.Weapon = function (config) {
    if(Object.keys(config).length !== 7){ // 7 is the number of munitions properties
        throw new FTRPG.Model.Exception('Invalid weapon');
    }
    _.forEach(Object.getOwnPropertyNames(config), function (propName) {
        this[propName] = config[propName];
    }, this);
};

FTRPG.Model.Weapon.prototype = {
    constructor: FTRPG.Model.Weapon,
    name: '',
    damage: 0.0,
    precision: 0.0,
    price: 0,
    resell: 0,
    images: [],
    sound: ''
};
