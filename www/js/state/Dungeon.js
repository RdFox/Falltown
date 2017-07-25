FTRPG.State.Dungeon = function (game) {
    this.game = game;
    var self = this;
    this.resetInitialValues = function () {
        self.initialValues = { // careful: do not create sub-objects because each ownporperty may be overridden
            openedWalls: 0
        };
    };
    this.playerSpawnPoints = [[100, 400], [150, 400], [300, 400], [600, 120]];
    this.enemySpawnSpots = [[350, 400], [850, 400], [780, 100], [200, 150]];
    this.resetInitialValues();
};

FTRPG.State.Dungeon.prototype = {
    movement: FTRPG.Util.Movement,
    playerSpawnPoints: [],
    ingameMenu: null,
    dialogue: null,
    music: null,
    //"weighted" array of direction changes, "" => idle, the numbers are relative angles based on current orientation
    enemyMoveChances: ["", "", "", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, 90, 180, 270, 270],
    enemySpawnSpots: [], //these are no random points but exact the 4 positions of the enemies
    charPortraitKey: [],
    conversationKey: 'conv_dungeon',
    walls: [ //  [vis,wallNameIndex, x,y,frame] where frame is the frame of the sprite sheet of the dungeon_wall with large tile size
        [3, 1, 4.25, 2.5, 8], // single conector in the middle
        [4, 1, 0, 0, 0], // top horizonal
        [4, 1, 1, 0, 1],
        [4, 1, 2, 0, 1],
        [4, 1, 3, 0, 1],
        [4, 1, 4, 0, 1],
        [4, 1, 5, 0, 1],
        [4, 1, 6, 0, 1],
        [4, 1, 7, 0, 1],
        [4, 1, 8, 0, 1],
        [4, 1, 9, 0, 2],
        [4, 1, 0, 5.15, 6], // bottom horizonal
        [4, 1, 1, 5.15, 7],
        [4, 1, 2, 5.15, 7],
        [4, 1, 3, 5.15, 7],
        [4, 1, 4, 5.15, 7],
        [4, 1, 5, 5.15, 7],
        [4, 1, 6, 5.15, 7],
        [4, 1, 7, 5.15, 7],
        [4, 1, 8, 5.15, 7],
        [4, 1, 9, 5.15, 8],
        [3, 1, 0, 2.5, 0], // middle horizontal
        [3, 1, 1, 2.5, 1],
        [3, 1, 2, 2.5, 1],
        [3, 1, 3, 2.5, 1],
        [3, 1, 4, 2.5, 1],
        [2, 1, 5, 2.5, 1],
        [2, 1, 6, 2.5, 1],
        [2, 1, 7, 2.5, 1],
        [2, 1, 8, 2.5, 1],
        [2, 1, 9, 2.5, 2],
        [4, 0, 0, 1, 6], // left down
        [4, 0, 0, 2, 6],
        [4, 0, 0, 3, 6],
        [4, 0, 0, 4, 6],
        [4, 0, 0, 4.15, 6],
        [4, 0, 19, 1, 6], // right down
        [4, 0, 19, 2, 6],
        [4, 0, 19, 3, 6],
        [4, 0, 19, 4, 6],
        [4, 0, 19, 4.15, 6],
        [3, 0, 9.5, 1, 6], // middle down
        [3, 0, 9.5, 2, 6],
        [1, 0, 9.5, 3, 6],
        [1, 0, 9.5, 4, 6],
        [1, 0, 9.5, 4.15, 6],
        [1, 1, 4.25, 5.15, 8], //connectors
        [3, 1, 4.25, 0, 2],
        [1, 1, 4.75, 2.5, 0]

    ],
    wallNames: ['spr_wall_dungeon_small', 'spr_wall_dungeon_big'],
    wallWidth: [48, 96],
    wallheight: [96, 96],
    sounds: {
        walk: null
    },
    enemies: [],
    sprites: {
        infobar1: null,
        infobar2: null,
        infobar3: null,
        infobarMenu: null,
        land: null,
        wall: [],
        player: null,
        enemySprites: []
    },
    controller: null,
    initialValues: {},

    /**
     * controller must have following functions:
     * #onEncounterEnemy
     */
    init: function (dungeonController, initialvalues) {
        this.controller = dungeonController;
        if (initialvalues) {
            _.forEach(Object.getOwnPropertyNames(initialvalues), function (key) {
                if (initialvalues[key] !== undefined) {
                    this.initialValues[key] = initialvalues[key];
                }
            }, this)
        } else {
            this.resetInitialValues();
        }
        this.ingameMenu = new FTRPG.State.IngameMenu(this.game);
        this.dialogue = null;
    },

    create: function () {
        console.log('Dungeon#create');
        var worldCnstns = FTRPG.Constants.Dungeon.world;
        this.game.world.setBounds(-1000, -1000, worldCnstns.width+1000, worldCnstns.height+1000);
        this.createTiledScrollingBG(this.wall, worldCnstns);

        this.createCharacters();
        // this.createCamera();
        this.cursors = this.game.input.keyboard.createCursorKeys();
        // Info Bar on top of everything (HUD)
        this.createInfoBars();
        this.createMusic();
        this.createSounds();
        this.ingameMenu.create();
        var self = this;
        var currentEnemy = this.enemies[this.initialValues.openedWalls > 1 ? this.initialValues.openedWalls - 1 : 0];
        this.dialogue = new FTRPG.Dialogue(this.game, function () {
            self.dialogue = null;
        });
        self.dialogue.parseXML(this.conversationKey + '' + this.initialValues.openedWalls , 1);
        self.dialogue.renderWindow('ui_bg_dialogue', currentEnemy.images[2]);
        self.dialogue.showDialogue(self.dialogue.load(), FTRPG.StyleFactory.generate.bigStrokedText(600, 'red', 3, 'center', 'white'), null);
    },

    createTiledScrollingBG: function (wall, world) {
        this.sprites.land = this.game.add.tileSprite(0, 0, world.width, world.height, 'txr_dungeon');
        this.createWalls();
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

    createWalls: function () {
        _.forEach(this.walls, function (wall) {
            var width = this.wallWidth[wall[1]];
            var height = this.wallheight[wall[1]];
            var sprite = this.game.add.tileSprite(wall[2] * width, wall[3] * height, width, height, this.wallNames[wall[1]], wall[4]);
            this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
            sprite.body.immovable = true;
            this.sprites.wall.push(sprite);
            return sprite;
        }, this);
    },

    createMusic: function () {
        console.log("createAudio");
        this.music = this.game.add.audio('snd_bunker', 1, true);
        this.music.play();
    },
    createSounds: function () {
        this.sounds.walk = this.game.add.audio('snd_walk_city_01');
    },


    render: function () {

    },


    createCharacters: function () {
        this.enemies = this.controller.getEnemies();

        var add = this.game.add;
        var sprites = this.sprites;

        var spawnPoint = this.playerSpawnPoints[this.initialValues.openedWalls];
        sprites.player = add.sprite(spawnPoint[0], spawnPoint[1], 'spr_player', 25);
        sprites.player.anchor.setTo(0.5, 0.5);
        sprites.player.animations.add('left', [12, 13, 14]);
        sprites.player.animations.add('right', [24, 25, 26]);
        sprites.player.animations.add('down', [0, 1, 2]);
        sprites.player.animations.add('up', [36, 37, 38]);

        //  This will force it to decelerate and limit its speed
        this.game.physics.enable(sprites.player, Phaser.Physics.ARCADE);
        // sprites.player.body.drag.set(0.2);
        // sprites.player.body.maxVelocity.setTo(400, 400);
        sprites.player.body.collideWorldBounds = true;

        for (var i = this.initialValues.openedWalls; i < this.enemies.length; i++) {
            var pos = mv = this.enemySpawnSpots[i];
            var enemy = this.game.add.sprite(pos[0], pos[1], this.enemies[i].images[1]);
            enemy.model = this.enemies[i];
            this.game.physics.enable(enemy, Phaser.Physics.ARCADE);

            // enemy.body.drag.set(0.2);
            // enemy.body.maxVelocity.setTo(400, 400);
            enemy.collideWorldBounds = true;
            enemy.body.immovable = false;
            enemy.animations.add('down', [0, 1, 2]);
            enemy.animations.add('left', [12, 13, 14]);
            enemy.animations.add('right', [24, 25, 26]);
            enemy.animations.add('up', [36, 37, 38]);
            enemy.animations.add('idle', [1]);
            enemy.baseAngle = 180;
            enemy.state = "base";
            enemy.ticks = 11;
            this.sprites.enemySprites.push(enemy);
        }
        // this.updateEnemies(true);
    },


    checkCollisions: function (obj, processCB) {
        var physics = this.game.physics.arcade;
        var spr = this.sprites;
        var objectsThatCollide = [] // add objects that collide into this array
            .concat(spr.wall);
        _.forEach(objectsThatCollide, function (elem) {
            if (elem.visible) {
                physics.collide(obj, elem, null, processCB, this);
            }
        }, this);
    },

    checkCollisionsAgainstEnemies: function (obj) {
        var physics = this.game.physics.arcade;
        var spr = this.sprites;
        var objectsThatCollide = [spr.enemySprites];
        _.forEach(objectsThatCollide, function (wall) {
            physics.collide(obj, wall, null, function (enemy, obj) {
                enemy.state = "idle";
                enemy.animations.play('idle');
                enemy.body.velocity.x = 0;
                enemy.body.velocity.y = 0;
                return true;
            }, this);
        }, this);
    },

    update: function () {
        // // Check for Collisions
        this.checkCollisions(this.sprites.player);
        this.checkCollisionsAgainstEnemies(this.sprites.player);
        if (this.dialogue === null) {
            this.updateControls();
            this.updateEnemies(false);
        } else {
            this.game.physics.arcade.velocityFromAngle(0, 0, this.sprites.player.body.velocity);
            this.sprites.player.animations.stop();
            this.sounds.walk.stop();
            this.dialogue.updateDialogue();
        }

        var infoBarTexts = this.controller.getInfoBarTexts();
        this.sprites.infobar1.setText(infoBarTexts[0]);
        this.sprites.infobar2.setText(infoBarTexts[1]);
        this.sprites.infobar3.setText(infoBarTexts[2]);

        for (var i = 0; i < this.sprites.wall.length; i++) {
            var info = this.walls[i];
            var wall = this.sprites.wall[i];
            wall.visible = !(this.initialValues.openedWalls >= info[0]);
        }
    },

    updateEnemies: function (noidle) {
        for (var i = 0; i < this.sprites.enemySprites.length; i++) {

            var mv = 0;
            var enemy = this.sprites.enemySprites[i];
            this.changeEnemyStateOnBeingClose(enemy);
            if (!enemy.locked) {

                if (enemy.ticks > 15) {
                    noidle = true;
                }
                if (enemy.ticks > 10) {
                    enemy.ticks = 0;
                    mv = Phaser.ArrayUtils.getRandomItem(this.enemyMoveChances);
                } else {
                    if (enemy.state != "idle") {
                        mv = 0;
                    }
                    else {
                        mv = "";
                    }
                }
                enemy.ticks++;
                if (noidle && mv == "") {
                    mv = 0;
                }
                if (mv != "") {

                    enemy.state = "base";
                    var ba = enemy.baseAngle;
                    ba = (ba + mv) % 360;

                    this.animateEnemyVelocity(enemy, ba);
                    enemy.baseAngle = ba;
                } else {
                    enemy.state = "idle";
                }
            }
            this.checkCollisions(enemy, function () {
                if (enemy.locked) {
                    enemy.wrongway = !enemy.wrongway;
                }
                enemy.state = "idle";
                enemy.animations.play('idle')

            });
        }
    },

    changeEnemyStateOnBeingClose: function (enemy) {
        var dist = this.game.physics.arcade.distanceBetween(this.sprites.player, enemy);
        var isClose = dist < FTRPG.Constants.encounterEnemyDistance;
        if (dist < FTRPG.Constants.enemyFollowsPlayerDistance * 0.7 && !isClose
            && enemy.model !== this.enemies[3]) { // the last enemy won't attack on his own
            enemy.ticks = -100000;//ensuring the update doesnt fubar with the enemy

            var px = this.sprites.player.body.x;
            var py = this.sprites.player.body.y;
            var ex = enemy.body.x;
            var ey = enemy.body.y;
            var dx = px - ex;
            var rdx = dx;
            var dy = py - ey;
            var rdy = dy;
            dx *= (dx < 0 ? -1 : 1);
            dy *= (dy < 0 ? -1 : 1);

            if (!enemy.locked) {
                enemy.trackingticks = 0;
                enemy.base = (((dy < dx) || dx < 1) && dy > 1)
            }
            enemy.locked = true;
            if (enemy.base) {
                enemy.body.velocity.x = 0;
                enemy.body.velocity.y = 0;
                var angle = rdy > 0 ? 90 : -90;
                this.animateEnemyVelocity(enemy, angle);
            }
            else {
                enemy.body.velocity.x = 0;
                enemy.body.velocity.y = 0;
                if (dx > 10) {
                    var angle = rdx > 0 ? 0 : 180;
                    this.animateEnemyVelocity(enemy, angle); //0=+x;90=+y;180=-x;270=-y
                }
            }
            if (enemy.trackingticks > 10 && dx > 1 && dy > 1)//jitterstop
            {
                enemy.base = !enemy.base;
                enemy.trackingticks = 0;
            }
            enemy.trackingticks++;
            //enemy.wrongway=false;
        }
        else {
            enemy.locked = false;
            if (isClose) {
                if (enemy.model === this.enemies[3]) { // end boss
                    var self = this;
                    console.log('end boss dialogue starting');
                    this.dialogue = new FTRPG.Dialogue(this.game, function () {
                        self.dialogue = null;
                        self.controller.onEncounterEnemy(enemy.model, self.sprites.player.x, self.sprites.player.y, self.initialValues.openedWalls);
                    });
                    self.dialogue.parseXML(this.conversationKey + '' + 4, 1);
                    self.dialogue.renderWindow('ui_bg_dialogue', enemy.model.images[2]);
                    self.dialogue.showDialogue(self.dialogue.load(), FTRPG.StyleFactory.generate.bigStrokedText(600, 'red', 3, 'center', 'white'), null);
                } else {
                    console.log('encounter');
                    this.controller.onEncounterEnemy(enemy.model, this.sprites.player.x, this.sprites.player.y, this.initialValues.openedWalls);
                }

                enemy.state = "idle";
                enemy.ticks = -100000;//ensuring the update doesnt fubar with the enemy
                enemy.animations.play('idle');
                enemy.body.velocity.x = 0;
                enemy.body.velocity.y = 0;
                enemy.body.immovable = true;
            } else {
                if (enemy.ticks < 0) {
                    enemy.body.immovable = false;
                    enemy.ticks = 15;
                }
            }

        }
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

    animateEnemyVelocity: function (enemy, angle) {
        var animkeys = ["right", "down", "left", "up"];
        this.game.physics.arcade.velocityFromAngle(angle, 90, enemy.body.velocity);
        enemy.animations.play(animkeys[angle / 90], 10, true);
    },

    shutdown: function () {
        console.log("Afterfall#shutdown");
        this.controller.setLastPosition(this.sprites.player.x, this.sprites.player.y);
        FTRPG.Ctrl.LocalStorageController.storeGameData(this.controller.context, 'Dungeon');
        this.resetInitialValues();
        this.sprites.enemySprites = [];
        this.sprites.wall = [];
        this.music.stop();
    }
}
;
