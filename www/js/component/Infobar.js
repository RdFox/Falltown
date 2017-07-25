FTRPG.Comp.Infobar = function (game, x, y, width, text) {
    this.sprites = {
        group: null,
        text: null,
        bg: null
    };
    this.sprites.group = game.add.group();
    this.sprites.bg = this.sprites.group.create(x, y, 'ui_infobar');
    this.sprites.bg.width = width;
    this.sprites.bg.tint = '#ffffff';
    this.sprites.text = game.add.text(x, this.sprites.bg.height * 0.8  , text, FTRPG.StyleFactory.generate.bigText(0,'left','white'));
    this.sprites.bg.anchor.setTo(0.5, 0);
    this.sprites.text.anchor.setTo(0.5, 1);
    this.sprites.group.add(this.sprites.text);
    this.sprites.group.fixedToCamera = true;
};

FTRPG.Comp.Infobar.prototype = {
    sprites: {},

    setText: function (text) {
        this.sprites.text.text = text;
    },

    getBG: function () {
        return this.sprites.bg;
    },

    setTint: function(tint){
        this.sprites.bg.tint = tint;
    }
};
