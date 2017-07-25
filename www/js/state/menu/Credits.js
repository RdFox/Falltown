/**
 * Shows the credits and scrolls through them
 * @param game Phaser.Game
 * @constructor
 */
FTRPG.State.MainMenu.Credits = function (game) {
    this.game = game;
};

FTRPG.State.MainMenu.Credits.prototype = {
    game: null,
    isShown: false,
    ticks: 0,
    speed: 1,
    sprites: {
        fixedSpritesGroup: null,
        backButton: null,
        title: null,
        text: [],
        bg: null
    },

    create: function () {
        console.log("Credits#Create");
        var spr = this.sprites;
        var x = this.game.width / 2 - 233;
        var y = this.game.height / 2 - 125;
        spr.bg = this.game.add.image(x, y, 'ui_border_credits');
        spr.bg.inputEnabled = true;

        spr.backButton = this.createButton(this.game.width / 2 - 100, y + 270, 'zurück', this.hide);
        this.createTitle();
        for (var i = 0; i < FTRPG.Constants.Credits.length; i++) {
            var text = this.game.add.text(0, 0, FTRPG.Constants.Credits[i], FTRPG.StyleFactory.generate.smallText(0, 'center', 'white'));
            text.x = this.game.width / 2 - text.width / 2;
            text.y = y + 60 + 23 * i;
            spr.text.push(text);
        }

        spr.fixedSpritesGroup = this.game.add.group();
        spr.fixedSpritesGroup.addMultiple([spr.bg, spr.backButton.button, spr.title]);
        spr.fixedSpritesGroup.addMultiple(spr.text);
        spr.fixedSpritesGroup.visible = false;
    },

    update: function () {
        this.ticks++;
        if (this.isShown && this.ticks % 2 === 0) {
            for (var i = 0; i < this.sprites.text.length; i++) {
                this.moveText(i);
            }
        }
    },
    moveText: function (i) {
        var text = this.sprites.text[i];
        text.y = text.y - this.speed;

        if (text.y < this.game.height / 2 - 100) {
            if (i > 0) {
                text.y = this.sprites.text[i - 1].y + 23;
            } else {
                text.y = this.sprites.text[this.sprites.text.length - 1].y + 23;
            }
        } else if (text.y < this.game.height / 2 - 50) {
            if (text.alpha === 1)
                this.game.add.tween(text).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
        } else if (text.y < this.game.height / 2 + 120) {
            if (text.alpha === 0)
                this.game.add.tween(text).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
        } else {
            text.alpha = 0;
        }
    },


    createTitle: function () {
        this.sprites.title = this.game.add.sprite(this.game.width / 2.0 + 10, this.game.height / 2 - 95, 'ui_title_credits');
        this.sprites.title.anchor.setTo(0.5, 0.5);
    },
    createButton: function (x, y, text, callback, id) {
        var btn = new FTRPG.Comp.TextButton(this.game, x, y, 'spr_button', callback, this, 1, 0, 2, text, id);
        return btn;
    },

    show: function () {
        console.log("Credits#Show");
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
        this.game.add.tween(grp).to({
            x: 0,
            y: -540
        }, 500, Phaser.Easing.Quadratic.In, true);
    }
};
