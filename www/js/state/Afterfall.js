FTRPG.State.Afterfall = function (game) {
    this.game = game;
    var self = this;
    this.resetInitialValues = function () {
        self.initialValues = { // careful: do not create sub-objects because each ownporperty may be overridden
            playerX: 900,
            playerY: 1300
        };
    };
    this.resetInitialValues();
};

FTRPG.State.Afterfall.prototype = {
    movement: FTRPG.Util.Movement,
    ingameMenu: null,
    dialogue: null,
    music: null,
    enemyCount: 8,
    //"weighted" array of direction changes, "" => idle, the numbers are relative angles based on current orientation
    enemyMoveChances: ["", "", "", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, 90, 180, 270, 270],
    //spawn spots for enemies to avoid the reposition hack
    enemySpawnSpots: [[239, 1222], [60, 300], [360, 330], [740, 666], [1111, 527], [1400, 700], [1300, 1000], [960, 920], [900, 900], [400, 200]],
    wall: {
        edgeLength: 85,
        width: 17 * 85,
        height: 17 * 85,
        southGateXOffset: 10 * 85,
        topLeftX: 0,
        topLeftY: 200
    },
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
        enemySprites: [],
        decoration: [],
        dungeon: null
    },
    decoPositions: {
        'deco_barrel': [],
        'deco_dungeon_outside': [[1200, 100]],
        'deco_ruins': [[500, 100]],
        'deco_tree': [[300, 450], [700, 100], [150, 900]]

    },
    decoPositionsNoCollide: {
        'deco_bush': [[100, 800]],
        'deco_plant': [[1200, 400]]
    },
    decoHitboxes: {
        'deco_ruins': [540, 530, 12, 12],
        'deco_tree': [30, 90, 80, 70]
    },
    controller: null,
    initialValues: {},

    /**
     * controller must have following functions:
     * #onEncounterEnemy
     */
    init: function (afterfallController, initialvalues) {
        this.controller = afterfallController;
        if (initialvalues) {
            _.forEach(Object.getOwnPropertyNames(initialvalues), function (key) {
                if (initialvalues[key] !== undefined) {
                    this.initialValues[key] = initialvalues[key];
                }
            }, this)
        } else {
            this.resetInitialValues();
        }
        this.ingameMenu = new FTRPG.State.IngameMenu(this.game, this.controller.player);
    },

    create: function () {
        console.log('Afterfall#create');
        var worldCnstns = FTRPG.Constants.Afterfall.world;
        this.game.world.setBounds(0, 0, worldCnstns.width - 100, worldCnstns.height);
        this.createTiledScrollingBG(this.wall, worldCnstns);

        this.createDecoration();
        this.createCharacters();
        this.createCamera();
        this.cursors = this.game.input.keyboard.createCursorKeys();
        // Info Bar on top of everything (HUD)
        this.createInfoBars();
        this.createMusic();
        this.createSounds();
        this.ingameMenu.create();
    },

    createTiledScrollingBG: function (wall, world) {
        this.sprites.land = this.game.add.tileSprite(-250, -200, 3000, 3000, 'txr_landscape');
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
        var edge = this.wall.edgeLength;
        var wall = this.wall;
        // var n = this.createWall(wall.topLeftX + edge, wall.topLeftY, wall.width - (2 * edge), edge, 4);
        var s = this.createWall(wall.topLeftX + edge, wall.topLeftY + wall.height - 2 * edge, wall.width - (2 * edge), edge, 7);
        // var w = this.createWall(wall.topLeftX, wall.topLeftY + edge, edge, wall.height - (2 * edge), 3);
        // var e = this.createWall(wall.topLeftX + wall.width - edge, wall.topLeftY + edge, edge, wall.height - (2 * edge), 5);
        var south_gate = this.game.add.sprite(wall.topLeftX + wall.southGateXOffset, wall.topLeftY - 25 + wall.height - 2 * edge, 'gate');
        this.game.physics.enable(south_gate, Phaser.Physics.ARCADE);
        south_gate.body.immovable = true;
        south_gate.anchor.setTo(0.5, 0.25);

        // var nw = this.createWall(wall.topLeftX, wall.topLeftY, edge, edge, 0); // nw
        // var ne = this.createWall(wall.topLeftX + wall.width - edge, wall.topLeftY, edge, edge, 2); // ne
        var sw = this.createWall(wall.topLeftX, wall.topLeftY + wall.height - 2 * edge, edge, edge, 0); // sw
        var se = this.createWall(wall.topLeftX + wall.width - edge, wall.topLeftY + wall.height - 2 * edge, edge, edge, 2); // se
        this.sprites.wall = [s, se, sw];
        this.sprites.gate = south_gate;

    },

    createWall: function (x, y, width, height, frame) {
        var sprite = this.game.add.tileSprite(x, y, width, height, 'spr_wall', frame);
        this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
        sprite.body.immovable = true;
        return sprite;
    },


    createMusic: function () {
        console.log("createAudio");
        this.music = this.game.add.audio('snd_afterfall', 1, true);
        this.music.play();
    },
    createSounds: function () {
        this.sounds.walk = this.game.add.audio('snd_walk_city_01');
    },


    render: function () {
    },


    createCharacters: function () {
        this.enemies = this.controller.getRandomEnemies(this.enemyCount);
        var enemySpriteNames = _.map(this.enemies, function (enemy) {
            return enemy.images[1];
        });
        var add = this.game.add;
        var sprites = this.sprites;

        sprites.player = add.sprite(this.initialValues.playerX, this.initialValues.playerY, 'spr_player', 37);
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

        var rnd = this.game.rnd;

        for (var i = 0; i < this.enemyCount; i++) {
            var pos = mv = Phaser.ArrayUtils.getRandomItem(this.enemySpawnSpots);
            while (Phaser.Math.distance(pos[0], pos[1], this.sprites.player.x, this.sprites.player.y) < 450) {
                // this will prevent that enemies spawn next to the player and the next battle begins immediately
                pos = mv = Phaser.ArrayUtils.getRandomItem(this.enemySpawnSpots);
            }
            var wichSprite = rnd.between(0, enemySpriteNames.length - 1);
            var enemy = this.game.add.sprite(pos[0], pos[1], enemySpriteNames[wichSprite]);
            enemy.model = this.enemies[wichSprite];
            this.enemies[wichSprite].sprite = enemy;
            this.game.physics.enable(enemy, Phaser.Physics.ARCADE);

            enemy.body.drag.set(0.2);
            enemy.body.maxVelocity.setTo(400, 400);
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
        this.updateEnemies(true);
    },

    createDecoration: function () {
        _.forEach(Object.getOwnPropertyNames(this.decoPositions), function (decoName) {
            var positions = this.decoPositions[decoName];
            _.forEach(positions, function (pos) {
                if (this.decoHitboxes[decoName] != undefined) {
                    this.createDecorationItem(pos[0], pos[1], decoName, false, this.decoHitboxes[decoName]);
                }
                else {
                    this.createDecorationItem(pos[0], pos[1], decoName);
                }
            }, this);
        }, this);
        _.forEach(Object.getOwnPropertyNames(this.decoPositionsNoCollide), function (decoName) {
            var positions = this.decoPositionsNoCollide[decoName];
            _.forEach(positions, function (pos) {
                this.createDecorationItem(pos[0], pos[1], decoName, true);
            }, this);
        }, this);
    },

    createDecorationItem: function (x, y, imageKey, collisionsDisabled, hitboxdata) {
        var item = this.game.add.sprite(x, y, imageKey);
        if (collisionsDisabled) {
            item.skipCollide = true;
        }
        this.game.physics.enable(item, Phaser.Physics.ARCADE);
        if (hitboxdata) {
            item.body.setSize(hitboxdata[0], hitboxdata[1], hitboxdata[2], hitboxdata[3]);
        }
        item.body.immovable = true;
        item.disabled = true;
        this.sprites.decoration.push(item);
    },

    createCamera: function () {
        // Now center the camera and create the borders from which are scrolled
        this.game.camera.follow(this.sprites.player);
        this.camX = FTRPG.Constants.Afterfall.deadZoneOffsetX;
        this.camY = FTRPG.Constants.Afterfall.deadZoneOffsetY;
        // params: x, y, width, height
        this.game.camera.deadzone = new Phaser.Rectangle(
            this.camX, this.camY,
            this.game.width - this.camX * 2, this.game.height - this.camY * 2);
        this.game.camera.bounds = new Phaser.Rectangle(0, 0, this.world.width, this.world.height + 100);
    },

    checkCollisions: function (obj, processCB) {
        var physics = this.game.physics.arcade;
        var spr = this.sprites;
        var objectsThatCollide = [] // add objects that collide into this array
            .concat(spr.wall)
            .concat(spr.decoration);
        _.forEach(objectsThatCollide, function (wall) {
            if (!wall.skipCollide) {
                physics.collide(obj, wall, null, processCB, this);
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
        // Check for Collisions
        this.checkCollisions(this.sprites.player);
        this.checkCollisionsAgainstEnemies(this.sprites.player);
        this.updateEnemies(false);
        if (this.dialogue == null) {
            this.updateControls();
        } else {
            this.dialogue.updateDialogue();
        }
        if (this.checkOverlap(this.sprites.player, this.sprites.gate)) {
        	this.sprites.player.y -= 8;/*prevent instant return*/
            this.controller.onEnterGate(0, this.sprites.player.x, this.sprites.player.y);
        }
        var distDungeon = Phaser.Math.distance(this.sprites.player.x, this.sprites.player.y, 1350, 450);
        if (distDungeon < FTRPG.Constants.walkThroughGateDistance) {
            this.controller.onEnterGate(1, this.sprites.player.x, this.sprites.player.y + 100/*prevent instant return*/);
        }

        var infoBarTexts = this.controller.getInfoBarTexts();
        this.sprites.infobar1.setText(infoBarTexts[0]);
        this.sprites.infobar2.setText(infoBarTexts[1]);
        this.sprites.infobar3.setText(infoBarTexts[2]);
        if (this.ingameMenu.isShown) {
            this.ingameMenu.update();
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
        if (dist < FTRPG.Constants.enemyFollowsPlayerDistance && !isClose) {
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

                this.controller.onEncounterEnemy(enemy.model, this.sprites.player.x, this.sprites.player.y);
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

    checkOverlap: function (spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();
        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    shutdown: function () {
        console.log("Afterfall#shutdown");
        this.controller.setLastPosition(this.sprites.player.x, this.sprites.player.y);
        FTRPG.Ctrl.LocalStorageController.storeGameData(this.controller.context, 'Afterfall');
        this.resetInitialValues();
        this.sprites.enemySprites = [];
        this.sprites.decoration = [];
        this.music.stop();
    }
}
;
