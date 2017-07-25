FTRPG.State.Falltown = function (game) {
    this.game = game;
    var self = this;
    this.resetInitialValues = function () {
        self.initialValues = { // careful: do not create sub-objects because each ownporperty may be overridden
            playerX: 1750,
            playerY: 700,
            teacherX: 1600,
            teacherY: 700,
            northGateIsOpen: true
        };
    };
    this.resetInitialValues();
};

FTRPG.State.Falltown.prototype = {
    movement: FTRPG.Util.Movement,
    ingameMenu: null,
    dialogue: null,
    music: null,
    villagerCount: 4,
    //"weighted" array of direction changes, "" => idle, the numbers are relative angles based on current orientation
    enemyMoveChances: ["", "", "", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, 90, 180, 270, 270],
    //spawn spots for villagers to avoid the reposition hack
    villagerSpawnPoints: [],
    wall: {
        edgeLength: 85,
        width: 23 * 85,
        height: 18 * 85,
        northGateXOffset: 11 * 85,
        topLeftX: 147.5,
        topLeftY: 110
    },
    sounds: {
        walk: null
    },
    sprites: {
        infobar1: null,
        infobar2: null,
        infobar3: null,
        infobar3: null,
        infobarMenu: null,
        teacherSpeechBubble: null,
        weaponVendorSpeechBubble: null,
        foodVendorSpeechBubble: null,
        catladySpeechBubble: null,
        land: null,
        grass: [],
        wall: [],
        house: null,
        player: null,
        teacher: null,
        weaponVendor: null,
        foodVendor: null,
        foodstore: null,
        weaponstore: null,
        villagers: [],
        decoration: []
    },
    houseX: 1500,
    houseY: 350,
    catladyX: 1700,
    catladyY: 1400,
    foodVendorX: 950,
    foodVendorY: 1350,
    foodStoreX: 800,
    foodStoreY: 900,
    weaponVendorX: 700,
    weaponVendorY: 600,
    weaponStoreX: 200,
    weaponStoreY: 200,
    villagerX: 480,
    villagerY: 1050,
    decoPositions: {
        'deco_barrel': [[1600, 1300], [1550, 1200], [1670, 1170]],
        'deco_tree': [],
        'deco_foodsign': [[350, 1100]],
        'deco_sign': [[800, 350]]
        // 'deco_bush': [[415, 2700]],
    },
    controller: null,
    initialValues: {},

    /**
     * controller must have following functions:
     * #onEnterWeaponStore
     * #onEnterFoodStore
     * #getInfoBarText
     * #afterSpokenToTeacher
     */
    init: function (falltownController, initialvalues) {
        this.controller = falltownController;
        if (initialvalues) {
            _.forEach(Object.getOwnPropertyNames(initialvalues), function (key) {
                if (initialvalues[key] !== undefined) {
                    console.log('loading initialvalues[' + key + '] = ' + initialvalues[key]);
                    this.initialValues[key] = initialvalues[key];
                }
            }, this)
        } else {
            this.resetInitialValues();
        }
        this.ingameMenu = new FTRPG.State.IngameMenu(this.game, this.controller.player);
    },

    createCBOnTalkToCharacter: function (characterSprite, characterPortraitKey, conversationKey, scene, onDialogFinished) {
        var self = this;
        return function cb() {
            console.log("Falltown#onTalkToPerson");
            if (self.dialogue != null) {
                console.log("already talking");
                return;
            }
            // after clicking on teacher, the player must be forced to walk towarda the teacher
            var movePlayerToSpriteTween = this.game.add.tween(this.sprites.player).to({
                x: characterSprite.x + 80,
                y: characterSprite.y + 70
            }, 1000, Phaser.Easing.Quadratic.InOut, true);
            this.game.add.tween(this.game.camera).to({
                x: characterSprite.x - this.game.width / 2.0,
                y: characterSprite.y - 200
            }, 1000, Phaser.Easing.Quadratic.InOut, true);

            movePlayerToSpriteTween.onComplete.add(function () {
                self.sprites.player.animations.play('up', 10, true);
                self.sprites.player.animations.stop();
                self.dialogue = new FTRPG.Dialogue(self.game, onDialogFinished);
                self.dialogue.parseXML(conversationKey, scene);
                self.dialogue.renderWindow('ui_bg_dialogue', characterPortraitKey);
                self.dialogue.showDialogue(self.dialogue.load(), FTRPG.StyleFactory.generate.bigStrokedText(600, 'red', 3, 'center', 'white'), null);
            });
        }
    },

    create: function () {
        console.log('Falltown#create');
        var worldCnstns = FTRPG.Constants.Falltown.world;
        this.game.world.setBounds(0, 0, worldCnstns.width, worldCnstns.height);
        this.createTiledScrollingBG(this.wall, worldCnstns);
        this.sprites.house = this.createBuilding(this.houseX, this.houseY, 'building_house', 0.4);
        this.sprites.weaponstore = this.createBuilding(this.weaponStoreX, this.weaponStoreY, 'building_weaponstore', 0.5);
        this.sprites.foodstore = this.createBuilding(this.foodStoreX, this.foodStoreY, 'building_foodstore', 0.4);

        this.createDecoration();
        this.createCharacters();
        this.createCamera();
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.createInfoBars();
        this.createMusic();
        this.createSounds();
        this.ingameMenu.create();
    },

    createInfoBars: function () {
        // Info Bar on top of everything (HUD)
        this.sprites.infobar1 = new FTRPG.Comp.Infobar(this.game, this.game.width - 340, 0, 160, '');
        this.sprites.infobar2 = new FTRPG.Comp.Infobar(this.game, this.game.width - 160, 0, 160, '');
        this.sprites.infobar3 = new FTRPG.Comp.Infobar(this.game, this.game.width - 495, 0, 120, '');
        this.sprites.infobarMenu = new FTRPG.Comp.Infobar(this.game, 150, 0, 90, 'Menü');
        this.sprites.infobarMenu.getBG().inputEnabled = true;
        this.sprites.infobarMenu.getBG().events.onInputDown.add(this.ingameMenu.toggle, this.ingameMenu);
    },

    createTiledScrollingBG: function (wall, world) {
        //  Our tiled scrolling background
        this.sprites.land = this.game.add.tileSprite(wall.topLeftX, wall.topLeftY, wall.width, wall.height, 'txr_earth');
        this.sprites.grass = [
            this.game.add.tileSprite(0, 0, world.width, wall.topLeftY, 'txr_landscape'),
            this.game.add.tileSprite(0, wall.topLeftY, wall.topLeftX, world.height - wall.topLeftY, 'txr_landscape'),
            this.game.add.tileSprite(wall.topLeftX, wall.topLeftY + wall.height, world.width - wall.topLeftX, world.height - wall.topLeftY - wall.height, 'txr_landscape'),
            this.game.add.tileSprite(wall.topLeftX + wall.width, wall.topLeftY, world.width - wall.topLeftX - wall.width, world.height - (world.height - wall.height), 'txr_landscape')
        ];
        this.createWalls();
    },

    createBuilding: function (x, y, imageKey, scale) {
        var sprite = this.game.add.sprite(x, y, imageKey);
        this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.scale.setTo(scale || 1, scale || 1);
        //this.sprites.house.body.collideWorldBounds = true;
        sprite.body.immovable = true;
        return sprite;
    },

    createWalls: function () {
        var edge = this.wall.edgeLength;
        var wall = this.wall;
        var n = this.createWall(wall.topLeftX + edge, wall.topLeftY, wall.width - (2 * edge), edge, 4);
        var s = this.createWall(wall.topLeftX + edge, wall.topLeftY + wall.height - edge, wall.width - (2 * edge), edge, 7);
        var w = this.createWall(wall.topLeftX, wall.topLeftY + edge, edge, wall.height - (2 * edge), 3);
        var e = this.createWall(wall.topLeftX + wall.width - edge, wall.topLeftY + edge, edge, wall.height - (2 * edge), 5);
        var north_gate = this.game.add.sprite(wall.topLeftX + wall.northGateXOffset, wall.topLeftY - 25, 'gate');
        this.game.physics.enable(north_gate, Phaser.Physics.ARCADE);
        north_gate.body.immovable = true;
        north_gate.anchor.setTo(0.5, 0.25);
        north_gate.visible = this.initialValues.northGateIsOpen;

        var nw = this.createWall(wall.topLeftX, wall.topLeftY, edge, edge, 0); // nw
        var ne = this.createWall(wall.topLeftX + wall.width - edge, wall.topLeftY, edge, edge, 2); // ne
        var sw = this.createWall(wall.topLeftX, wall.topLeftY + wall.height - edge, edge, edge, 6); // sw
        var se = this.createWall(wall.topLeftX + wall.width - edge, wall.topLeftY + wall.height - edge, edge, edge, 8); // se
        this.sprites.wall = [n, s, w, e, nw, ne, sw, se]; //!! make sure northgate to Afterfall is on index 0!!!!!
        this.sprites.gate = north_gate;
    },

    createWall: function (x, y, width, height, frame) {
        var sprite = this.game.add.tileSprite(x, y, width, height, 'spr_wall', frame);
        this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.body.immovable = true;
        return sprite;
    },

    createMusic: function () {
        console.log("createAudio");
        this.music = this.game.add.audio('snd_falltown', 1, true);
        this.music.play();
    },
    createSounds: function () {
        this.sounds.walk = this.game.add.audio('snd_walk_city_01');
    },


    render: function () {
        // this.game.debug.spriteInfo(this.sprites.player, 15, 15);
        // this.game.debug.pointer(this.game.input.pointer1, true);
    },

    setUpTalkableCharacter: function (sprite, speechBubbleSprite, onTalkTo) {
        sprite.scale.setTo(2, 2);
        sprite.inputEnabled = true;
        sprite.events.onInputDown.add(onTalkTo, this);
        this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
        //sprite.body.collideWorldBounds = true;
        sprite.body.immovable = true;

        speechBubbleSprite.anchor.setTo(0.2, 0.9);
        speechBubbleSprite.visible = false;
        speechBubbleSprite.inputEnabled = true;
        speechBubbleSprite.events.onInputDown.add(onTalkTo, this);
    },

    createCharacters: function () {
        var self = this;
        var add = this.game.add;
        var sprites = this.sprites;
        sprites.weaponVendor = add.sprite(this.weaponVendorX, this.weaponVendorY, 'spr_char_weaponvendor', 1);
        sprites.foodVendor = add.sprite(this.foodVendorX, this.foodVendorY, 'spr_char_foodvendor', 1);
        sprites.teacher = add.sprite(this.initialValues.teacherX, this.initialValues.teacherY, 'spr_teacher', 1);
        sprites.catlady = add.sprite(this.catladyX, this.catladyY, 'spr_catlady', 1);
        sprites.villager = add.sprite(this.villagerX, this.villagerY, 'spr_villager2', 1);
        sprites.weaponVendorSpeechBubble = add.image(sprites.weaponVendor.x + sprites.weaponVendor.width, sprites.weaponVendor.y, 'speechbubble');
        sprites.foodVendorSpeechBubble = add.image(sprites.foodVendor.x + sprites.foodVendor.width, sprites.foodVendor.y, 'speechbubble');
        sprites.teacherSpeechBubble = add.image(sprites.teacher.x + sprites.teacher.width, sprites.teacher.y, 'speechbubble');
        sprites.catladySpeechBubble = add.image(sprites.catlady.x + sprites.catlady.width, sprites.catlady.y, 'speechbubble');
        sprites.villagerSpeechBubble = add.image(sprites.villager.x + sprites.villager.width, sprites.villager.y, 'speechbubble');

        var onTalkToTeacher = this.createCBOnTalkToCharacter(sprites.teacher, 'spr_ptr_teacher', 'conv_teacher', 1, function () {
            self.dialogue = null;
            self.controller.afterSpokenToTeacher(self.sprites.player.x, self.sprites.player.y);
        });
        var onTalkToCatlady = this.createCBOnTalkToCharacter(sprites.catlady, 'spr_ptr_catlady', 'conv_catlady', 1, function () {
            self.dialogue = null;
            self.controller.afterSpokenToCatlady(self.sprites.player.x, self.sprites.player.y);
        });
        var onTalkToWeaponVendor = this.createCBOnTalkToCharacter(sprites.weaponVendor, 'spr_ptr_weaponVendor', 'conv_weaponvendor', 1, function () {
            self.dialogue = null;
            self.controller.onEnterWeaponStore(self.sprites.player.x, self.sprites.player.y);
        });
        var onTalkToFoodVendor = this.createCBOnTalkToCharacter(sprites.foodVendor, 'spr_ptr_foodvendor', 'conv_foodvendor', 1, function () {
            self.dialogue = null;
            self.controller.onEnterFoodStore(self.sprites.player.x, self.sprites.player.y);
        });
        var onTalkToVillager = this.createCBOnTalkToCharacter(sprites.villager, 'spr_ptr_villager2', 'conv_villager', 1, function () {
            self.dialogue = null;
            self.controller.onExitDialog(self.sprites.player.x, self.sprites.player.y);
        });
        this.setUpTalkableCharacter(sprites.weaponVendor, sprites.weaponVendorSpeechBubble, onTalkToWeaponVendor);
        this.setUpTalkableCharacter(sprites.foodVendor, sprites.foodVendorSpeechBubble, onTalkToFoodVendor);
        this.setUpTalkableCharacter(sprites.teacher, sprites.teacherSpeechBubble, onTalkToTeacher);
        this.setUpTalkableCharacter(sprites.catlady, sprites.catladySpeechBubble, onTalkToCatlady);
        this.setUpTalkableCharacter(sprites.villager, sprites.villagerSpeechBubble, onTalkToVillager);

        sprites.teacher.scale.setTo(1.25, 1.25);
        sprites.catlady.scale.setTo(1, 1);
        sprites.villager.scale.setTo(1.25, 1.25);

        sprites.player = add.sprite(this.initialValues.playerX, this.initialValues.playerY, 'spr_player');
        sprites.player.anchor.setTo(0.5, 0.5);
        sprites.player.animations.add('left', [12, 13, 14]);
        sprites.player.animations.add('right', [24, 25, 26]);
        sprites.player.animations.add('down', [0, 1, 2]);
        sprites.player.animations.add('up', [36, 37, 38]);

        //  This will force it to decelerate and limit its speed
        this.game.physics.enable(sprites.player, Phaser.Physics.ARCADE);
        sprites.player.body.drag.set(0.2);
        sprites.player.body.maxVelocity.setTo(400, 400);
        sprites.player.body.collideWorldBounds = true;
    },

    createDecoration: function () {
        _.forEach(Object.getOwnPropertyNames(this.decoPositions), function (decoName) {
            var positions = this.decoPositions[decoName];
            _.forEach(positions, function (pos) {
                this.createDecorationItem(pos[0], pos[1], decoName);
            }, this);
        }, this);
    },

    createDecorationItem: function (x, y, imageKey) {
        var item = this.game.add.sprite(x, y, imageKey);
        this.game.physics.enable(item, Phaser.Physics.ARCADE);
        item.body.immovable = true;
        this.sprites.decoration.push(item);
    },

    createCamera: function () {
        // Now center the camera and create the borders from which are scrolled
        this.game.camera.follow(this.sprites.player);
        this.camX = FTRPG.Constants.Falltown.deadZoneOffsetX;
        this.camY = FTRPG.Constants.Falltown.deadZoneOffsetY;
        // params: x, y, width, height
        this.game.camera.deadzone = new Phaser.Rectangle(
            this.camX, this.camY,
            this.game.width - this.camX * 2, this.game.height - this.camY * 2);
    },

    checkCollisions: function (obj, processCB) {
        var physics = this.game.physics.arcade;
        var spr = this.sprites;
        var objectsThatCollide =
            [spr.house, spr.teacher, spr.foodstore, spr.weaponstore, spr.foodVendor, spr.weaponVendor, spr.catlady, spr.villager] // add objects that collide into this array
                .concat(spr.wall)
                .concat(spr.decoration);
        _.forEach(objectsThatCollide, function (wall) {
            physics.collide(obj, wall, null, processCB, this);
        }, this);
    },

    update: function () {
        // Check for Collisions
        this.checkCollisions(this.sprites.player);
        if (this.dialogue === null && !this.ingameMenu.isShown) {
            this.updateControls();
        } else if (this.dialogue !== null) {
            this.dialogue.updateDialogue();
        }
        if (this.checkOverlap(this.sprites.player, this.sprites.gate)) {
        	this.sprites.player.y += 8;/*prevent instant return*/
            this.controller.onEnterGate(0, this.sprites.player.x, this.sprites.player.y);
        }

        this.showSpeechBubbleIfCloseTo(this.sprites.teacher, this.sprites.teacherSpeechBubble);
        this.showSpeechBubbleIfCloseTo(this.sprites.weaponVendor, this.sprites.weaponVendorSpeechBubble);
        this.showSpeechBubbleIfCloseTo(this.sprites.foodVendor, this.sprites.foodVendorSpeechBubble);
        this.showSpeechBubbleIfCloseTo(this.sprites.catlady, this.sprites.catladySpeechBubble);
        this.showSpeechBubbleIfCloseTo(this.sprites.villager, this.sprites.villagerSpeechBubble);
        var infoBarTexts = this.controller.getInfoBarTexts();
        this.sprites.infobar1.setText(infoBarTexts[0]);
        this.sprites.infobar2.setText(infoBarTexts[1]);
        this.sprites.infobar3.setText(infoBarTexts[2]);
        if (this.ingameMenu.isShown) {
            this.ingameMenu.update();
        }
    },


    showSpeechBubbleIfCloseTo: function (sprite, speechBubbleSprite) {
        var dist = this.game.physics.arcade.distanceBetween(this.sprites.player, sprite);
        var isClose = dist < 200;
        sprite.inputEnabled = isClose;
        speechBubbleSprite.inputEnabled = isClose;
        speechBubbleSprite.visible = isClose;
    },

    updateControls: function () {
        var cursorActive = this.movement.isAnyCursorActive(this.cursors);
        var touchActive = this.movement.isPointerActive(this.game.input.pointer1);
        var spriteDir = null;
        if (touchActive) {
            var touchAngle = Phaser.Math.radToDeg(this.game.physics.arcade.angleToPointer(this.sprites.player.body, this.game.input.pointer1));
            spriteDir = this.movement.currentTouchDirection(touchAngle);
        } else if (cursorActive) {
            spriteDir = this.movement.currentKeyboardDirection(this.cursors);
        }
        if (spriteDir !== null) { // spimple check for falsy would not be sufficient (spriteDir can be zero)
            var animation = this.movement.angleAnimationMap[spriteDir];
            this.animatePlayerVelocity(spriteDir, animation);
            if (!this.sounds.walk.isPlaying)
                this.sounds.walk.play();
        } else {
            this.game.physics.arcade.velocityFromAngle(0, 0, this.sprites.player.body.velocity);
            this.sprites.player.animations.stop();
            this.sounds.walk.stop();
        }
    },

    animatePlayerVelocity: function (angle, animationName) {
        this.game.physics.arcade.velocityFromAngle(angle, 250, this.sprites.player.body.velocity);
        this.sprites.player.animations.play(animationName, 10, true);
    },

    checkOverlap: function (spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();
        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    shutdown: function () {
        console.log("Falltown#shutdown");
        this.controller.setLastPosition(this.sprites.player.x, this.sprites.player.y);
        FTRPG.Ctrl.LocalStorageController.storeGameData(this.controller.context, 'Falltown');
        this.resetInitialValues();
        this.sprites.villagers = [];
        this.sprites.grass = [];
        this.sprites.decoration = [];
        this.music.stop();
    }
}
;
