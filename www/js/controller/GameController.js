FTRPG.Ctrl.GameController = function () {
};

FTRPG.Ctrl.GameController.prototype = {
    game: null,
    player: null,
    falltownController: null,
    afterfallController: null,
    dungeonController: null,
    setupController: null,
    currBattleController: null, // one controller per battle

    setup: function (game, setupController, player) {
        this.player = player;
        this.game = game;
        this.setupController = setupController;
        this.falltownController = new FTRPG.Ctrl.FalltownController(
            game, this.player, this.startTutorial, this.startCatFight, this.onLeaveArea, this);
        this.afterfallController =
            new FTRPG.Ctrl.AfterfallController(game, this.player, this.onLeaveArea, this.onGameOver, this);
        this.dungeonController =
            new FTRPG.Ctrl.DungeonController(game, this.player, this.onDefeatedBoss, this.onGameOver, this);
    },

    startGame: function (game,place,initialValues) {
        console.log('GameController#startGame');
        this.game.stage.disableVisibilityChange = false;

        if(place === 'Falltown'){
            this.game.state.start('Falltown', true, false, this.falltownController,initialValues);	
        } else if(place === 'Afterfall'){
            this.game.state.start('Afterfall', true, false, this.afterfallController,initialValues);
        } else if(place === 'Dungeon'){
            this.game.state.start('Dungeon', true, false, this.dungeonController,initialValues);
        } else {
            this.game.state.start('Falltown', true, false, this.falltownController);	
        }

        // this.startTutorial();
    },

    startTutorial: function () {
        var enemyHP = 5;
        var enemyWeapon = FTRPG.Constants.weapons[1];
        var enemy = new FTRPG.Model.Enemy(FTRPG.Constants.enemyConfigs[0], enemyHP, enemyWeapon);
        this.currBattleController = new FTRPG.Ctrl.BattleController(this.game, this.player, enemy, this.endTutorial, this, false);
        this.game.state.start('Battle', true, false, this.currBattleController, enemy.maxHP, this.player.getMaxHP());
    },

    startCatFight: function () {
        var enemy = new FTRPG.Model.Enemy(FTRPG.Constants.catladyConfigs, 99999, FTRPG.Constants.cats);
        this.currBattleController = new FTRPG.Ctrl.BattleController(this.game, this.player, enemy, this.endTutorial, this, true);
        this.game.state.start('Battle', true, false, this.currBattleController, enemy.maxHP, this.player.getMaxHP());
    },


    onGameOver: function () {
        console.log('GameController#onGameOver');
        FTRPG.Ctrl.LocalStorageController.destroyExistingGameData(); // Game Over
        this.setupController.initFromScratch();
    },

    endTutorial: function (playerHasLost) {
        if (playerHasLost) {
            this.onGameOver();
            return;
        }
        this.falltownController.resume();
    },

    onLeaveArea: function (currentStateName, whichGate) {
        console.log('GameController#onLeaveArea');
        var mapping = {
            'Falltown': {
                0: { // gate with index 0 will direct to Afterfall
                    controller: this.afterfallController
                } // currently only one gate in falltown
            },
            'Afterfall': {
                0: { // gate with index 0 will direct to Afterfall
                    controller: this.falltownController
                },
                1: {
                    controller: this.dungeonController
                }
            }
        };
        console.log('leaving ' + currentStateName + ' through gate ' + whichGate);
        var info = mapping[currentStateName][whichGate];
        info.controller.resume();
    },

    onDefeatedBoss: function () {
        // TODO show skill UI
        this.falltownController.resume();
    }
};