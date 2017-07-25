FTRPG.Constants = {
    version: '0.0.1', // can be used to check if the localstorage stuff is compatible to current version
    debuggingEnabled: false,
    weapons: [],    //injected by Weapons.js
    munitions: [],  //injected by Munitions.js
    armours: [],    //injected by Armours.js
    foods: [],      //injected by Foods.js
    enemyConfigs: [],    //injected by Enemies.js
    initialMoney: 10,
    initialHP: 10,
    walkThroughGateDistance: 50,
    encounterEnemyDistance: 100,
    enemyFollowsPlayerDistance: 400,
    FoodImpact: {
        enemyHP: 'Gegner HP -',
        playerHP: 'Meine HP +',
        enemyPrecision: 'Gegner Präzision x',
        playerPrecision: 'Meine Präzision x'
    },
    AttackType: {
        offensive: 'Schlag',
        defensive: 'Defensiv'
    },
    BattleType: {
        distance: 'Fernkampf',
        close: 'Nahkampf'
    },
    precisionDescr: function (precision) {
        if (precision < 1) {
            return 'schwach';
        } else if (precision >= 1.5) {
            return 'stark'
        } else {
            return 'mittel'
        }
    },
    defenseDescr: function (defense) {
        if (defense === 1.0) {
            return 'keine, du Nackedei!';
        } else if (defense < 2) {
            return 'schwach';
        } else if (defense >= 3) {
            return 'stark'
        } else {
            return 'mittel'
        }
    },

    Storage: {
        gameDataKey: 'FalltownRGP_gamedata'
    },
    GameScreen: {
        width: 960,
        height: 540,
        centerX: 0, // auto generated*
        centerY: 0, // auto generated*
        renderer: Phaser.AUTO
    },
    Falltown: {
        deadZoneOffsetX: 250,
        deadZoneOffsetY: 250,
        world: {
            width: 2250,
            height: 1750
        }
    },
    Afterfall: {
        deadZoneOffsetX: 450,
        deadZoneOffsetY: 270,
        world: {
            width: 1540,
            height: 1460
        }
    },
    Dungeon: {
        world: {
            // see below: it gets injected
        }
    },
    Battle: {
        enemyHPStatus: {
            'food_brandy': 'brennt!',
            'food_wine': 'vereist!',
            'food_oil': 'brennt!'
        },
        enemyDidHitTexts: [
            'Der Gegner hat dich getroffen',
            'Du wurdest getroffen',
            'Das tat weh!',
            'Hast du das überlebt??',
            'Auaaaa!',
            'Mist, getroffen worden',
            'Ayayay, Schlag kassiert!',
            'Lass dir das nicht gefallen!'
        ],
        playerDidHitTexts: [
            'gut gemacht',
            'voll reingehauen!',
            'sehr gut!',
            'getroffen',
            'weiter so',
            'voll erwischt!',
            'stark!',
            'Du hast getroffen!',
            'abgefahren!',
            'Du hast deinen Gegner getroffen!'
        ],
        enemyFailedTexts: [
            'Gegner hat nicht getroffen',
            'Gegner hat verfehlt',
            'Der kann dir nix',
            'Glück gehabt!',
            'gut ausgewichen!',
            'Daneben!',
            'Wow, gut ausgewichen!'
        ],
        playerFailedTexts: [
            'schade!',
            'wie peinlich!',
            'Wie peinlich von dir!',
            'Das kannst du besser',
            'Du hast nicht getroffen',
            'Du hast verfehlt',
            'daneben!',
            'Du Versager!',
            'konzentriere dich',
            'Knapp vorbei'
        ],
        playersTurnTexts: [
            'Du bist dran!',
            'Du bist an der Reihe',
            'Du bist am Zug',
            'jetzt du',
            'Jetzt schlägst du zurück!',
            'Nächste Runde'
        ],
        enemysTurnTexts: [
            'Gegner ist dran!',
            'Gegner ist an der Reihe',
            'Gegner ist am Zug',
            'Jetzt ist dein Gegner dran',
            'Dein Gegner ist dran'
        ]
    },
    Balancing: {
        howMuchMoneyWillPlayerWin: function (player, rnd) {
            return 10 + player.skillLevel * 20 + rnd.between(0, 10);
        },
        howMuchMoneyWillPlayerLoseWhenCaught: function (player, rnd) {
            return player.skillLevel < 3 ? rnd.between(2, 2 + player.skillLevel * 2) : rnd.between(20, 20 + player.skillLevel * 10);
        },
        getEnemysDamage: function (enemysWeaponDamage, playerIsInDefense) {
            if (!playerIsInDefense) {
                return enemysWeaponDamage;
            }
            return Math.max(1, Math.floor(enemysWeaponDamage * 0.2))
        },
        getEnemyFood: function (player, rnd) {
            return rnd.pick(FTRPG.Constants.foods);
        },
        getEnemyWeapon: function (enemyHP, player, rnd) {
            var maxDamage = player.skillLevel > 3 ? player.getMaxHP() / 10.0 : 3;
            if (enemyHP >= player.hp && player.skillLevel < 3) { // noob bonus
                var currPlayerHPCritical = player.hp < 3;
                maxDamage = Math.min(5, currPlayerHPCritical ? 2 : player.hp / 2.0);
            }
            var eligibleWeapons = _.filter(FTRPG.Constants.weapons.concat(FTRPG.Constants.munitions), function (wp) {
                return wp !== FTRPG.Constants.weapons[0] // no weapon
                    && wp.damage <= maxDamage;
            });
            if (eligibleWeapons.length === 0) {
                console.error('no eligible weapons found');
                eligibleWeapons = [FTRPG.Constants.weapons[1]]
            }
            return rnd.pick(eligibleWeapons);
        },
        getEnemyHP: function (player, rnd) {
            var ret = player.skillLevel * 2 + player.hp + rnd.between(-5, 5);
            ret = Math.max(10, ret); // prevent negative HP
            return ret;
        },
        getMaxPlayerHP: function (player) {
            var maxMaxHP = 300;
            var maxHP = [10, 12, 15, 20, 25, 50, 60, 70, 80, 90, 100, 200, maxMaxHP];
            return maxHP[player.skillLevel] || maxMaxHP;
        },
        playerWillHitEnemy: function (precision, playerSkillLevel) {
            var randomBetween = function (min, max) {
                return Math.random() * (max - min) + min;
            };
            var r1 = playerSkillLevel / 5.0; // in tutorial: 0, skill level 1 => 0.2 etc.
            var maxPrec = 1.5;
            var neededPrecisionToHit = randomBetween(0, randomBetween(r1, maxPrec));
            console.log('precision ' + precision + ' - hits if higher ' + neededPrecisionToHit);
            return precision > neededPrecisionToHit;
        },
        enemyWillHitPlayer: function (precision, playerDefense, playerSkillLevel) {
            var randomBetween = function (min, max) {
                return Math.random() * (max - min) + min;
            };
            var minPrec = 0.2 / (Math.max(1,playerSkillLevel)); // 0.4, 0.2, 0.1 ...
            var maxPrec = 1.5;
            var neededPrecisionToHit = randomBetween(minPrec, randomBetween(minPrec, maxPrec));
            var playerCanDefend = Math.random() * playerDefense > 0.8 && Math.random() > 0.7;
            console.log('precision ' + precision + ' - hits if higher ' + neededPrecisionToHit);
            console.log('but defense ' + playerDefense + ' can defend? ' + playerCanDefend);
            return (precision > neededPrecisionToHit) && !playerCanDefend;
        },
        playerWillSucceedFleeing: function (enemyHP) {
            if (enemyHP > 100) {
                return Math.random() > 0.7;
            } else {
                return Math.random() > 0.1;
            }
        }
    },
    Credits: [
        "","","","","","",
        "Falltown RPG!",
        "","","",
        "Dies ist ein Studentenprojekt",
        "Danke, dass du Falltown RPG spielst!",
        "","","","","","",
        "Producer - Dominik Kress",
        "","",
        "Lead Design - Dominik Kress",
        "Sound Design - Theophil Bachmann",
        "Art Design - Valentin Petrov",
        "","",
        "Lead Engineer - Brian Wirth",
        "Sound Engineer - Theophil Bachmann",
        "Gameplay Engineer - Tom Görner",
        "Assistant Engineer - Dominik Kress",
        "","",
        "Lead Artist - Valentin Petrov",
        "Sound Artist - Theophil Bachmann",
        "","",
        "Lead QA - Brian Wirth",
        "QA Assistant - Jeder!",
        "","","","","",
        " - Hilfsmittel - ","",
        "Entwickelt mit Phaser.io",
        "Deplayed mit Apache Cordova","",
        "Sounds und Musik mit",
        "Audacity, LMMS, MuseScore","",
        "Font Art: Widelands",
        "Grafiken mit","",
        "Inkscape, RPGMakerWeb","",
        "Bilder unter offenen Lizenzen:",
        "Ribbons und Badges: designed by Freepik",
        "Einige Cliparts: https://openclipart.org/",
        "Einige Texturen: Hand Paint Texture",
        "By League of Legends Maps *CanGood*",
        "","","","","","","","","","",
        "Falltown RPG!",
        "So long and thanks for the Fish."
    ],
	NewGame: 'Wirklich ein \nneues Spiel starten?\n\nDer aktuelle Fortschritt\ngeht dadurch verloren!',

    // Catlady things
    cats: '', // injected by weapons.js
    catladyConfigs: {
        name: 'Katzen Lady',
        images: ['spr_battle_catlady', 'spr_fig1']
    }

};

// *auto generate dependent variables here
(function setupDependentConstants(constants) {
    constants.GameScreen.centerX = constants.GameScreen.width * 0.5;
    constants.GameScreen.centerY = constants.GameScreen.height * 0.5;
    constants.Dungeon.world.width = constants.GameScreen.width;
    constants.Dungeon.world.height = constants.GameScreen.height;
})(FTRPG.Constants);
