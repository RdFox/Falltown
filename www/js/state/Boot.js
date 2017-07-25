/**
 *  Falltown RPG is a hybrid RPG.
 */
var FTRPG = {
    oriented: false,
    // place for Phaser.State definitions
    State: {},
    // place for controller definitions
    Ctrl: {},
    //place for model definitions
    Model: {},
    Util:{},
    Comp:{}
};
/**
 *The GameState Boot sets essential settings. Then it starts the Preloader
 */
FTRPG.State.Boot = function (game) {
    this.game = game;
};

//window.onbeforeunload = function(){
//    return "Really exit the game? Unsaved progress will be lost!"
//};

FTRPG.State.Boot.prototype = {

    init: function () {
        if (FTRPG.Constants.debuggingEnabled) {
            this.game.add.plugin(Phaser.Plugin.Debug);
            FTRPG.game = this.game; // used to debug
        }
        this.game.plugins.screenShake = this.game.plugins.add(Phaser.Plugin.ScreenShake);
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.refresh();
        if (this.game.device.desktop) {
            //window.onbeforeunload = function () { // can be used to prevent back functionality in browser
            //    console.log("window#onbeforeunload");
            //    return "Your progress will be lost";
            //}; // if user intents to exit
        } else {
            this.scale.forceOrientation(true, false);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
            // document.addEventListener("backbutton", function () { // can be used (by cordova) to handle back button
            //     console.log("back button");
            //     game.state.start('MainMenu');
            // }, false);
        }


    },

    preload: function () {
        this.load.image('preloaderBackground', 'assets/ui/preloader_background.jpg');
        this.load.image('preloaderIcon', 'assets/ui/logo_bg.png');
        this.load.image('preloaderText', 'assets/ui/logo_text.png');

    },

    create: function () {
        this.state.start('Preloader');
    },

    enterIncorrectOrientation: function () {
        FTRPG.orientated = false;
        document.getElementById('orientation').style.display = 'block';
    },

    leaveIncorrectOrientation: function () {
        FTRPG.orientated = true;
        document.getElementById('orientation').style.display = 'none';

    }
};
