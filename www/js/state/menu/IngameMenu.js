/**
 * Note: IngameMenu is not a Phaser State
 * IngameMenu is the Menu in the Game. e.g. in Falltown
 * @param game Phaser.Game
 * @constructor
 */
FTRPG.State.IngameMenu = function (game, player) {
    this.game = game;
    this.player = player;
};


FTRPG.State.IngameMenu.prototype = {
    game: null,
    isShown: false,
    inventory: null,
    stats: null,
    sprites: {
        fixedSpritesGroup: null,
        gameTitle: null,
        inventaryButton: null,
        statsButton: null,
        backButton: null,
        endButton: null,
        bg: null,
        whiteBG: null
    },

    create: function () {
        var x = this.game.width/2;
        var y = this.game.height/2;
        
        this.inventory = new FTRPG.State.IngameMenu.IngameInventory(this.game, this.player);
        this.inventory.create();
        this.stats = new FTRPG.State.IngameMenu.IngameStats(this.game);
        this.stats.create();
        
        this.createWhiteOverlay();
        this.createBackground(x,y);
        this.createTitle(x,y);
        this.createButtons(x,y);
        
        this.sprites.fixedSpritesGroup = this.game.add.group();
        this.sprites.fixedSpritesGroup.addMultiple(
                [this.sprites.whiteBG,this.sprites.bg,this.sprites.gameTitle,this.sprites.endButton.button,
                        this.sprites.backButton.button,this.sprites.statsButton.button,this.sprites.inventaryButton.button]);
        this.sprites.fixedSpritesGroup.visible = false;
    },
    createWhiteOverlay: function (){
        this.sprites.whiteBG = this.game.add.image(0, 0, 'bg_white');
        this.sprites.whiteBG.width = this.game.width;
        this.sprites.whiteBG.height = this.game.height;
        this.sprites.whiteBG.alpha = 0.7;
        this.sprites.whiteBG.inputEnabled = true;
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
		this.sprites.inventaryButton = this.createButton(0,0, 'Inventar', this.showInventory);
		this.sprites.statsButton = this.createButton(0, 0, 'Stats', this.showStats);
		this.sprites.backButton  = this.createButton(0, 0, 'Fertig', this.hide);
		this.sprites.endButton  = this.createButton(0, 0, 'Hauptmenü', this.gotoMainMenu);
		this.sprites.inventaryButton.setPosition(x - this.sprites.inventaryButton.getWidth() / 2 + 102 + 100,y - this.sprites.inventaryButton.getHeight() / 2 );
		this.sprites.statsButton.setPosition(x - this.sprites.statsButton.getWidth() / 2 - 102 + 100,y - this.sprites.statsButton.getHeight() / 2 );
		this.sprites.backButton.setPosition(x - this.sprites.backButton.getWidth() / 2 + 102 + 100,y - this.sprites.backButton.getHeight() / 2 + 100);
		this.sprites.endButton.setPosition(x - this.sprites.endButton.getWidth() / 2 - 102 + 100,y - this.sprites.endButton.getHeight() / 2 + 100);
    },
    
    showInventory: function(){
		this.inventory.show();
	},
	
    showStats: function(){
		this.stats.show();
	},
	
    gotoMainMenu: function(){
        this.game.state.start('MainMenu');
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
        grp.fixedToCamera = true;
        grp.visible = true;
        this.game.add.tween(grp)
            .to({
                alpha: 1
            }, 1000, Phaser.Easing.Cubic.In, true);
    },

    hide: function () {
        console.log('Inventory#hide');
        this.isShown = false;
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup]);
        grp.fixedToCamera = true;
        var tween = this.game.add.tween(grp).to({
            alpha: 0
        }, 200, Phaser.Easing.Quadratic.Out, true);
        tween.onComplete.add(function () {
            grp.visible=false;
        }, this);
    },
    toggle: function(){
		if(this.isShown){
		console.log("Toggle#Hide");
			this.hide();
		} else {
		console.log("Toggle#Show");
			this.show();
		}
	},
	update: function () {
		if(this.inventory.isShown){
			this.inventory.update();
		}
    }
};
