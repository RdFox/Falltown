FTRPG.Constants.munitions = [
    // Fernkampf
    new FTRPG.Model.Munition({
        name: 'Stein',
        weaponName: 'Ein Stein',
        munitionLeftText: 'auf Vorrat',
        damage: 2.0,
        precision: 0.5,
        price: 1,
        resell: 1,
        images: ['weapon_stone'],
        sound: ''
    }),
    new FTRPG.Model.Munition({
        name: 'Pfeil',
        weaponName: 'Pfeilbogen',
        munitionLeftText: 'übrig',
        damage: 3.0,
        precision: 0.7,
        price: 3,
        resell:2,
        images: ['weapon_arrow'],
        sound: ''
    }),
    new FTRPG.Model.Munition({
        name: 'Kugel für Pistole',
        weaponName: 'Pistole',
        munitionLeftText: 'Schuss',
        damage: 4.0,
        precision: 1,
        price: 5,
        resell:3,
        images: ['weapon_bullet_gun'],
        sound: ''
    }),
    new FTRPG.Model.Munition({
        name: 'Kugel für Gewehr',
        weaponName: 'Gewehr',
        munitionLeftText: 'Schuss',
        damage: 5.0,
        precision: 1.5,
        price: 7,
        resell: 4,
        images: ['weapon_bullet_rifle'],
        sound: ''
    }),
    new FTRPG.Model.Munition({
        name: 'Rakete',
        weaponName: 'Raketenwerfer',
        munitionLeftText: 'Schuss',
        damage: 10.0,
        precision: 2.0,
        price: 50,
        resell: 25,
        images: ['weapon_rocket'],
        sound: ''
    })
];