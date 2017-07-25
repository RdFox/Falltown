FTRPG.Ctrl.FoodStoreController = function (game, player, onExit, context) {
    this.game = game;
    this.player = player;
    this.callOnExitCB = function () {
        onExit.call(context);
    };
};

FTRPG.Ctrl.FoodStoreController.prototype = {
    getVendorProductDescription: function (food) {
        var duration = food.impactDuration ? "Hält " + food.impactDuration + " Runden an\n" : 'Wird sofort eingesetzt\n';
        return food.name + "\n" +
            "Auswirkung:\n" +
            food.impact + food.impactValue + "\n" +
            duration +
            "Preis: " + food.price + " Finger";
    },

    getPlayerProductDescription: function (food) {
        var duration = food.impactDuration ? "Hält " + food.impactDuration + " Runden an\n" : 'Wird sofort eingesetzt\n';
        return food.name + "\n" +
            "Auswirkung:\n" +
            food.impact + food.impactValue + "\n" +
            duration +
            "Kann nicht verkauft werden."
    },

    getPlayerPriceTag: function (product) {
        return 'x' + this.player.howMuchOf(product);
    },

    getVendorPriceTag: function (product) {
        return product.price + " F";
    },

    getPlayerProducts: function () {
        return _.unique(this.player.foods);
    },

    getVendorProducts: function () {
        return FTRPG.Constants.foods;
    },

    onBuyProduct: function (product) {
        this.player.buyProduct(product);
    },

    playerProductsAreResalable: function () {
        return false;
    },

    onResellProduct: function (product) {
        throw new FTRPG.Model.Exception("cannot resell foods");
    },

    onExit: function () {
        this.callOnExitCB();
    },

    canAffordProduct: function (product) {
        return this.player.money >= product.price;
    },
    getMusic: function () {
        return 'snd_foodshop';
    }
};
