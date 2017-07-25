FTRPG.Ctrl.DungeonController = function (game, player, onDefeatedBossCB, onGameOverCB, context) {
    this.game = game;
    this.player = player;
    this.callOnDefeatedBoss = function () {
        onDefeatedBossCB.apply(context, arguments);
    };
    this.callonGameOver = function () {
        onGameOverCB.apply(context, arguments);
    };
    this.numberOfGatesOpened = 0;
    this.context=context;
};

FTRPG.Ctrl.DungeonController.prototype = {
    game: null,
    player: null,
    numberOfGatesOpened: 0,
    currBattleController: null,

    getEnemies: function () {
        var configs = [
            FTRPG.Constants.enemyConfigs[2],
            FTRPG.Constants.enemyConfigs[3],
            FTRPG.Constants.enemyConfigs[4],
            FTRPG.Constants.enemyConfigs[5] //end boss
        ];
        var enemies = _.map(configs, function (cfg) {
            var enemyHP = FTRPG.Constants.Balancing.getEnemyHP(this.player, this.game.rnd);
            var enemyWeapon = FTRPG.Constants.Balancing.getEnemyWeapon(enemyHP, this.player, this.game.rnd);
            var enemyFood = FTRPG.Constants.Balancing.getEnemyFood(this.player, this.game.rnd);
            var enemy = new FTRPG.Model.Enemy(cfg, enemyHP, enemyWeapon);
            enemy.currentFood = enemyFood;
            return enemy;
        }, this);
        for (var i = 1; i < enemies.length; i++) {
            var weakerEnemy = enemies[i - 1];
            var strongerEnemy = enemies[i];
            if (strongerEnemy.hp <= weakerEnemy.hp) {
                strongerEnemy.hp = weakerEnemy.hp + 5;
            }
            if (weakerEnemy.currentWeapon.damage > strongerEnemy.currentWeapon.damage) {
                strongerEnemy.hp += Math.floor(strongerEnemy.hp / 10);
            }
            strongerEnemy.maxHP = strongerEnemy.hp;
        }
        return enemies;
    },

    onEncounterEnemy: function (enemy, playerX, playerY, openWalls) {
        console.log('DungeonController#onEncounterEnemy');
        this.numberOfGatesOpened = openWalls;
        if (openWalls === undefined || openWalls === null) {
            throw new FTRPG.Model.Exception('WTF - encountered enemy but openWalls is undefined or null');
        }
        this.player.lastPosition.dungeon = [playerX, playerY];
        this.startBattle(enemy);
    },


    startBattle: function (enemy) {
        this.currBattleController = new FTRPG.Ctrl.BattleController(this.game, this.player, enemy, this.endBattle, this, false);
        this.game.state.start('Battle', true, false, this.currBattleController, enemy.maxHP, this.player.getMaxHP(), 'bg_battle_dungeon', this.onShowWinDialogue, this);
    },

    endBattle: function (playerHasLost) {
        console.log('DungeonController#endbattle', playerHasLost);
        if (playerHasLost) {
            this.callonGameOver();
        } else if (this.numberOfGatesOpened === 3) { // gate 3 was already open: then the current battle was against boss
            this.callOnDefeatedBoss();
        } else {
            this.openNextGate();
        }
    },

    onShowWinDialogue: function(){
        this.currBattleController.onPlayerWon();
    },

    openNextGate: function () {
        this.numberOfGatesOpened++;
        if (this.numberOfGatesOpened > 3) {
            throw new FTRPG.Model.Exception('cannot open gate > 3');
        }
        this.resume(this.numberOfGatesOpened);
    },

    resume: function (openedWalls) {
        console.log('opened walls: ', openedWalls);
        var initialValues = { // keys must fit to Dungeon#initialValues
            playerX: this.player.lastPosition.dungeon[0],
            playerY: this.player.lastPosition.dungeon[1],
            openedWalls: openedWalls || 0
        };
        this.game.state.start('Dungeon', true, false, this, initialValues);
    },

    getInfoBarTexts: function () {
        return [
            this.player.money + " Finger",
            this.player.hp + "/" + this.player.getMaxHP() + " HP",
            "Level " + this.player.skillLevel
        ];
    },
    setLastPosition: function (playerX, playerY) {
        this.player.lastPosition.dungeon = [playerX, playerY];
    }
};