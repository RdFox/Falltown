/**
 * Note: IngameMenu is not a Phaser State
 * IngameMenu is the Menu in the Game. e.g. in Falltown
 * @param game Phaser.Game
 * @constructor
 */
FTRPG.State.IngameMenu.IngameStats = function (game) {
    this.game = game;
};


FTRPG.State.IngameMenu.IngameStats.prototype = {
    game: null,
    isShown: false,
    sprites: {
        fixedSpritesGroup: null,
        text: null,
        gameTitle: null,
        backButton: null,
        bg: null,
    },

    create: function () {
		console.log("LoadButtons#Create");
        var spr = this.sprites;
        var x =this.game.width/2;
        var y =this.game.height/2;
        
        this.createBackground(x,y);
        this.createTitle(x,y);
        this.createButtons(x,y);
		
        this.sprites.text = this.game.add.text(x,y, "stats", FTRPG.StyleFactory.generate.smallText(0, 'center', 'white'));
        
        this.sprites.fixedSpritesGroup = this.game.add.group();
        this.sprites.fixedSpritesGroup.addMultiple([this.sprites.bg,this.sprites.gameTitle,this.sprites.backButton.button,this.sprites.text]);
        this.sprites.fixedSpritesGroup.visible = false;
    },
    createBackground: function (x,y){
        this.sprites.bg = this.game.add.image(x, y, 'ui_border_ingame');
        this.sprites.bg.anchor.set(0.5);
        this.sprites.bg.inputEnabled = true;
	},
    createTitle: function (x,y) {
        this.sprites.gameTitle = this.game.add.sprite(x, 100, 'ui_gametitle');
        this.sprites.gameTitle.anchor.setTo(0.5, 0.5);
    },
    createButtons: function (x,y) {
		this.sprites.backButton  = this.createButton(0, 0, 'Fertig', this.hide);
		this.sprites.backButton.setPosition(x - this.sprites.backButton.getWidth() / 2 + 102 + 100,y - this.sprites.backButton.getHeight() / 2 + 100);
    },
    
    createButton: function (x, y, text, callback, id) {
        var btn = new FTRPG.Comp.TextButton(this.game, x, y, 'spr_button', callback, this, 1, 0, 2, text, id);
        return btn;
    },

    show: function () {
		console.log("LoadButtons#Show");
        this.isShown = true;
        this.sprites.fixedSpritesGroup.visible = true;
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup]);
        grp.y = -540;
        grp.fixedToCamera = true;
        this.game.add.tween(grp)
            .to({
                x: 0,
                y: 0
            }, 1000, Phaser.Easing.Cubic.Out, true);
    },

    hide: function () {
        console.log('Inventory#hide');
        this.isShown = false;
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup]);
        this.game.add.tween(grp).to({
            x: 0,
            y: -540
        }, 500, Phaser.Easing.Quadratic.In, true);
    },
    toggle: function(){
		if(this.isShown){
		console.log("Toggle#Hide");
			this.hide();
		} else {
		console.log("Toggle#Show");
			this.show();
		}
	}
};
