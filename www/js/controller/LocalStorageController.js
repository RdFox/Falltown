FTRPG.Ctrl.LocalStorageController = {/*function () {
    this.gameDataKey = FTRPG.Constants.Storage.gameDataKey;

    // TODO the following is only for proving that localStorage is working and can be removed
    window.addEventListener("beforeunload",function() {
        //window.localStorage.setItem(FTRPG.Constants.Storage.gameDataKey, '{"player":{"money":23,"hp":73,"name":"Brian"}}');
    });
};

FTRPG.Ctrl.LocalStorageController.prototype = {*/
    readGameData: function () {
        console.log('LocalStorageControlller#readGameData');
        var gameDataKey = FTRPG.Constants.Storage.gameDataKey;
        var storedStuff = window.localStorage.getItem(gameDataKey);
        if (!storedStuff) {
            return {};
        }
        try {
            return JSON.parse(storedStuff);
        } catch (e) {
            console.error('Could not parse gameData from localStorage.', storedStuff);
            console.log(e);
            return  {};
        }
    },

    storeGameData: function (controller, place) {
        var gameDataKey = FTRPG.Constants.Storage.gameDataKey;
        var save = {
            player: {},
            place: '',
            falltown: {},
            afterfall: {},
            dungeon: {}
        };
        save.player.weapons = this.getNames(controller.player.weapons);
        save.player.armours = this.getNames(controller.player.armours);
        save.player.munitions = this.getNames(controller.player.munitions);
        save.player.foods = this.getNames(controller.player.foods);
        save.player.currentWeapon = controller.player.currentWeapon.name;
        save.player.currentArmour = controller.player.currentArmour.name;
        save.player.money = controller.player.money;
        save.player.hp = controller.player.hp;
        save.player.skillLevel = controller.player.skillLevel;
        save.player.lastPosition = controller.player.lastPosition;
        save.player.skillDistribution = controller.player.skillDistribution;

        save.place = place;
        
        save.falltown.tutorialDone = controller.falltownController.tutorialDone;
        save.falltown.dungeonOpened = controller.falltownController.dungeonOpened;

        save.dungeon.numberOfGatesOpened = controller.dungeonController.numberOfGatesOpened;

        console.log(JSON.stringify(save));
        window.localStorage.setItem(gameDataKey, JSON.stringify(save));
    },
    
    getNames: function(items){
    	result = [];
    	for(i = 0; i < items.length; i++){
    		result.push(items[i].name);
    	}
    	return result;
    },

    destroyExistingGameData: function(){
        window.localStorage.removeItem(gameDataKey);
    }
};