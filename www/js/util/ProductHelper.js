FTRPG.Util.ProductHelper = {
    getProductDescription: function (product, player) {
        switch (product.constructor) {
            case FTRPG.Model.Weapon:
                return product.name + "\n" +
                    'Nahkampf-Waffe\n' +
                    "Schaden: " + product.damage + " HP\n" +
                    "Präzision: " + FTRPG.Constants.precisionDescr(product.precision) + "\n";
            case FTRPG.Model.Munition:
                return product.weaponName + "\n" +
                    'Waffe für Fernkampf' + "\n" +
                    "Schaden: " + product.damage + " HP\n" +
                    "Präzision: " + FTRPG.Constants.precisionDescr(product.precision) + "\n" +
                    "Preis: " + product.price + " Finger\n" +
                    "Munition: " + player.howMuchOf(product) + ' ' + product.munitionLeftText;
            case FTRPG.Model.Armour:
                return product.name + "\n" +
                    "Verteidigung: " + FTRPG.Constants.defenseDescr(product.defense);
            case FTRPG.Model.Food:
                var impactSuff = '';
                if (product.impact === FTRPG.Constants.FoodImpact.playerHP) {
                    var possibleHP = player.hp + product.impactValue;
                    var maxHP = player.getMaxHP();
                    var missingHP = maxHP - player.hp;
                    if (missingHP === 0) {
                        impactSuff = ' (derzeit nicht benötigt)'
                    } else if (possibleHP > maxHP) {
                        impactSuff = ' (derzeit nur +' + missingHP + ' HP auf Maximum ' + maxHP + ')'
                    } else {
                        impactSuff = ' (auf ' + possibleHP + ' HP)'
                    }
                } else if (product.impact === FTRPG.Constants.FoodImpact.enemyHP) {
                    impactSuff = ' (pro Runde)'
                }
                return product.name + "\n" +
                    "Auswirkung:\n" +
                    product.impact + product.impactValue + impactSuff + "\n" +
                    (product.impactDuration ? 'Dauert ' + product.impactDuration + ' Runden an' : 'Wird sofort eingesetzt') + '\n' +
                    "Preis: " + product.price + " Finger\n" +
                    "Besitz: " + player.howMuchOf(product) + " Stück";
            default:
                throw new FTRPG.Model.Exception('object ' + object.name + ' is not one of the supported types');
        }
    },
    
    getPriceTagText: function (product, player) {
        switch (product.constructor) {
            case FTRPG.Model.Weapon:
                return product.damage + 'HP';
            case FTRPG.Model.Munition:
            case FTRPG.Model.Food:
                return 'x' + player.howMuchOf(product);
            case FTRPG.Model.Armour:
                return product.defense;
            default:
                throw new FTRPG.Model.Exception('object is not one of the supported types');
        }
    },
};
