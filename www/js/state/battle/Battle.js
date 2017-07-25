FTRPG.State.Battle = function (game) {
    this.game = game;
};
/**
 * A battle is a GameState in which the player fights against an enemy.
 */
FTRPG.State.Battle.prototype = {
    /**
     * controller must provide following methods for callbacks:
     * #onPlayerFled
     * #onPlayerWon
     * #onPlayerLost
     * #getPlayersInventory
     * #onApplyWeapon
     * #onApplyMunition
     * #onApplyArmour
     * #onApplyFood
     * #getProductDescription
     * #getPriceTagText
     */
    controller: null,
    inventory: null,
    game: null,
    // holds several sprites that will be added.
    sounds: {
        gotHit: [],
        hit: []
    },
    enemyMaxHP: 0,
    playerMaxHP: 0,
    sprites: {
        playerSprite: null,
        enemySprite: null,
        bg: null,
        progressPlayer: null,
        progressEnemy: null,
        textStatusPlayer: null,
        textStatusEnemy: null,
        progressbarPlayer: null,
        progressbarEnemy: null,
        fleeButton: null,
        attackButton: null,
        inventoryButton: null,
        attackDefensiveButton: null,
        attackNormallyButton: null,
        attackButtonGroup: null,
        normalButtonGroup: null
    },
    bgName: 'bg_battle',
    onShowWinDialogue: null,
    run: false,
    music: null,

    init: function (battleController, enemyMaxHP, playerMaxHP, bgName, onShowWinDialogue, onShowWinContext) {
        this.controller = battleController;
        this.inventory = new FTRPG.State.Battle.Inventory(this.game, battleController);
        this.enemyMaxHP = enemyMaxHP;
        this.playerMaxHP = playerMaxHP;
        this.bgName = bgName || 'bg_battle';
        this.onShowWinDialogue = onShowWinDialogue;
        this.onShowWinContext = onShowWinContext;
    },


    create: function () {
        this.run = true;
        this.inventory.create();
        this.createAudio();
        this.createBG(this.bgName);
        this.createCharacters();
        this.createButtons();
        this.createFighterInfo();
        // this.game.time.events.add(Phaser.Timer.SECOND * 2, this.letEnemyAttack, this);
    },

    createAudio: function () {
        this.sounds.hit = [this.game.add.audio('snd_hit_02'), this.game.add.audio('snd_hit_02'), this.game.add.audio('snd_hit_02')];
        this.sounds.gotHit = [this.game.add.audio('snd_got_hit_01'), this.game.add.audio('snd_got_hit_02'), this.game.add.audio('snd_got_hit_03')];
        this.music = this.game.add.audio('snd_fight', 0.7, true);
        this.music.play();
    },

    createBG: function (name) {
        this.sprites.bg = this.game.add.image(0, 0, name);
        this.sprites.bg.width = this.game.width;
        this.sprites.bg.height = this.game.height;
    },

    createCharacters: function () {
        // Add the Enemy
        this.sprites.enemySprite = new FTRPG.Model.FighterSprite(this.game, 750, 150, this.controller.getEnemySpriteName());
        // Add the Player
        this.sprites.playerSprite = new FTRPG.Model.FighterSprite(this.game, 200, 350, this.controller.getPlayerSpriteName());


    },

    createFighterInfo: function () {
        var style = FTRPG.StyleFactory.generate.smallText(0);
        this.sprites.progressEnemy = new FTRPG.Comp.ProgressBar(this.game, 30, 70, 370, 30, this.enemyMaxHP);
        this.sprites.progressPlayer = new FTRPG.Comp.ProgressBar(this.game, 560, 400, 370, 30, this.playerMaxHP);
        this.sprites.textStatusEnemy = this.game.add.text(35, 35, '', style);
        this.sprites.textStatusPlayer = this.game.add.text(580, 365, '', style);
    },

    createAttackButton: function (x, y, attackType) {
        var callback = this.createOnAttackEnemyCB(attackType);
        return new FTRPG.Comp.TextButton(this.game, x, y, 'spr_button', callback, this, 1, 0, 2, attackType);
    },

    createButtons: function () {
        this.sprites.fleeButton = new FTRPG.Comp.TextButton(this.game, this.game.width - 210, this.game.height - 80, 'spr_button', this.flee, this, 1, 0, 2, 'Fliehen');
        this.sprites.inventoryButton = new FTRPG.Comp.TextButton(this.game, this.game.width - 410, this.game.height - 80, 'spr_button', this.inventory.show, this.inventory, 1, 0, 2, 'Inventar');
        this.sprites.attackButton = new FTRPG.Comp.TextButton(this.game, this.game.width - 610, this.game.height - 80, 'spr_button', this.toggleAttackButtons, this, 1, 0, 2, 'Angreifen');
        // same buttons for attack mode
        var attackType = FTRPG.Constants.AttackType;
        this.sprites.attackNormallyButton = this.createAttackButton(this.game.width - 210, this.game.height - 80, attackType.offensive);
        this.sprites.attackDefensiveButton = this.createAttackButton(this.game.width - 410, this.game.height - 80, attackType.defensive);
        // this.sprites.attack3Button = this.createAttackButton(this.game.width - 600, this.game.height - 80, 0);
        this.sprites.normalButtonGroup = this.game.add.group();
        this.sprites.attackButtonGroup = this.game.add.group();
        this.sprites.attackButtonGroup.visible = false;
        this.sprites.normalButtonGroup.addMultiple([this.sprites.fleeButton.button, this.sprites.inventoryButton.button]);
        this.sprites.attackButtonGroup.addMultiple([this.sprites.attackNormallyButton.button, this.sprites.attackDefensiveButton.button]);
    },

    flee: function () {
        this.run = false;
        this.sprites.normalButtonGroup.visible = false;
        this.sprites.attackButton.button.visible = false;
        var didSucceed = this.controller.onPlayerFled();
        var succeedText = 'Glückwunsch! Du konntest erfolgreich fliehen. Du kommst mit einem blauen Auge davon';
        var failedText = 'Schade! Auf der Flucht wurdest du vom Gegner eingeholt und nochmal verprügelt. Er hat dir einige Finger geklaut.';
        new FTRPG.Comp.ConfirmDialog(this.game, 'Flucht ergriffen',
            'Du bist geflohen, Feigling.\n\n' + (didSucceed ? succeedText : failedText), 'feige', 1,
            didSucceed ? this.controller.onPlayerFledSuccessFully : this.controller.onPlayerWasCaughtOnFleeing, null, this.controller);
    },

    createOnAttackEnemyCB: function (attackType) {
        return function () {
            this.toggleAttackButtons();
            this.controller.onAttackEnemy(attackType, this.afterPlayerHasAttacked, this);
        }
    },

    afterPlayerHasAttacked: function (attackType, didHit, playerWins, munitionRanOut, weaponUsed) {
        var isOffensive = attackType === FTRPG.Constants.AttackType.offensive;
        if (isOffensive) {
            if (weaponUsed instanceof FTRPG.Model.Weapon) {
                this.sprites.playerSprite.attack(0, didHit ? 650 : 630, didHit ? 160 : 170, this.game.rnd.pick(this.sounds.hit), didHit);
            } else { // player used munition (distance  weapon) and therefore does not need to move
                this.sprites.playerSprite.attack(0, this.sprites.playerSprite.x, this.sprites.playerSprite.y, this.game.rnd.pick(this.sounds.hit), didHit);
            }
            var texts = didHit ? FTRPG.Constants.Battle.playerDidHitTexts : FTRPG.Constants.Battle.playerFailedTexts;
            this.game.time.events.add(500, function () {
                if (munitionRanOut) {
                    this.showMessage('Munition ist alle');
                } else {
                    this.showMessage(this.game.rnd.pick(texts));
                }
            }, this);
        } else {
            this.sprites.playerSprite.defend();
            this.showMessage('Du gehst in Deckung');
        }
        if (playerWins) { // player can win indepedent of attacktype because enemy might be burning in this round
            this.sprites.normalButtonGroup.visible = false;
            this.sprites.attackButton.button.visible = false;
            this.sprites.enemySprite.onBeingDefeated();
            this.sprites.playerSprite.onWon();
            this.game.time.events.add(4000, function(){
                if(this.onShowWinDialogue){
                    this.onShowWinDialogue.call(this.onShowWinContext);
                } else{
                    new FTRPG.Comp.ConfirmDialog(this.game, 'Gewonnen!', 'Herzlichen Glückwunsch. Du hast einige Finger erhalten.\nDu steigst ein Level auf.', 'Gewinner', -10, this.controller.onPlayerWon, null, this.controller);
                }
                this.music.stop();
                this.music = this.game.add.audio('snd_fight_won', 0.7, true);
                this.music.play();
            }, this);
            return;
        }
        // the following only if player did not win

        this.controller.isPlayersTurn = false;
        // this.game.time.events.add(1500, function () {
        //     this.showMessage(this.game.rnd.pick(FTRPG.Constants.Battle.enemysTurnTexts));
        // }, this);
        var duration = this.controller.getDurationUntilEnemyAttacks();
        var enemyAttacksFromDistance = this.controller.enemy.currentWeapon instanceof FTRPG.Model.Munition;
        this.sprites.enemySprite.attack(Math.max(0, duration - 500),
            enemyAttacksFromDistance ? this.sprites.enemySprite.x : 300,
            enemyAttacksFromDistance ? this.sprites.enemySprite.y : 370, null, false);
        this.game.time.events.add(duration, function () {
            this.controller.onEnemyAttacks(this.afterEnemyHasAttacked, this);
        }, this);
    },

    afterEnemyHasAttacked: function (didHit, playerLoses) {
        if (didHit) {
            this.game.plugins.screenShake.shake(this.game.rnd.between(10, 50)); 
            this.game.rnd.pick(this.sounds.gotHit).play();
            this.showMessage(this.game.rnd.pick(FTRPG.Constants.Battle.enemyDidHitTexts));
            if (playerLoses) {
                this.sprites.normalButtonGroup.visible = false;
                this.sprites.attackButton.button.visible = false;
                this.sprites.playerSprite.onBeingDefeated();
                this.sprites.enemySprite.onWon();
                this.game.time.events.add(4000, function () { /*TODO how much money?*/
                    new FTRPG.Comp.ConfirmDialog(this.game, 'Game Over', 'Du wurdest besiegt.', 'Versager', 20, this.controller.onPlayerLost, null, this.controller);
                    this.music.stop();
                    this.music = this.game.add.audio('snd_fight_lost', 0.7, true);
                    this.music.play();
                }, this);
                return;
            }
        } else {
            this.showMessage(this.game.rnd.pick(FTRPG.Constants.Battle.enemyFailedTexts));
        }
        this.game.time.events.add(1500, function () {
            this.showMessage(this.game.rnd.pick(FTRPG.Constants.Battle.playersTurnTexts));
            this.controller.isPlayersTurn = true;
        }, this);
    },


    showMessage: function (message) {
        if (this.inventory.isShown || !this.run) {
            console.log('Did not show message because inventory is currently shown or battle is already over');
            return;
        }
        var style = FTRPG.StyleFactory.generate.bigStrokedText(600, 'white', 3, 'center', 'darkgrey');
        style.font = '60px ' + FTRPG.StyleFactory.defaultFont;
        var text = this.game.add.text(this.game.width / 2.0, this.game.height / 3.0, message, style);
        text.scale.set(5, 5);
        text.rotation = Math.PI / this.game.rnd.between(2, 10);
        text.anchor.set(0.5, 0.5);
        this.game.add.tween(text).to({
            rotation: 0
        }, 800, Phaser.Easing.Linear.Out, true);
        var tween = this.game.add.tween(text.scale).to({
            x: 1,
            y: 1
        }, 800, Phaser.Easing.Quadratic.Out, true);
        tween.onComplete.add(function () {
            this.game.add.tween(text).to({
                alpha: 0.1
            }, 1200, Phaser.Easing.Linear.Out, true);
            var tween2 = this.game.add.tween(text.scale).to({
                x: 0.9,
                y: 0.9
            }, 1200, Phaser.Easing.Linear.InOut, true);
            tween2.onComplete.add(function () {
                text.destroy();
            });
        }, this);
    },

    /**
     * enables the buttons for choosing one attack
     */
    toggleAttackButtons: function () {
        console.log('Battle#toggleAttackButtons');
        var showThem = !this.attackButtonsShowing();
        var cannotDefendWithWeapon = this.controller.getCurrentWeapon() instanceof FTRPG.Model.Munition;
        this.sprites.attackDefensiveButton.setDisabled(cannotDefendWithWeapon);
        if (cannotDefendWithWeapon) {
            this.sprites.attackDefensiveButton.text.text = 'Defensive nicht \nmit Ferkampfwaffe';
            this.sprites.attackDefensiveButton.setTextStyle(FTRPG.StyleFactory.generate.smallStrokedText(0))
        } else {
            this.sprites.attackDefensiveButton.text.text = FTRPG.Constants.AttackType.defensive;
            this.sprites.attackDefensiveButton.setTextStyle(FTRPG.StyleFactory.generate.bigStrokedText(0))
        }
        if (this.controller.getCurrentWeapon() instanceof FTRPG.Model.Weapon) {
            this.sprites.attackNormallyButton.text.text = FTRPG.Constants.AttackType.offensive;
        } else {
            this.sprites.attackNormallyButton.text.text = 'Aus Ferne';
        }
        var groups;
        if (showThem) {
            groups = [this.sprites.normalButtonGroup, this.sprites.attackButtonGroup];
        } else {
            groups = [this.sprites.attackButtonGroup, this.sprites.normalButtonGroup];
        }
        groups[1].y = this.game.height + 5;
        groups[1].visible = true;
        var tween = this.game.add.tween(groups[0])
            .to({y: this.game.height + 5}, 200, Phaser.Easing.Quadratic.In, true);
        tween.onComplete.add(function () {
            groups[0].visible = false;
        }, this);

        this.game.add.tween(groups[1])
            .to({y: 0}, 200, Phaser.Easing.Quadratic.Out, true, 150);
    },

    attackButtonsShowing: function () {
        return this.sprites.attackButtonGroup.visible;
    },

    /**
     * update text sprites
     */
    update: function () {
        this.inventory.update();
        if (this.sprites.attackButton.button.inputEnabled !== this.controller.isPlayersTurn) {
            this.sprites.attackButton.setDisabled(!this.controller.isPlayersTurn);
        }
        var attackButtonText = this.controller.isPlayersTurn ? 'Angreifen' : 'Warten...';
        attackButtonText = this.attackButtonsShowing() ? 'Zurück' : attackButtonText;
        this.sprites.attackButton.text.text = attackButtonText;
        this.sprites.progressPlayer.setValue(this.controller.getPlayerHP(), 'HP ' + this.controller.getPlayerProgressText());
        this.sprites.progressEnemy.setValue(this.controller.getEnemyHP(), 'HP ' + this.controller.getEnemyProgressText());
        this.sprites.textStatusEnemy.text = this.controller.getEnemyStatus();
        this.sprites.textStatusPlayer.text = this.controller.getPlayerStatus(this.attackButtonsShowing());
        if (this.controller.canFlee) {
            this.sprites.fleeButton.text.text = 'Fliehen';
            this.sprites.fleeButton.setTextStyle(FTRPG.StyleFactory.generate.bigStrokedText(0));
        } else {
            this.sprites.fleeButton.text.text = 'Flucht\naussichtslos';
            this.sprites.fleeButton.setTextStyle(FTRPG.StyleFactory.generate.smallStrokedText(0));
        }
        this.sprites.fleeButton.setDisabled(!this.controller.canFlee);
    },

    shutdown: function () {
        console.log('Battle#shutdown'); // TODO add a lot of shutdown stuff
        this.run = false;
        this.sprites = {
            playerSprite: null,
            enemySprite: null,
            bg: null,
            progressPlayer: null,
            progressEnemy: null,
            textStatusPlayer: null,
            textStatusEnemy: null,
            progressbarPlayer: null,
            progressbarEnemy: null,
            fleeButton: null,
            attackButton: null,
            inventoryButton: null,
            attackDefensiveButton: null,
            attackNormallyButton: null,
            attackButtonGroup: null,
            normalButtonGroup: null
        };
        this.sounds = {
            gotHit: [],
            hit: []
        };
        this.music.stop();
        this.onShowWinDialogue = null;
    }
};
