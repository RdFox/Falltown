/**
 * Shows the preloading bar while loading all the assets
 */
FTRPG.State.Preloader = function (game) {
    this.game = game;
};

FTRPG.State.Preloader.prototype = {
    sprites: {
        background: null,
        icon: null,
        text: null
    },
    ready: false,

    preload: function () {
        loadFont('Widelands');
        //	These are the assets we loaded in Boot.js
        this.sprites.background = this.add.sprite(0, 0, 'preloaderBackground');
        this.sprites.icon = this.add.sprite(this.game.width / 2 - 256, this.game.height / 2 - 256, 'preloaderIcon');
        this.sprites.text = this.add.sprite(this.game.width / 2 - 256, this.game.height / 2 - 256, 'preloaderText');
        this.load.setPreloadSprite(this.sprites.text);

        //@formatter:off

        // IMAGES
        this.loadImages('assets/ui/', {
            // MainMenu
            'menu/gametitle.png'        :'ui_gametitle',
            'weaponstore_itembound.png' :'ui_store_item_select',
            'infobar.png'               :'ui_infobar',
            'portrait_border.png'       :'ui_portait_border',
            'bg_store.png'              :'ui_bg_store',
            'bg_inventory.png'          :'ui_bg_inventory',
            'bg_dialogue.png'           :'ui_bg_dialogue',
            'bg_confirmdialogue.png'    :'ui_bg_confirmdialogue',
            'border_confirmdialogue.png':'ui_border_confirmdialogue',
            'border_menu.png'			:'ui_border_menu',
            'border_credits.png'		:'ui_border_credits',
            'menu/credits.png'			:'ui_title_credits',
            'border_ingamemenu.png'	    :'ui_border_ingame',
            'border_ingameinventory.png':'ui_border_ingameinventory'
        });

        this.loadImages('assets/img/decoration/', {
            'barrel.png'        :'deco_barrel',
            'foodsign.png'      :'deco_foodsign',
            'bush.png'          :'deco_bush',
            'tree.png'          :'deco_tree',
            'sign.png'          :'deco_sign',
            'plant.png'          :'deco_plant',
            'ruins.png'          :'deco_ruins'
        });

        this.loadImages('assets/img/building/', {
            'weaponstore.png'      :'building_weaponstore',
			'foodstore.png'        :'building_foodstore',
			'house.png'            :'building_house'
         });

         this.loadImages('assets/img/weapon/', {
            'fist.png'              :'weapon_fist',
            'sword.png'             :'weapon_sword',
            'axe.png'               :'weapon_axe',
            'shield.png'            :'armour_shield',
            'leather.png'           :'armour_leather',
            'hairdresser.png'       :'armour_hairdresser',
            'armour_naked.png'      :'armour_naked',
            'powerarmour.png'       :'armour_power',
            'metalplates.png'       :'armour_metalplates',
            'shirt.png'             :'armour_shirt',
            'shuriken.png'          :'weapon_shuriken',
            'club.png'              :'weapon_club',
            'glove.png'             :'weapon_glove',
            'belt.png'              :'armour_belt',
            'arrow.png'             :'weapon_arrow',
            'bullet_gun.png'        :'weapon_bullet_gun',
            'butterknife.png'       :'weapon_butterknife',
            'bullet_rifle.png'      :'weapon_bullet_rifle',
            'rocket.png'            :'weapon_rocket',
            'pike.png'              :'weapon_pike',
            'stone.png'             :'weapon_stone'
        });

         this.loadImages('assets/img/character/', {
             'player_battle.png'    :'char_battle_player',
             'teacher_battle.png'   :'char_battle_teacher'
        });

        this.loadImages('assets/img/', {
            'white.png'                 :'bg_white',
            'red.png'                   :'bg_red',
            'green.png'                 :'bg_green',
            'speechbubble.png'          :'speechbubble',
            'texture/stone.png'         :'txr_stone',
            'texture/grass.png'         :'txr_grass',
            'texture/landscape.jpg'     :'txr_landscape',
            'texture/earth.png'         :'txr_earth',
            'texture/dungeon.png'       :'txr_dungeon',
            'gate.png'                  :'gate',
            'dungeon/outside.png'       :'deco_dungeon_outside'
        });


        this.loadImages('assets/img/food/', {
            'banana.png'           :'food_banana',
            'beer.png'             :'food_beer',
            'brandy.png'           :'food_brandy',
            'cocktail.png'         :'food_cocktail',
            'food-potato.png'      :'food_potato',
            'liqueur.png'          :'food_liqueur',
            'mask.png'             :'food_mask',
            'oil.png'              :'food_oil',
            'sand.png'             :'food_sand',
            'water.png'            :'food_water',
            'wine.png'             :'food_wine',
            'meat.png'             :'food_meat',
        });


        this.loadImages('assets/img/battle/', {
            'bg.png'             :'bg_battle',
            'bg_dungeon.png'     :'bg_battle_dungeon',
            'shadow.png'     	 :'battle_shadow'
        });

        // SPRITES
        this.preloadSprites();

        //AUDIO
        this.preloadAudio();

        // TEXT FILES
        this.game.load.text('conv_teacher', 'assets/conversations/player_teacher.xml');
        this.game.load.text('conv_weaponvendor', 'assets/conversations/player_weaponvendor.xml');
        this.game.load.text('conv_foodvendor', 'assets/conversations/player_foodvendor.xml');
        this.game.load.text('conv_dungeon0', 'assets/conversations/player_dungeon0.xml');
        this.game.load.text('conv_dungeon1', 'assets/conversations/player_dungeon1.xml');
        this.game.load.text('conv_dungeon2', 'assets/conversations/player_dungeon2.xml');
        this.game.load.text('conv_dungeon3', 'assets/conversations/player_dungeon3.xml');
        this.game.load.text('conv_dungeon4', 'assets/conversations/player_dungeon4.xml');
        this.game.load.text('conv_catlady', 'assets/conversations/player_catlady.xml');
        this.game.load.text('conv_villager', 'assets/conversations/player_villager.xml');

    },

    preloadSprites: function(){
        this.game.load.spritesheet('spr_player', 'assets/img/character/player.png', 48,48);
        this.game.load.spritesheet('spr_teacher', 'assets/img/character/teacher.png', 48,48);
        this.game.load.spritesheet('spr_fig1', 'assets/img/character/fig1.png', 48,48);
        this.game.load.spritesheet('spr_fig2', 'assets/img/character/fig2.png', 48,48);
        this.game.load.spritesheet('spr_fig3', 'assets/img/character/fig3.png', 48,48);
        this.game.load.spritesheet('spr_catlady', 'assets/img/character/catlady.png', 48,48);
        this.game.load.spritesheet('spr_fig4', 'assets/img/character/fig4.png', 48,48);
        this.game.load.spritesheet('spr_fig5', 'assets/img/character/fig5.png', 48,48);
        this.game.load.spritesheet('spr_fig6', 'assets/img/character/fig6.png', 48,48);
        this.game.load.spritesheet('spr_fig7', 'assets/img/character/fig7.png', 48,48);
        this.game.load.spritesheet('spr_catlady', 'assets/img/character/catlady.png', 48,48);
        this.game.load.spritesheet('spr_villager1', 'assets/img/character/villager_01.png', 32,32);
        this.game.load.spritesheet('spr_villager2', 'assets/img/character/villager_02.png', 32, 32);
        this.game.load.spritesheet('spr_button', 'assets/ui/button/button.png', 189, 67);
        this.game.load.spritesheet('spr_arrow_left', 'assets/ui/button/arrow_left.png', 100,100);
        this.game.load.spritesheet('spr_arrow_right', 'assets/ui/button/arrow_right.png', 100,100);
        this.game.load.spritesheet('spr_bg_store', 'assets/img/weaponstore_item_bg.png', 50,50);
        this.game.load.spritesheet('spr_wall', 'assets/img/wall.png', 85, 85);
        this.game.load.spritesheet('spr_wall_dungeon_big', 'assets/img/dungeon/dungeonwall.png', 96, 96);
        this.game.load.spritesheet('spr_wall_dungeon_small', 'assets/img/dungeon/dungeonwall.png', 48,96);

        this.loadSpriteSheets(144, 144, 'assets/img/character/portrait/', {
            'villager_01.png'           :'spr_ptr_villager1',
            'villager_02.png'           :'spr_ptr_villager2',
            'catlady.png'                 :'spr_ptr_catlady',
            'teacher.png'               :'spr_ptr_teacher',
            'foodvendor.png'            :'spr_ptr_foodvendor',
            'player.png'                :'spr_ptr_player',
            'weaponvendor.png'          :'spr_ptr_weaponVendor',
            'fig6.png'                  :'spr_ptr_fig6',
            'fig4.png'                  :'spr_ptr_fig4',
            'fig5.png'                  :'spr_ptr_fig5',
            'fig7.png'                  :'spr_ptr_fig7'
        });

        this.loadSpriteSheets(64, 64, 'assets/img/character/battle/', {
            'fig1.png'            :'spr_battle_fig1',
            'fig2.png'            :'spr_battle_fig2',
            'fig3.png'            :'spr_battle_fig3',
            'fig4.png'            :'spr_battle_fig4',
            'fig5.png'            :'spr_battle_fig5',
            'fig6.png'            :'spr_battle_fig6',
            'fig7.png'            :'spr_battle_fig7',
            'fig8.png'            :'spr_battle_fig8',
            'fig9.png'            :'spr_battle_fig9',
            'catlady.png'           :'spr_battle_catlady',
            'teacher.png'         :'spr_battle_teacher',
            'player.png'          :'spr_battle_player'
        });

        this.loadSpriteSheets(32,32, 'assets/img/character/', {
            'foodvendor.png'            :'spr_char_foodvendor',
            'weaponvendor.png'          :'spr_char_weaponvendor'
        });
    },

    preloadAudio: function(){
        // SOUND
        this.loadAudio('assets/audio/sound/', {
            // Battle
            'battle/hit_01'        :'snd_hit_01',
            'battle/hit_02'        :'snd_hit_02',
            'battle/hit_03'        :'snd_hit_03',
            'battle/got_hit_01'    :'snd_got_hit_01',
            'battle/got_hit_02'    :'snd_got_hit_02',
            'battle/got_hit_03'    :'snd_got_hit_03',
            //Walk
            'walk/running01'    :'snd_walk_city_01',
            //Katsching
            'katsching/katsching'        :'snd_katsching',
            'katsching/katsching_bottle' :'snd_katsching_bottle',
            'katsching/katsching_burp'   :'snd_katsching_burp',
            'katsching/katsching_eat'    :'snd_katsching_eat',
            'katsching/katsching_hit'    :'snd_katsching_hit',
            'katsching/katsching_zipper' :'snd_katsching_zipper'
        });

        // MUSIC
        this.loadAudio('assets/audio/music/', {
            // Battle
            'Battle'          :'snd_fight',
            'fight-lose' 	  :'snd_fight_lost',
            'I_am_the_Winner' :'snd_fight_won',
            // Falltown
            'InTheCity'		  :'snd_falltown',
            'Bunker'          :'snd_bunker',
            'Afterfall'       :'snd_afterfall',
            'FoodShop'        :'snd_foodshop',
            'WeaponShop'      :'snd_weaponshop'
        });
    },


//@formatter:on
    /**
     * load images from a specific directory
     * @param dir file base path
     * @param fileMapping object containing multiple key-value pairs where<br>
     *     <li>key = filename (optionally extending base dir) + file extension to the image file</li>
     *     <li>value = image name that can be used in phaser (known as phaser image key)</li>
     */
    loadImages: function (dir, fileMapping) {
        var props = Object.getOwnPropertyNames(fileMapping);
        console.log('loading ' + props.length + ' images from ' + dir);
        for (var i = 0; i < props.length; i++) {
            this.game.load.image(fileMapping[props[i]], dir + props[i]);
        }
    },

    loadSpriteSheets: function (frameWidth, frameHeight, dir, fileMapping) {
        var props = Object.getOwnPropertyNames(fileMapping);
        console.log('loading ' + props.length + ' tilesprites from ' + dir);
        for (var i = 0; i < props.length; i++) {
            this.game.load.spritesheet(fileMapping[props[i]], dir + props[i], frameWidth, frameHeight);
        }
    },


    /**
     * load audio files from a specific directory using automatic decoding. File extensiosn .mp3 and .ogg are being appended automatically and must not be given.
     * @param dir file base path
     * @param fileMapping object containing multiple key-value pairs where<br>
     *     <li>key = filename (optionally extending base dir) to the audio file WITHOUT file extension</li>
     *     <li>value = name that can be used in phaser (known as phaser audio key)</li>
     */
    loadAudio: function (dir, fileMapping) {
        var props = Object.getOwnPropertyNames(fileMapping);
        console.log('loading ' + props.length + ' audio diles from ' + dir);
        for (var i = 0; i < props.length; i++) {
            var fileName = props[i];
            this.game.load.audio(fileMapping[fileName], [(dir + fileName + '.mp3'), (dir + fileName + '.ogg')], true);
        }
    },

    create: function () {
        console.log('Preloader#create');
        this.sprites.text.cropEnabled = false;
    },

    update: function () {
        this.ready = true;
        this.game.state.start('MainMenu');
    }
}
;
