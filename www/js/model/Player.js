FTRPG.Model.Player = function (hp, money, weapons, armours, munitions, foods, currentWeapon, currentArmour, skillLevel, lastPosition, skillDistribution) {
    // this.foods = this.foods.concat(FTRPG.Constants.foods);
    // this.foods = this.foods.concat(FTRPG.Constants.foods);
    // this.munitions = this.munitions.concat(FTRPG.Constants.munitions);
    // this.armours = this.armours.concat(FTRPG.Constants.armours);
    //

    this.hp = hp;
    this.money = money;
    this.skillDistribution = skillDistribution || [0, 0, 0];
    weapons ? this.weapons = weapons : this.weapons = [FTRPG.Constants.weapons[0]];
    armours ? this.armours = armours : this.armours = [FTRPG.Constants.armours[0]];
    munitions ? this.munitions = munitions : this.munitions = [];
    foods ? this.foods = foods : foods = [];

    currentWeapon ? this.currentWeapon = currentWeapon : this.currentWeapon = FTRPG.Constants.weapons[0];
    currentArmour ? this.currentArmour = currentArmour : this.currentArmour = FTRPG.Constants.armours[0];

    skillLevel ? this.skillLevel = skillLevel : this.skillLevel = 0;
    lastPosition ? this.lastPosition = lastPosition : this.lastPosition = {falltown: [], afterfall: [], dungeon: []};

};

FTRPG.Model.Player.prototype = {
    weapons: [],
    armours: [],
    foods: [],
    munitions: [],
    currentWeapon: null, // current weapon can also be of type munition
    currentArmour: null,
    money: 0,
    hp: 0,
    skillDistribution: [],
    skillLevel: 0, // when changing this consider Balancing in Constants.
    lastPosition: null,

    getMaxHP: function () {
        return FTRPG.Constants.Balancing.getMaxPlayerHP(this);
    },

    /**
     * Adds this weapon/munition to the inventory and charges price from money.
     * @param product weapon or munition to buy
     * @throws Exception if not enough money or if weapon already in possession.
     */
    buyProduct: function (product) {
        console.log('Player#buyProduct');
        if (this.money < product.price) {
            throw new FTRPG.Model.Exception("player has not enough money to buy product");
        }
        if (product instanceof FTRPG.Model.Munition) {
            this.munitions.push(product);
        } else if (product instanceof FTRPG.Model.Food) {
            this.foods.push(product);
        } else if (product instanceof FTRPG.Model.Armour && !this.possessingArmour(product)) {
            this.armours.push(product)
        } else if (product instanceof FTRPG.Model.Weapon && !this.possessingWeapon(product)) {
            this.weapons.push(product);
        } else {
            throw new FTRPG.Model.Exception('could not buy product: ' + product);
        }
        this.money -= product.price;
    },

    resellItem: function (item) {
        this.money += item.resell;
        // remove the item from our inventory
        var array;
        if (item instanceof FTRPG.Model.Weapon) {
            array = this.weapons;
        } else if (item instanceof FTRPG.Model.Munition) {
            array = this.munitions;
        } else if (item instanceof FTRPG.Model.Armour) {
            array = this.armours;
        } else {
            throw new FTRPG.Model.Exception("cannot sell this item", item);
        }
        this.removeItem(array, item);
    },

    getCurrentDefense: function () {
        if (this.currentArmour) {
            return this.currentArmour.defense;
        } else {
            return 1.0;
        }
    },


    removeItem: function (array, item) {
        var index = _.indexOf(array, item);
        if (index < 0) {
            throw new FTRPG.Model.Exception("sold item not found in players inventory");
        }
        array.splice(index, 1); //remove element from munition or weapon array
        if (this.currentWeapon === item) { // needed for munition) {
            if (item instanceof FTRPG.Model.Weapon || !_.contains(this.munitions, item)) {
                console.log('Player ran out of munition or he sold his last weapon, loading default weapon');
                this.currentWeapon = FTRPG.Constants.weapons[0];
            }
        } else if (this.currentArmour === item) {
            console.log('Player removed his current armour');
            this.currentArmour = FTRPG.Constants.armours[0];
        }
    },

    /**
     * @returns {boolean} true if munition ran out
     */
    removeMunition: function (munition) {
        var currentlyusinThisMunition = this.currentWeapon === munition;
        this.removeItem(this.munitions, munition); // may change currentWeapon
        return (currentlyusinThisMunition && this.currentWeapon !== munition);
    },


    itemCount: function (array) {
        return _.countBy(array, function (prod) {
            return prod.name; //creates an object that has all product names as keys and the count as value.
        });
    },

    howMuchOf: function (product) {
        switch (product.constructor) {
            case FTRPG.Model.Munition:
                return this.itemCount(this.munitions)[product.name];
            case FTRPG.Model.Weapon:
                return this.itemCount(this.weapons)[product.name];
            case FTRPG.Model.Armour:
                return this.itemCount(this.armours)[product.name];
            case FTRPG.Model.Food:
                return this.itemCount(this.foods)[product.name];
            default:
                throw new FTRPG.Model.Exception('have no item of this type.' + product);
        }
    },

    /**
     * Checks if the given weapon is already in possession
     * @param weapon a weapon object
     * @returns {boolean} true if the player owns this weapon.
     */
    possessingWeapon: function (weapon) {
        return this.possessingItem(weapon, this.weapons);
    },

    /**
     * Checks if the given armour is already in possession
     * @param armour a armour object
     * @returns {boolean} true if the player owns this armour.
     */
    possessingArmour: function (armour) {
        return this.possessingItem(armour, this.armours);
    },

    possessingItem: function (item, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].name === item.name) {
                return true;
            }
        }
        return false;
    },

    /**
     * increases player's HP
     * @param value int value by which the player's HP will be increased
     */
    vitalizeHP: function (value) {
        console.log('Player#vitalizeHP', value);
        this.hp += value;
    },
    getInventory: function () {
        var weapons = this.weapons.concat(_.unique(this.munitions));
        return [ // return array per category
            _.sortBy(weapons, 'damage'),
            _.sortBy(this.armours, 'defense'),
            _.sortBy(_.unique(this.foods), 'impact')
        ];
    }
};
