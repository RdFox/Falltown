FTRPG.Model.Enemy = function (config, hp, weapon) {
    this.name = config.name;
    this.hp = hp;
    this.currentWeapon = weapon;
    this.maxHP = this.hp;
    this.images = config.images;
};

FTRPG.Model.Enemy.prototype = {
    // weapons: [],
    name: '',
    currentFood: null,
    currentWeapon: null,
    hp: 0,
    maxHP: 0,
    tint: 1,
    images: []

};