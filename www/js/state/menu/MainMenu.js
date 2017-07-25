/**
 * Renders the Main Menu with the title and the play button
 */
FTRPG.State.MainMenu = function (game) {
    this.game = game;
};

FTRPG.State.MainMenu.prototype = {
    gameSetupController: null,
    credits: null,
    startDialog: null,
    normalStyle: null,
    bigStyle: null,
    sprites: {
        gameTitle: null,
        butNewGame: null,
        butLoad: null,
        butCredits: null,
        butFullscreen: null,
        bg: null
    },
    create: function () {
        console.log('MainMenu#create');
        this.normalStyle = FTRPG.StyleFactory.generate.smallStrokedText(0);
        this.bigStyle = FTRPG.StyleFactory.generate.bigStrokedText(0);
        this.gameSetupController = new FTRPG.Ctrl.GameSetupController(this.game);
        this.credits = new FTRPG.State.MainMenu.Credits(this.game);
        this.startDialog = new FTRPG.State.MainMenu.StartDialog(this.game,this.gameSetupController);

        this.createBackground();
        this.createTitle();
        this.createButtons();
        this.credits.create();
        this.startDialog.create();
    },

    createBackground: function () {
        this.bg = this.game.add.image(0, 0, 'ui_border_menu');
    },
    createTitle: function () {
        this.sprites.gameTitle = this.game.add.sprite(this.game.width / 2.0, 100, 'ui_gametitle');
        this.sprites.gameTitle.anchor.setTo(0.5, 0.5);
    },
    createButtons: function () {
        this.sprites.butNewGame = this.createButton(this.game.width / 2, this.game.height / 2 - 75, 'Neues Spiel', this.showStartDialog);
        this.sprites.butLoad = this.createButton(this.game.width / 2, this.game.height / 2, 'Spiel laden', this.loadGame);
        this.sprites.butCredits = this.createButton(this.game.width / 2, this.game.height / 2 + 75, 'Credits', this.showCredits);
        this.sprites.butFullscreen = this.createButton(this.game.width / 2, this.game.height / 2 + 150, 'Vollbild', this.fullscreen);
        if (!this.hasLocalStorage()) {
            this.sprites.butLoad.setDisabled(true);
        }
    },
    showCredits: function () {
        this.credits.show();
    },
    loadGame: function () {
		this.gameSetupController.initFromStorage();
    },
    createButton: function (x, y, text, callback, parent) {
        if (!parent)
            parent = this;
        var btn = new FTRPG.Comp.TextButton(this.game, x, y, 'spr_button', callback, parent, 1, 0, 2, text);
        btn.setPosition(x - btn.getWidth() / 2, y - btn.getHeight() / 2);
        return btn;
    },

    hasLocalStorage: function () {
        console.log('MainMenu#hasLocalStorage');
        var ret = window.localStorage.getItem(FTRPG.Constants.Storage.gameDataKey) !== null;
        console.log('localStorage seems' + (ret ? ' ' : ' not ') + 'to be available');
        return ret;
    },

    update: function () {
		this.credits.update();
    },

    showStartDialog: function () {
		if(this.hasLocalStorage()){
			this.startDialog.show();
		} else {
			this.gameSetupController.initFromScratch();
		}
    },

    fullscreen: function () {
        if (this.game.scale.isFullScreen) {
            this.sprites.butFullscreen.text.text = 'Vollbild';
            this.sprites.butFullscreen.setTextStyle(this.bigStyle);
            this.game.scale.stopFullScreen();
        } else {
            this.sprites.butFullscreen.text.text = 'Vollbild\nbeenden';
            this.sprites.butFullscreen.setTextStyle(this.normalStyle);
            this.game.scale.startFullScreen(false);
        }
    }
};
