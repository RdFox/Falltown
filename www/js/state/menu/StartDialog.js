/**
 * Shows a start dialog with ok and cancel
 * @param game Phaser.Game
 * @constructor
 */
FTRPG.State.MainMenu.StartDialog = function (game, gameSetupController) {
    this.game = game;
    this.gameSetupController = gameSetupController;
};

FTRPG.State.MainMenu.StartDialog.prototype = {
    game: null,
    isShown: false,
    sprites: {
        fixedSpritesGroup: null,
        backButton: null,
        okButton: null,
        title: null,
        bg: null
    },

    create: function () {
        console.log("StartDialog#Create");
        var spr = this.sprites;
        var x = this.game.width / 2 - 233;
        var y = this.game.height / 2 - 125;
        spr.bg = this.game.add.image(x, y, 'ui_border_credits');
        spr.bg.inputEnabled = true;

        spr.backButton = this.createButton(this.game.width / 2 - 212, y + 270, 'Zurück', this.hide);
        spr.okButton = this.createButton(this.game.width / 2 - 18, y + 270, 'Ja', this.startGame);
        this.createTitle();

        spr.fixedSpritesGroup = this.game.add.group();
        spr.fixedSpritesGroup.addMultiple([spr.bg, spr.backButton.button, spr.okButton.button, spr.title]);
        spr.fixedSpritesGroup.addMultiple(spr.text);
        spr.fixedSpritesGroup.visible = false;
    },

    createTitle: function () {
        this.sprites.title = this.game.add.text(this.game.width / 2.0, this.game.height / 2, FTRPG.Constants.NewGame, FTRPG.StyleFactory.generate.bigText(0, 'center', 'white'));
		this.sprites.title.anchor.set(0.5);
    },
    createButton: function (x, y, text, callback, id) {
        var btn = new FTRPG.Comp.TextButton(this.game, x, y, 'spr_button', callback, this, 1, 0, 2, text, id);
        return btn;
    },
    
    startGame: function () {
        console.log("StartDialog#startGame");
		var tween = this.hide();
		tween.onComplete.add(function () {
			this.gameSetupController.initFromScratch();
		}, this);
    },

    show: function () {
        console.log("StartDialog#Show");
        this.isShown = true;
        this.sprites.fixedSpritesGroup.visible = true;
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup]);
        grp.y = -540;
        var tween = this.game.add.tween(grp).to({
            x: 0,
            y: 0
        }, 1000, Phaser.Easing.Cubic.Out, true);
    },


    hide: function () {
        console.log('Credits#hide');
        this.isShown = false;
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup]);
        var tween = this.game.add.tween(grp).to({
            x: 0,
            y: -540
        }, 500, Phaser.Easing.Quadratic.In, true);
        return tween;
    }
};
