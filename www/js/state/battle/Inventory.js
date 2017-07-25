/**
 * Note: BattleInventory is not a Phaser State but a helper for Battle.js
 * BattleInventory handles rendering and input the in-battle-inventory
 * @param game Phaser.Game
 * @param battleController the controller must provide some cb functions (defined in Battle.js)
 * @constructor
 */
FTRPG.State.Battle.Inventory = function (game, battleController) {
    this.game = game;
    this.battleController = battleController;
};

FTRPG.State.Battle.Inventory.prototype = {
    game: null,
    battleController: null,
    currentPage: [0, 0, 0], // 3 values: first for weapons, second for armours, 3rd for foods
    defaultText: 'Wähle ein Item für mehr Infos',
    isShown: false,
    sprites: {
        fixedSpritesGroup: null,
        dynamicSpritesgroup: null,
        textPlayerBigStatus: null,
        arrowButtons: [],
        items: [],
        descriptionText: null,
        applyButton: null,
        backButton: null,
        bg: null
    },

    applyFood: function () {
        var selectedFoodItem = _.chain(this.sprites.items)
            .filter(function (item) {
                return item.product instanceof FTRPG.Model.Food && item.isSelected();
            })
            .first()
            .value();
        if (!selectedFoodItem || !selectedFoodItem.product) {
            throw new FTRPG.Model.Exception('Could not apply food!');
        }
        this.battleController.onApplyFood(selectedFoodItem.product);
        this.reloadItems();
    },

    create: function () {
        var spr = this.sprites;
        spr.bg = this.game.add.image(0, 0, 'ui_bg_inventory');
        spr.bg.inputEnabled = true;
        spr.backButton = new FTRPG.Comp.TextButton(this.game, 731, 432, 'spr_button', this.hide, this, 1, 0, 2, 'Fertig');
        spr.applyButton = new FTRPG.Comp.TextButton(this.game, 731, 351, 'spr_button', this.applyFood, this, 1, 0, 2, 'Jetzt einsetzen');
        // spr.backButton.setScaleX(0.9);
        // spr.applyButton.setScaleX(0.9);
        spr.applyButton.button.visible = false;
        spr.applyButton.setTextStyle(FTRPG.StyleFactory.generate.smallStrokedText(0));
        spr.descriptionText = this.game.add.text(411, 281, this.defaultText, FTRPG.StyleFactory.generate.smallText(285, 'left', 'black'));
        var style = FTRPG.StyleFactory.generate.smallText(0,'left','black');
        spr.textPlayerBigStatus = this.game.add.text(this.game.width / 2.0, 12, '', style);
        spr.textPlayerBigStatus.anchor.setTo(0.5);
        spr.fixedSpritesGroup = this.game.add.group();
        spr.fixedSpritesGroup.addMultiple([spr.bg, spr.backButton.button, spr.applyButton.button, spr.descriptionText, spr.textPlayerBigStatus]);
        spr.fixedSpritesGroup.visible = false;
    },


    createItems: function (baseX, baseY, rowCount, colCount, spacingX, spacingY, products, whichScroller) {
        var maxItemsPerPage = colCount * rowCount;
        var page = this.currentPage[whichScroller];
        if (page > 0 && products.length - 1 <= this.firstItemIdx(page - 1, maxItemsPerPage) + maxItemsPerPage - (page > 1 ? 2 : 1)) {
            this.currentPage[whichScroller]--; // if all products fit on previous page, we do not need current, higher page
            page = this.currentPage[whichScroller];
        }
        var showLeftButton = products.length > maxItemsPerPage && page > 0;
        // calc the index of the first visible product on the current page (0 => 0, 1 => maxItemsPerPage -1, ...)
        var currProdIdx = this.firstItemIdx(page, maxItemsPerPage);
        for (var row = 0; row < rowCount; row++) {
            for (var col = 0; col < colCount && currProdIdx < products.length; col++) {
                var x = 25 + baseX + (col * (100 + spacingX));
                var y = 25 + baseY + (row * (100 + spacingY));
                if (row === 0 && col === 0 && showLeftButton) {
                    this.createArrowButton(x, y, true, whichScroller);
                } else if (row === rowCount - 1 && col === colCount - 1 && currProdIdx !== products.length - 1) {
                    this.createArrowButton(x, y, false, whichScroller);
                } else {
                    this.createItem(x, y, products[currProdIdx]);
                    currProdIdx++;
                }
            }
        }
    },

    // if we are on page x we normally show products[n] until products[n+maxItemsperpage].
    // this funciton calculates n based on x.
    firstItemIdx: function (page, maxItemsPerPage) {
        return page === 0 ? 0 : (maxItemsPerPage - 1) + (page - 1) * (maxItemsPerPage - 2);
    },

    createArrowButton: function (x, y, isLeftBtn, whichScroller) {
        var cb = function () {
            this.currentPage[whichScroller] += isLeftBtn ? -1 : 1;
            this.reloadItems();
        };
        var btn = this.game.add.button(x, y, isLeftBtn ? 'spr_arrow_left' : 'spr_arrow_right', cb, this, 1, 0, 2);
        this.sprites.arrowButtons.push(btn);
    },

    createItem: function (x, y, product) {
        var item = new FTRPG.Comp.StoreItem(this.game, x, y, this.onClickItem, this, product);
        item.setDescription(this.battleController.getProductDescription(product, this.battleController.player));
        item.setPriceTagText(this.battleController.getPriceTagText(product, this.battleController.player));
        this.sprites.items.push(item);
        return item;
    },

    reloadItems: function () {
        var prevSelectedProducts = _.chain(this.sprites.items)
            .filter(function (item) {
                return item.isSelected();
            })
            .map(function (item) {
                return item.product;
            })
            .value();
        if (this.sprites.dynamicSpritesgroup) {
            this.sprites.dynamicSpritesgroup.removeAll(true);
        }
        prevSelectedProducts.push(this.battleController.getCurrentWeapon());
        prevSelectedProducts.push(this.battleController.getCurrentArmour());
        this.sprites.items = [];
        this.sprites.applyButton.button.visible = false;
        this.sprites.arrowButtons = [];
        this.sprites.descriptionText.text = this.defaultText;
        var spacingX = 10;
        var productsPerCategory = this.battleController.getPlayersInventory();
        this.createItems(20, 5, 1, 8, spacingX, 0, productsPerCategory[0], 0);
        this.createItems(20, 125, 1, 8, spacingX, 0, productsPerCategory[1], 1);
        this.createItems(15, 250, 2, 3, spacingX, spacingX, productsPerCategory[2], 2);
        if (prevSelectedProducts.length > 0) {
            _.forEach(this.sprites.items, function (item) {
                // check if previousely selected products are still shown on the page, but don't reselect food.
                if (_.contains(prevSelectedProducts, item.product) && !(item.product instanceof FTRPG.Model.Food)) {
                    item.setSelected(true);
                }
            }, this);
        }

        var spr = this.sprites;
        spr.dynamicSpritesgroup = this.game.add.group();
        // after defining items in reload process: add all items to group
        spr.dynamicSpritesgroup.addMultiple(spr.arrowButtons);
        spr.dynamicSpritesgroup.addMultiple(_.map(spr.items, function (item) {
            return item.graphicsGroup
        }, this));
    },

    onClickItem: function (clickedItem) {
        var clickedProdCons = clickedItem.product.constructor;
        _.chain(this.sprites.items)
            .filter(function (item) {
                return item.product.constructor === clickedProdCons
                    || item.product instanceof FTRPG.Model.Food
                    || item.product instanceof FTRPG.Model.Munition && clickedProdCons === FTRPG.Model.Weapon
                    || item.product instanceof FTRPG.Model.Weapon && clickedProdCons === FTRPG.Model.Munition
            })
            .forEach(function (item) {
                item.setSelected(false);
            });
        clickedItem.setSelected(true);
        this.sprites.descriptionText.text = clickedItem.getDescription();

        switch (clickedItem.product.constructor) {
            case FTRPG.Model.Munition:
                this.battleController.onApplyMunition(clickedItem.product);
                break;
            case FTRPG.Model.Weapon:
                this.battleController.onApplyWeapon(clickedItem.product);
                break;
            case FTRPG.Model.Armour:
                this.battleController.onApplyArmour(clickedItem.product);
                break;
            case FTRPG.Model.Food:
                if(this.battleController.canApplyThisFood(clickedItem.product.impact)){
                    this.sprites.applyButton.text.text = 'Jetzt einsetzen';
                } else{
                    this.sprites.applyButton.text.text = 'ähnliche Wirkung\nbereits aktiv';
                }
                break;
        }
        var isFood = clickedItem.product instanceof FTRPG.Model.Food;
        this.sprites.applyButton.setDisabled(!this.battleController.canApplyThisFood(clickedItem.product.impact));
        this.sprites.applyButton.button.visible = isFood;
    },


    show: function () {
        this.isShown = true;
        this.sprites.fixedSpritesGroup.visible = true;
        this.reloadItems();
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup, this.sprites.dynamicSpritesgroup]);
        grp.y = -640;
        this.game.add.tween(grp)
            .to({
                x: 0,
                y: 0
            }, 1000, Phaser.Easing.Cubic.Out, true);
    },

    hide: function () {
        console.log('Inventory#hide');
        this.isShown = false;
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup, this.sprites.dynamicSpritesgroup]);
        this.game.add.tween(grp).to({
            x: 0,
            y: -640
        }, 500, Phaser.Easing.Quadratic.In, true);
    },


    update: function () {
        this.sprites.textPlayerBigStatus.text = this.battleController.getBigPlayerStatusText();
    }
};
