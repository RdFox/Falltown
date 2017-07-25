FTRPG.Ctrl.GameSetupController = function (game) {
    this.game = game;
};

FTRPG.Ctrl.GameSetupController.prototype = {
    player: null,
    gameController: null,
    place: null,
    initialValues:null,

    initFromScratch: function () {
        this.player = new FTRPG.Model.Player(FTRPG.Constants.initialHP,FTRPG.Constants.initialMoney);
        this.gameController = new FTRPG.Ctrl.GameController();
        this.setupController();
    },


    initFromStorage: function () {
        var storage = FTRPG.Ctrl.LocalStorageController.readGameData();
        var plr = storage.player;
        
        this.player = this.restorePlayer(storage.player);
        this.place = storage.place;
        

        if(this.place === 'Falltown'){
            this.initialValues = {
                    playerX: this.player.lastPosition.falltown[0],
                    playerY: this.player.lastPosition.falltown[1]
            };
        } else if(this.place === 'Afterfall'){
        	this.initialValues = {
                    playerX: this.player.lastPosition.afterfall[0],
                    playerY: this.player.lastPosition.afterfall[1]
            };
        } else if(this.place === 'Dungeon'){
        	this.initialValues = {
                    playerX: this.player.lastPosition.dungeon[0],
                    playerY: this.player.lastPosition.dungeon[1]
            };
        }
        
        this.gameController = new FTRPG.Ctrl.GameController();
        this.setupController();
        // look if storage is exhaustive
        //this.setupController();
        //this.gameController.tutorialDone = localstorage....(...);
    },
    
    restorePlayer: function(player){
        var weapons = this.generate(player.weapons,[FTRPG.Constants.weapons]);
        var armours = this.generate(player.armours,[FTRPG.Constants.armours]);
        var munitions = this.generate(player.munitions,[FTRPG.Constants.munitions]);
        var foods = this.generate(player.foods,[FTRPG.Constants.foods]);
        var currentWeapon = this.getByName(player.currentWeapon,[FTRPG.Constants.weapons,FTRPG.Constants.munitions]);
        var currentArmour = this.getByName(player.currentArmour,[FTRPG.Constants.armours]);
        console.log(player.lastPosition);
        return new FTRPG.Model.Player(player.hp, player.money, weapons,armours,munitions, foods, currentWeapon, currentArmour, player.skillLevel, player.lastPosition, player.skillDistribution);
    },

    generate: function(item,instance){
    	var result = [];
    	for(i=0; i < item.length; i++){
    		result.push(this.getByName(item[i] ,instance));
    	}
        return result;
    },    
    getByName: function(name, instance){
    	for(k=0; k < instance.length; k++){
    		inst=instance[k];
	    	for(j=0; j < inst.length; j++){
	    		if(inst[j].name===name)
	    			return inst[j];
	    	}
    	}
        return null;
    },

    setupController: function (place) {
        this.gameController.setup(this.game, this, this.player);
        this.gameController.startGame(this.game,this.place, this.initialValues);
    }
};