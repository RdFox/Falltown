FTRPG.Ctrl.FalltownController = function (game, player, onStartTutorialCB, onStartCatFightCB, onLeaveFalltownCB, context) {
    this.game = game;
    this.player = player;
    this.weaponStoreController = new FTRPG.Ctrl.WeaponStoreController(this.game, this.player, this.onExitStore, this);
    this.foodStoreController = new FTRPG.Ctrl.FoodStoreController(this.game, this.player, this.onExitStore, this);
    this.callOnStartTutorial = function () {
        onStartTutorialCB.call(context);
    };
    this.callOnStartCatFight = function () {
        onStartCatFightCB.call(context);
    };
    this.callOnLeaveFalltown = function () {
        onLeaveFalltownCB.apply(context, arguments);
    };
    this.context=context;
};

FTRPG.Ctrl.FalltownController.prototype = {
    game: null,
    player: null,
    tutorialDone: false,
    dungeonOpened: false,
    weaponStoreController: null,

    // 0 = north gate to afterfall
    onEnterGate: function (which, playerX, playerY) {
        this.player.lastPosition.falltown = [playerX, playerY];
        if (which === 0) {
            this.callOnLeaveFalltown('Falltown', which);
        } else {
            throw new FTRPG.Model.Exception('cannot leave into this unknown area ' + which);
        }
    },

    onEnterWeaponStore: function (playerX, playerY) {
        this.onEnterStore(this.weaponStoreController, [playerX, playerY]);
    },

    onEnterFoodStore: function (playerX, playerY) {
        this.onEnterStore(this.foodStoreController, [playerX, playerY]);
    },

    onEnterStore: function (controller, posArray) {
        this.game.state.start('Store', true, false, controller);
        this.player.lastPosition.falltown = posArray;
    },

    onExitStore: function () {
        console.log('FalltownController#onExitWeaponStore');
        this.resume();
    },

    onExitDialog: function (playerX, playerY) {
        console.log('FalltownController#onExitDialog');
        this.player.lastPosition.falltown = [playerX, playerY];
        this.resume();
    },


    resume: function () {
        var initialValues = { // keys must fit to Falltown.initialValues
            playerX: this.player.lastPosition.falltown[0],
            playerY: this.player.lastPosition.falltown[1]
        };
        this.game.state.start('Falltown', true, false, this, initialValues);
    },

    getInfoBarTexts: function () {
        return [
            this.player.money + " Finger",
            this.player.hp + "/" + this.player.getMaxHP() + " HP",
            "Level " + this.player.skillLevel
        ];
    },

    afterSpokenToTeacher: function (playerX, playerY) {
        // TODO check in which state the teacher is
        // assuming tutorial state
        this.setLastPosition = [playerX, playerY];
        this.callOnStartTutorial();
    },

    afterSpokenToCatlady: function (playerX, playerY) {
        this.setLastPosition = [playerX, playerY];
        this.callOnStartCatFight();
    },
    setLastPosition: function (playerX, playerY) {
        this.player.lastPosition.falltown = [playerX, playerY];
    }
};