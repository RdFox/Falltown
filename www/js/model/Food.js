FTRPG.Model.Food = function (config) {
    _.forEach(Object.getOwnPropertyNames(config), function (propName) {
        this[propName] = config[propName];
    }, this);
};

FTRPG.Model.Food.prototype = {
    constructor: FTRPG.Model.Food,
    name: '',
    impact: FTRPG.Constants.FoodImpact.playerHP,
    impactValue: 0.0,
    impactDuration: 0, // only available for foods with impact type playerPrecision
    price: 0,
    images: [],
    eatable: false
};
