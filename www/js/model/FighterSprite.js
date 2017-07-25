FTRPG.Model.FighterSprite = function (game, x, y, spriteName) {
    this.game = game;
    this.origX = x;
    this.origY = y;
    this.sprites = {
        shadow: this.game.add.sprite(0, 0, 'battle_shadow'),
        sprite: this.game.add.sprite(0, 0, spriteName),
        group: null
    };
    this.sprites.group = game.add.group();
    this.sprites.group.x = x;
    this.sprites.group.y = y;
    this.sprites.group.addMultiple([this.sprites.shadow, this.sprites.sprite]);
    this.sprites.sprite.scale.set(2.4, 2.4);

    this.sprites.sprite.animations.add('attack', [0, 1, 2, 3, 4, 5, 6, 7, 8, 32]);
    this.sprites.sprite.animations.add('idle', [18, 19, 20, 21, 22, 23, 24, 25, 26, 12]);
    this.sprites.sprite.animations.add('defeated', [31, 32, 33, 40, 41, 42, 51, 52, 53]);
    this.sprites.sprite.animations.add('makeParty', [31, 32, 33, 34, 35, 36, 37, 38]);
    this.sprites.sprite.animations.add('defend', [27, 28, 29, 30, 27]);

    this.sprites.shadow.anchor.set(0.5, 0.1);
    this.sprites.sprite.anchor.set(0.5);

    this.sprites.shadow.width = 100;
    this.sprites.shadow.height = 100;
};
FTRPG.Model.FighterSprite.prototype = {
    constructor: FTRPG.Model.FighterSprite,
    game: null,
    origX: 0,
    origY: 0,

    attack: function (delay, targetX, targetY, sound, didHit) {
        var tween = this.game.add.tween(this.sprites.group).to({
            x: targetX,
            y: targetY
        }, 500, Phaser.Easing.Quadratic.InOut, true, delay);
        tween.onComplete.add(function () {
            if (didHit) {
                sound.play();
            }
            this.sprites.sprite.animations.play('attack', 10, false);
        }, this);
        tween2 = this.game.add.tween(this.sprites.group).to({
            x: this.origX,
            y: this.origY
        }, 500, Phaser.Easing.Quadratic.InOut, true, delay + 1000);
        tween2.onComplete.add(function () {
            this.sprites.sprite.animations.play('idle', 10, false);
        }, this);
    },

    onBeingDefeated: function () {
        this.sprites.sprite.animations.play('defeated', 5, false);
    },

    onWon: function () {
        this.sprites.sprite.animations.play('makeParty', 10, false);
    },

    defend: function () {
        this.sprites.sprite.animations.play('defend', 10, false);
    }
};