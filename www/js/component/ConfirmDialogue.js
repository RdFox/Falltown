FTRPG.Comp.ConfirmDialog = function (game, title, text, badgeText, tintMultiplier, onClickCallBack, onNegativeCallBack, context) {
    this.sprites = {
        whiteBG: game.add.image(0, 0, 'bg_white'),
        bg: game.add.image(game.width / 2.0, game.height / 2.0, 'ui_bg_confirmdialogue'),
        border: game.add.image(game.width / 2.0, game.height / 2.0, 'ui_border_confirmdialogue'),
        title: game.add.text(game.width / 2.0, 100, title, FTRPG.StyleFactory.generate.bigText(300, 'center', 'white')),
        text: game.add.text(game.width / 2.0, 180, text, FTRPG.StyleFactory.generate.bigStrokedText(450, 'white', 3, 'center')),
        badgeText: game.add.text(825, 240, badgeText, FTRPG.StyleFactory.generate.smallText(60, 'center', 'white')),
        posButton: new FTRPG.Comp.TextButton(game, 385, 400, 'spr_button', onClickCallBack, context, 1, 0, 2, 'OK'),
        negButton: onNegativeCallBack ? new FTRPG.Comp.TextButton(game, 590, 400, 'spr_button', onNegativeCallBack, context, 1, 0, 2, 'Nein') : null
    };
    this.sprites.badgeText.alpha = 0;
    this.sprites.title.alpha = 0;
    this.sprites.text.alpha = 0;
    this.sprites.whiteBG.alpha = 0;
    this.sprites.bg.anchor.setTo(0.5, 0.5);
    this.sprites.border.anchor.setTo(0.5, 0.5);
    this.sprites.badgeText.anchor.setTo(0.5, 0.5);
    this.sprites.text.anchor.setTo(0.5, 0);
    this.sprites.title.anchor.setTo(0.5);
    this.sprites.bg.width = 0;
    this.sprites.bg.height = 0;
    this.sprites.border.width = 0;
    this.sprites.border.height = 0;
    this.sprites.whiteBG.width = game.width;
    this.sprites.whiteBG.height = game.height;

    this.sprites.bg.alpha = 0.0;
    this.sprites.border.tint = tintMultiplier * 0xffffff;
    game.add.tween(this.sprites.bg).to({alpha: 1.0}, 1000, Phaser.Easing.Quadratic.InOut, true);
    if (!onNegativeCallBack) {
        this.sprites.posButton.button.visible = false;
        this.sprites.bg.inputEnabled = true;
        this.sprites.bg.events.onInputDown.add(onClickCallBack, context || this);
    } else {
        this.sprites.posButton.button.alpha = 0;
        this.sprites.negButton.button.alpha = 0;
    }
    var tween = game.add.tween(this.sprites.bg).to({
        width: 930,
        height: 480
    }, 500, Phaser.Easing.Quadratic.In, true);
    game.add.tween(this.sprites.border).to({
        width: 930,
        height: 480
    }, 500, Phaser.Easing.Quadratic.In, true);
    tween.onComplete.add(function () {
        // game.add.tween(self.sprites.bg).to({
        //     width: game.width * 0.9,
        //     height: game.height * 0.9
        // }, 500, Phaser.Easing.Elastic.Out, true);
        game.add.tween(this.sprites.text).to({alpha: 1.0}, 500, Phaser.Easing.Linear.InOut, true);
        game.add.tween(this.sprites.title).to({alpha: 1.0}, 500, Phaser.Easing.Linear.InOut, true);
        game.add.tween(this.sprites.whiteBG).to({alpha: 0.7}, 500, Phaser.Easing.Linear.InOut, true);
        game.add.tween(this.sprites.badgeText).to({alpha: 1.0}, 500, Phaser.Easing.Linear.InOut, true);
        game.add.tween(this.sprites.posButton.button).to({alpha: 1.0}, 500, Phaser.Easing.Linear.InOut, true);
        if(onNegativeCallBack){
            game.add.tween(this.sprites.negButton.button).to({alpha: 1.0}, 500, Phaser.Easing.Linear.InOut, true);
        }
    }, this);
};
