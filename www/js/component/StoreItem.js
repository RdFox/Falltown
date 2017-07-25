FTRPG.Comp.StoreItem = function (game, x, y, callback, callbackContext, product) {
    var self = this;
    var callCallBack = function () {
        callback.call(callbackContext, self);
    };
    var priceTagStyle = {font: '10pt Widelands', fill: 'black', wordWrap: false};
    this.product = product;
    this.button = game.add.button(x, y, 'spr_bg_store', callCallBack, callbackContext, 1, 0, 2);
    this.button.scale.setTo(2, 2);
    this.image = game.add.image(x, y, product.images[0]);
    this.priceTag = game.add.text(x + 95, y + 103, '', priceTagStyle);
    this.priceTag.anchor.setTo(1, 1);
    this.selectionBoundImage = game.add.image(x - 5, y - 5, 'ui_store_item_select');
    this.selectionBoundImage.scale.setTo(2, 2);
    this.selectionBoundImage.visible = false;

    this.graphicsGroup = game.add.group();
    this.graphicsGroup.addMultiple([this.button, this.image, this.priceTag, this.selectionBoundImage]);
    return self;
};

FTRPG.Comp.StoreItem.prototype = {
    product: null,
    description: null,
    button: null,
    image: null,
    priceTag: null,
    selectionBoundImage: null,
    graphicsGroup: null,
    descriptor: function (item) {
        return "";
    },

    destroyGraphics: function () {
        this.graphicsGroup.destroy();
    },

    setSelected: function (selected) {
        this.selectionBoundImage.visible = selected;
    },

    isSelected: function () {
        return this.selectionBoundImage.visible;
    },

    getDescription: function () {
        return this.description;
    },
    setPriceTagText: function (text) {
        this.priceTag.text = text;
    },
    setDescription: function (description) {
        this.description = description;
    }
};
