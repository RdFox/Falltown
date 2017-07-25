/**
 * Note: IngameMenu is not a Phaser State
 * IngameMenu is the Menu in the Game. e.g. in Falltown
 * @param game Phaser.Game
 * @constructor
 */
FTRPG.State.IngameMenu.IngameInventory = function (game, player) {
    this.game = game;
    this.player = player;
};


FTRPG.State.IngameMenu.IngameInventory.prototype = {
    game: null,
    isShown: false,
    currentPage: [0, 0, 0], // 3 values: first for weapons, second for armours, 3rd for foods
    defaultText: 'Wähle ein Item für mehr Infos',
    sprites: {
        fixedSpritesGroup: null,
        dynamicSpritesgroup: null,
        textPlayerBigStatus: null,
        arrowButtons: [],
        items: [],
        descriptionText: null,
        applyButton: null,
        backButton: null,
        bg: null,
    },

    create: function () {
        console.log("LoadButtons#Create");
        var x = this.game.width/2;
        var y = this.game.height/2;
        
        this.createBackground(x,y);
        this.createButtons(x,y);
        this.createText(x,y);
		        
        this.sprites.fixedSpritesGroup = this.game.add.group();
        this.sprites.fixedSpritesGroup.addMultiple([this.sprites.bg,this.sprites.backButton.button,this.sprites.applyButton.button,this.sprites.descriptionText,this.sprites.textPlayerBigStatus]);
        this.sprites.fixedSpritesGroup.visible = false;
    },
    createBackground: function (x,y){
        this.sprites.bg = this.game.add.image(x, y-6, 'ui_border_ingameinventory');
        this.sprites.bg.anchor.set(0.5);
        this.sprites.bg.inputEnabled = true;
	},
    createButtons: function (x,y) {
		this.sprites.backButton  = this.createButton(0, 0, 'Fertig', this.hide);
		this.sprites.backButton.setPosition(x - this.sprites.backButton.getWidth() / 2 + 315,y - this.sprites.backButton.getHeight() / 2 + 125);
		this.sprites.backButton.setScaleX(0.89);
		
		this.sprites.applyButton  = this.createButton(0, 0, 'Jetzt einsetzen', this.applyFood);
		this.sprites.applyButton.setPosition(x - this.sprites.applyButton.getWidth() / 2 + 315,y - this.sprites.applyButton.getHeight() / 2 + 50);
		this.sprites.applyButton.setScaleX(0.89);
		this.sprites.applyButton.button.visible = false;
        this.sprites.applyButton.setTextStyle(FTRPG.StyleFactory.generate.smallStrokedText(0));
    },
    createText: function (x,y){
        this.sprites.descriptionText = this.game.add.text(x-45, y+10, this.defaultText, FTRPG.StyleFactory.generate.smallText(295, 'left', 'black'));
        var style = FTRPG.StyleFactory.generate.smallText(0,'left','black');
        this.sprites.textPlayerBigStatus = this.game.add.text(x, y-224, '', style);
        this.sprites.textPlayerBigStatus.anchor.setTo(0.5);
	},
    
    createButton: function (x, y, text, callback, id) {
        return new FTRPG.Comp.TextButton(this.game, x, y, 'spr_button', callback, this, 1, 0, 2, text, id);
    },
    applyFood: function () {
        var selectedFoodItem = _.chain(this.sprites.items)
            .filter(function (item) {
                return item.product instanceof FTRPG.Model.Food && item.isSelected() && item.product.eatable;
            })
            .first()
            .value();
        if (!selectedFoodItem || !selectedFoodItem.product) {
            throw new FTRPG.Model.Exception('Could not apply food!');
        }
        this.eat(selectedFoodItem.product);
    },
    eat(food){
        this.player.removeItem(this.player.foods, food);
        this.player.hp = Math.min(this.player.getMaxHP(), this.player.hp + food.impactValue); // apply instantly
        this.reloadItems();
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
        prevSelectedProducts.push(this.player.currentWeapon);
        prevSelectedProducts.push(this.player.currentArmour);
        this.sprites.items = [];
        this.sprites.applyButton.button.visible = false;
        this.sprites.arrowButtons = [];
        this.sprites.descriptionText.text = this.defaultText;
        var spacingX = 10;
        var productsPerCategory = this.player.getInventory();
        this.createItems(72, 32, 1, 7, spacingX, 0, productsPerCategory[0], 0);
        this.createItems(72, 145, 1, 7, spacingX, 0, productsPerCategory[1], 1);
        this.createItems(72, 250, 2, 3, spacingX, spacingX, productsPerCategory[2], 2);
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
        spr.dynamicSpritesgroup.fixedToCamera = true;
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
        item.setDescription(FTRPG.Util.ProductHelper.getProductDescription(product, this.player));
        item.setPriceTagText(FTRPG.Util.ProductHelper.getPriceTagText(product, this.player));
        this.sprites.items.push(item);
        return item;
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
                this.player.currentWeapon=clickedItem.product;
                break;
            case FTRPG.Model.Weapon:
                this.player.currentWeapon=clickedItem.product;
                break;
            case FTRPG.Model.Armour:
                this.player.currentArmour=clickedItem.product;
                break;
            case FTRPG.Model.Food:
                break;
        }
        this.sprites.applyButton.button.visible = clickedItem.product.eatable;
    },
    
    show: function () {
        this.isShown = true;
        this.sprites.fixedSpritesGroup.visible = true;
        this.reloadItems();
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup, this.sprites.dynamicSpritesgroup]);
        this.sprites.dynamicSpritesgroup.fixedToCamera = false;
        grp.fixedToCamera = true;
        grp.visible = true;
        this.game.add.tween(grp)
            .to({
                alpha: 1
            }, 1000, Phaser.Easing.Cubic.In, true);
    },

    hide: function () {
        this.isShown = false;
        var grp = this.game.add.group();
        grp.addMultiple([this.sprites.fixedSpritesGroup, this.sprites.dynamicSpritesgroup]);
        this.sprites.dynamicSpritesgroup.fixedToCamera = false;
        grp.fixedToCamera = true;
        var tween = this.game.add.tween(grp).to({
            alpha: 0
        }, 100, Phaser.Easing.Quadratic.Out, true);
        tween.onComplete.add(function () {
            grp.visible=false;
        }, this);
    },

    update: function () {
        this.sprites.textPlayerBigStatus.text = 'Gesundheitszustand: ' + this.player.hp + ' HP';
    }
};
