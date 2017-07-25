FTRPG.Comp.ProgressBar = function (game, x, y, width, height, maxValue) {
    var style = FTRPG.StyleFactory.generate.smallText(0, 'center', 'white');
    this.width = width;
    this.height = height;
    this.maxValue = maxValue;

    this.sprites = {
        background: game.add.sprite(x, y, 'bg_red'),
        bar: game.add.sprite(x, y, 'bg_green'),
        textValue: game.add.text(x + 5, y + 4, '', style)
    };

    this.sprites.background.height = height;
    this.sprites.background.width = width;

    this.sprites.bar.height = height;
    this.sprites.bar.width = width;
};
FTRPG.Comp.ProgressBar.prototype.setValue = function (val, unit) {
    this.sprites.bar.width = this.width * Math.min(val, this.maxValue) / this.maxValue;
    this.sprites.textValue.setText(val + ' / ' + this.maxValue + ' ' + unit);
};