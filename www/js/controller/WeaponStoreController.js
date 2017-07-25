FTRPG.Ctrl.WeaponStoreController = function (game, player, onExit, onExitContext) {
    this.game = game;
    this.player = player;
    this.callOnExitCB = function () {
        onExit.call(onExitContext);
    };
};

FTRPG.Ctrl.WeaponStoreController.prototype = {
    vendorWeaponDescription: function (weapon) {
        return weapon.name + "\n" +
            (weapon instanceof FTRPG.Model.Weapon ? 'Nahkampf-Waffe' : 'Fernkampf-Munition') + "\n" +
            "Schaden: " + weapon.damage + " HP\n" +
            "Präzision: " + FTRPG.Constants.precisionDescr(weapon.precision) + "\n" +
            "Preis: " + weapon.price + " Finger";
    },
    vendorArmourDescription: function (armour) {
        return armour.name + "\n" +
            "Rüstung\n" +
            "Verteidigung: " + FTRPG.Constants.defenseDescr(armour.defense) + "\n" +
            "Preis: " + armour.price + " Finger";
    },
    playerWeaponDescription: function (weapon) {
        return weapon.name + "\n" +
            (weapon instanceof FTRPG.Model.Weapon ? 'Nahkampf-Waffe' : 'Fernkampf-Munition') + "\n" +
            "Schaden: " + weapon.damage + " HP\n" +
            "Präzision: " + FTRPG.Constants.precisionDescr(weapon.precision) + "\n" +
            "Verkaufswert: " + weapon.resell + " Finger";
    },
    playerArmourDescription: function (armour) {
        return armour.name + "\n" +
            "Rüstung\n" +
            "Verteidigung: " + FTRPG.Constants.defenseDescr(armour.defense) + "\n" +
            "Verkaufswert: " + armour.resell + " Finger";
    },

    getVendorProductDescription: function (prod) {
        if (prod instanceof FTRPG.Model.Armour) {
            return this.vendorArmourDescription(prod);
        } else {
            return this.vendorWeaponDescription(prod);
        }
    },

    getPlayerProductDescription: function (prod) {
        if (prod instanceof FTRPG.Model.Armour) {
            return this.playerArmourDescription(prod);
        } else {
            return this.playerWeaponDescription(prod);
        }
    },

    getPlayerPriceTag: function (product) {
        switch (product.constructor) {
            case FTRPG.Model.Weapon:
                return product.damage + 'HP';
            case FTRPG.Model.Armour:
                return product.defense;
            case FTRPG.Model.Munition:
                return 'x' + this.player.howMuchOf(product);
            default:
                throw new FTRPG.Model.Exception('weaponstore should not sell this');
        }
    },

    getVendorPriceTag: function (product) {
        return product.price + " F";
    },

    getPlayerProducts: function () {
        var weapons = _.filter(this.player.weapons, function (wp) {
            return wp !== FTRPG.Constants.weapons[0]; // [0] = fist, no weapon
        }, this);
        var armours = _.filter(this.player.armours, function (ar) {
            return ar !== FTRPG.Constants.armours[0]; // [0] = fist, no armour
        }, this);
        var munitions = _.unique(this.player.munitions);
        return weapons.concat(munitions).concat(armours); // sell munition & armours & weapons in this store
    },

    getVendorProducts: function () {
        var weapons = _.filter(FTRPG.Constants.weapons, function (wp) {
            return !this.player.possessingWeapon(wp)
                && wp !== FTRPG.Constants.weapons[0]; // [0] = fist, no weapon
        }, this);
        var armours = _.filter(FTRPG.Constants.armours, function (armour) {
            return !this.player.possessingArmour(armour)
            && armour !== FTRPG.Constants.armours[0]; // [0] = fist, no armour
        }, this);
        var munitions = FTRPG.Constants.munitions;
        return weapons.concat(munitions).concat(armours);
    },

    onBuyProduct: function (product) {
        this.player.buyProduct(product);
    },

    playerProductsAreResalable: function () {
        return true;
    },
    onResellProduct: function (product) {
        this.player.resellItem(product);
    },

    onExit: function () {
        this.callOnExitCB();
    },

    canAffordProduct: function (product) {
        return this.player.money >= product.price;
    },
    getMusic: function () {
        return 'snd_weaponshop';
    }
};
