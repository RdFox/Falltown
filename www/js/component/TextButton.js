FTRPG.Comp.TextButton = function (game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, text) {
    this.button = game.add.button(x, y, key, callback, callbackContext, overFrame, outFrame, downFrame);
    this.button.justReleasedPreventsOver = Phaser.PointerMode.CURSOR;
    this.text = game.add.text(this.button.width / 2, this.button.height / 2, text, FTRPG.StyleFactory.generate.bigStrokedText(0));
    this.text.anchor.setTo(0.5);
    this.button.addChild(this.text);
};

FTRPG.Comp.TextButton.prototype = {
    setDisabled: function (disable) {
        this.button.inputEnabled = !disable;
        this.text.alpha = (disable ? 0.5 : 1);
        this.button.freezeFrames = disable;
        this.button.frame = (disable ? 3 : 0);
    },

    setScaleX: function (scale) {
        this.button.scale.x = scale;
        this.text.scale.x = 1;
    },

    setTextStyle: function (style) {
        this.text.setStyle(style);
    },
    
    getWidth: function () {
		return this.button.width;
	},
    
    getHeight: function () {
		return this.button.height;
	},
	setPosition: function(x ,y) {
		this.button.x = x;
		this.button.y = y;
	}
};
