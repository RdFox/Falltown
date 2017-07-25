FTRPG.Constants.foods = [
    new FTRPG.Model.Food({
        name: "Wasser",
        impact: FTRPG.Constants.FoodImpact.playerHP,
        impactValue: 2.0,
        price: 1,
        images: ['food_water'],
        eatable: true
    }), new FTRPG.Model.Food({
        name: "Banane",
        impact: FTRPG.Constants.FoodImpact.playerHP,
        impactValue: 5.0,
        price: 2,
        images: ['food_banana'],
        eatable: true
    }), new FTRPG.Model.Food({
        name: "Kartoffel",
        impact: FTRPG.Constants.FoodImpact.playerHP,
        impactValue: 10.0,
        price: 3,
        images: ['food_potato'],
        eatable: true
    }), new FTRPG.Model.Food({
        name: "Komisches Fleisch",
        impact: FTRPG.Constants.FoodImpact.playerHP,
        impactValue: 50,
        price: 50,
        images: ['food_meat'],
        eatable: true
    }), new FTRPG.Model.Food({
        name: "Bier",
        impact: FTRPG.Constants.FoodImpact.playerPrecision,
        impactValue: 1.2,
        impactDuration: 3,
        price: 5,
        images: ['food_beer'],
        eatable: true
    }), new FTRPG.Model.Food({
        name: "Cocktail",
        impact: FTRPG.Constants.FoodImpact.playerPrecision,
        impactValue: 1.3,
        impactDuration: 5,
        price: 10,
        images: ['food_cocktail'],
        eatable: true
    }), new FTRPG.Model.Food({
        name: "Selbstgebranntes",
        impact: FTRPG.Constants.FoodImpact.playerPrecision,
        impactValue: 2.0,
        impactDuration: 10,
        price: 20,
        images: ['food_liqueur'],
        eatable: true
    }), new FTRPG.Model.Food({
        name: "Branntwein für Waffen",
        impact: FTRPG.Constants.FoodImpact.enemyHP,
        impactValue: 5,
        impactDuration: 3,
        price: 3,
        images: ['food_brandy'],
        eatable: false
    }), new FTRPG.Model.Food({
        name: "Eiswein für Waffen",
        impact: FTRPG.Constants.FoodImpact.enemyHP,
        impactValue: 10,
        impactDuration: 3,
        price: 6,
        images: ['food_wine'],
        eatable: false
    }), new FTRPG.Model.Food({
        name: "Brennendes Öl",
        impact: FTRPG.Constants.FoodImpact.enemyHP,
        impactValue: 10,
        impactDuration: 10,
        price: 25,
        images: ['food_oil'],
        eatable: false
    }), new FTRPG.Model.Food({
        name: "Sand",
        impact: FTRPG.Constants.FoodImpact.enemyPrecision,
        impactValue: 0.7,
        impactDuration: 3,
        price: 3,
        images: ['food_sand'],
        eatable: false
    }), new FTRPG.Model.Food({
        name: "Maske",
        impact: FTRPG.Constants.FoodImpact.enemyPrecision,
        impactValue: 0.5,
        impactDuration: 3,
        price: 5,
        images: ['food_mask'],
        eatable: false
    })
];