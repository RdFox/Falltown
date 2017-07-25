FTRPG.Ctrl.AfterfallController = function (game, player, onLeaveAfterfallCB, onGameOverCB, context) {
    this.game = game;
    this.player = player;
    this.callOnLeaveAfterfall = function () {
        onLeaveAfterfallCB.apply(context, arguments);
    };
    this.callonGameOver = function () {
        onGameOverCB.apply(context, arguments);
    };
    this.context=context;
};

FTRPG.Ctrl.AfterfallController.prototype = {
    game: null,
    player: null,
    currBattleController: null,

    getRandomEnemies: function (howMany) {
        var enemies = [];
        for (var i = 0; i < howMany; i++) {
            enemies.push(this.createRandomEnemy());
        }
        return enemies;
    },

    createRandomEnemy: function () {
        var enemyConfig = this.game.rnd.pick(FTRPG.Constants.enemyConfigs.slice(6)); // slice 1 because [0] -[5] are reserved for dungeon
        var enemyHP = FTRPG.Constants.Balancing.getEnemyHP(this.player, this.game.rnd);
        var enemyWeapon = FTRPG.Constants.Balancing.getEnemyWeapon(enemyHP, this.player, this.game.rnd);
        return new FTRPG.Model.Enemy(enemyConfig, enemyHP, enemyWeapon);
    },

    onEncounterEnemy: function (enemy, playerX, playerY) {
        console.log('AfterfallController#onEncounterEnemy');
        this.player.lastPosition.afterfall = [playerX, playerY];
        this.startBattle(enemy);
    },

    // 0 = north gate to afterfall
    onEnterGate: function (which, playerX, playerY) {
        if (which === 0/*Falltown*/ || which === 1 /*dungeon*/) {
            this.player.lastPosition.afterfall = [playerX, playerY];
            this.callOnLeaveAfterfall('Afterfall', which);
        } else {
            throw new FTRPG.Model.Exception('cannot leave into this unknown area ' + which);
        }
    },

    startBattle: function (enemy) {
        this.currBattleController = new FTRPG.Ctrl.BattleController(this.game, this.player, enemy, this.endBattle, this, true);
        this.game.state.start('Battle', true, false, this.currBattleController, enemy.maxHP, this.player.getMaxHP());
    },

    endBattle: function (playerHasLost) {
        console.log('AfterfallController#endbattle', playerHasLost);
        if (playerHasLost) {
            this.callonGameOver();
        } else {
            this.resume();
        }
    },

    resume: function () {
        var initialValues = { // keys must fit to Afterfall#initialValues
            playerX: this.player.lastPosition.afterfall[0],
            playerY: this.player.lastPosition.afterfall[1]
        };
        this.game.state.start('Afterfall', true, false, this, initialValues);
    },

    getInfoBarTexts: function () {
        return [
            this.player.money + " Finger",
            this.player.hp + "/" + this.player.getMaxHP() + " HP",
            "Level " + this.player.skillLevel
        ];
    },
    setLastPosition: function (playerX, playerY) {
        this.player.lastPosition.afterfall = [playerX, playerY];
    }
};