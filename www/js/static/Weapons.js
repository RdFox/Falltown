FTRPG.Constants.weapons = [
    // at index 0 must be the default weapon.
    // DON'T insert weapons HERE
    new FTRPG.Model.Weapon({
        name: 'Deine blutige Faust',    //Default weapon if none bought; won't appear in the weapn store
        damage: 1,
        precision: 0.5,
        price: 0,
        resell: 0,
        images: ['weapon_fist'],
        sound: ''
    }),
    // Nahkampf
    new FTRPG.Model.Weapon({
        name: 'Dicker Handschuh',
        damage: 1,
        precision: 0.8,
        price: 5,
        resell: 3,
        images: ['weapon_glove'],
        sound: ''
    }),
    new FTRPG.Model.Weapon({
        name: 'Knüppel',
        damage: 2,
        precision: 1.0,
        price: 10,
        resell: 5,
        images: ['weapon_club'],
        sound: ''
    }),
    new FTRPG.Model.Weapon({
        name: 'Buttermesser',
        damage: 3,
        precision: 0.7,
        price: 13,
        resell: 7,
        images: ['weapon_butterknife'],
        sound: ''
    }),
    new FTRPG.Model.Weapon({
        name: 'Schwert',
        damage: 5,
        precision: 1.5,
        price: 25,
        resell: 13,
        images: ['weapon_sword'],
        sound: ''
    }),
    new FTRPG.Model.Weapon({
        name: 'Pike',
        damage: 7,
        precision: 2.0,
        price: 50,
        resell: 25,
        images: ['weapon_pike'],
        sound: ''
    })
];
FTRPG.Constants.cats =
    new FTRPG.Model.Weapon({
        name: 'Geworfene Katzen',
        damage: 5,
        precision: 5.0,
        price: 0,
        resell: 0,
        images: ['weapon_pike'],
        sound: ''
    });
