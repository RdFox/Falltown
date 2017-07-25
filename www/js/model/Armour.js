FTRPG.Model.Armour = function (config) {
    _.forEach(Object.getOwnPropertyNames(config), function (propName) {
        this[propName] = config[propName];
    }, this);
};

FTRPG.Model.Armour.prototype = {
    constructor: FTRPG.Model.Armour,
    name: '',
    defense: 1.0,
    price: 0,
    images: []
};
