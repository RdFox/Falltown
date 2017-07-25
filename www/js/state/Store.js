/**
 * Displays the any store where the user can buy items
 */
FTRPG.State.Store = function (game) {
    this.game = game;
};

FTRPG.State.Store.prototype = {
    selectedItem: null,
    itemsForSale: [],
    playerItems: [],
    arrowButtons: [],
    currentPage: [0, 0],
    textLeft: null,
    textPlayerMoney: null,
    textRight: null,
    defaultText: 'Wähle ein Item für mehr Infos',
    music: null,
    sounds: {
        katsching: null,
        katsching_bottle: null,
        katsching_burp: null,
        katsching_eat: null,
        katsching_hit: null,
        katsching_zipper: null
    },
    sprites: {
        buyButton: null,
        sellButton: null,
        exitButton: null,
        bg: null
    },
    ctrl: null,
    run: false,

    init: function (weaponStoreController) {
        this.ctrl = weaponStoreController;
    },

    create: function () {
        console.log('Store#create');
        this.run = true;
        var style = FTRPG.StyleFactory.generate.smallText(270,'left','black');
        this.sprites.bg = this.game.add.image(0, 0, 'ui_bg_store');

        this.textLeft = this.game.add.text(35, this.game.height - 185, this.defaultText, style);
        this.textRight = this.game.add.text(this.game.width - 460, this.game.height - 185, this.defaultText, style);
        this.textPlayerMoney = this.game.add.text(this.game.width / 2.0, 15, '', style);
        this.textPlayerMoney.anchor.setTo(0.5);

        this.sprites.buyButton = this.createButton(320, this.game.height - 185, 'Kaufen', this.onClickBuy);
        this.sprites.sellButton = this.createButton(this.game.width - 177, this.game.height - 185, 'Verkaufen', this.onClickResell);
        this.sprites.exitButton = this.createButton(this.game.width - 177, this.game.height - 105, 'Fertig', this.onClickExit);
        this.sprites.sellButton.button.visible = this.ctrl.playerProductsAreResalable();

        this.reloadItems();
        this.createMusic();
        this.createSounds();
    },

    createButton: function (x, y, text, callback) {
        var btn = new FTRPG.Comp.TextButton(this.game, x, y, 'spr_button', callback, this, 1, 0, 2, text);
        btn.setScaleX(0.75);
        return btn;
    },

    createVendorItem: function (x, y, product) {
        var item = new FTRPG.Comp.StoreItem(this.game, x, y, this.onClickItem, this, product);
        item.setDescription(this.ctrl.getVendorProductDescription(product));
        item.setPriceTagText(this.ctrl.getVendorPriceTag(product));
        this.itemsForSale.push(item);
        return item;
    },

    createPlayerItem: function (x, y, product) {
        var item = new FTRPG.Comp.StoreItem(this.game, x, y, this.onClickPlayerItem, this, product);
        item.setDescription(this.ctrl.getPlayerProductDescription(product));
        item.setPriceTagText(this.ctrl.getPlayerPriceTag(product));
        this.playerItems.push(item);
        return item;
    },

    createArrowButton: function (x, y, isLeftBtn, whichScroller) {
        var cb = function () {
            this.currentPage[whichScroller] += isLeftBtn ? -1 : 1;
            this.reloadItems();
        };
        var btn = this.game.add.button(x, y, isLeftBtn ? 'spr_arrow_left' : 'spr_arrow_right', cb, this, 1, 0, 2);
        this.arrowButtons.push(btn);
    },

    createVendorItems: function () {
        this.createItems(0, 3, 4, this.ctrl.getVendorProducts.apply(this.ctrl), 0);
    },

    createPlayerItems: function () {
        this.createItems(this.game.width - 490, 3, 4, this.ctrl.getPlayerProducts.apply(this.ctrl), 1);
    },

    createItems: function (baseX, rowCount, colCount, products, whichScroller) {
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
                var x = baseX + (col * 100 + 25);
                var y = row * 100 + 25;
                if (row === 0 && col === 0 && showLeftButton) {
                    this.createArrowButton(x, y, true, whichScroller);
                } else if (row === rowCount - 1 && col === colCount - 1 && currProdIdx !== products.length - 1) {
                    this.createArrowButton(x, y, false, whichScroller);
                } else {
                    if (whichScroller === 1) {
                        this.createPlayerItem(x, y, products[currProdIdx])
                    } else {
                        this.createVendorItem(x, y, products[currProdIdx]);
                    }
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


    onClickItem: function (storeItem) {
        if (this.selectedItem) {
            this.selectedItem.setSelected(false);
        }
        this.selectedItem = storeItem;
        storeItem.setSelected(true);
        this.textLeft.text = storeItem.getDescription();
        this.textRight.text = this.defaultText;
        var isAffordable = this.ctrl.canAffordProduct(storeItem.product);
        this.sprites.buyButton.setDisabled(!isAffordable);
        this.sprites.buyButton.text.text = isAffordable ? 'Kaufen' : 'zu wenig\nFinger';
        this.sprites.buyButton.setTextStyle(isAffordable ? FTRPG.StyleFactory.generate.bigStrokedText(0) : FTRPG.StyleFactory.generate.smallStrokedText(0));
        this.sprites.sellButton.setDisabled(true);
    },

    onClickPlayerItem: function (playerItem) {
        if (this.selectedItem) {
            this.selectedItem.setSelected(false);
        }
        this.selectedItem = playerItem;
        playerItem.setSelected(true);
        this.textRight.text = playerItem.getDescription();
        this.textLeft.text = this.defaultText;
        this.sprites.sellButton.setDisabled(false);
        this.sprites.buyButton.setDisabled(true);
    },


    onClickBuy: function () {
        console.log('WeaponStore#onClickBuy');
        if (!this.selectedItem) {
            throw new FTRPG.Model.Exception('no item selected before clicked on buy');
        }
        this.playKatschingSound(this.selectedItem.product);
        this.ctrl.onBuyProduct(this.selectedItem.product);
        this.reloadItems();
    },

    onClickResell: function () {
        console.log('WeaponStore#onClickResell');
        if (!this.selectedItem) {
            throw new FTRPG.Model.Exception('no item selected before clicked on resell');
        }
        this.playKatschingSound(this.selectedItem.product);
        this.ctrl.onResellProduct(this.selectedItem.product);
        this.reloadItems();
    },

    playKatschingSound: function (product) {
        if (product instanceof FTRPG.Model.Armour) {
            this.sounds.katsching_zipper.play();
        } else if (product instanceof FTRPG.Model.Food && product.eatable) {
            this.sounds.katsching_eat.play();
        } else if (product instanceof FTRPG.Model.Munition) {
            this.sounds.katsching_hit.play();
        } else if (product instanceof FTRPG.Model.Weapon) {
            this.sounds.katsching_hit.play();
        } else {
            this.sounds.katsching.play();
        }
    },

    reloadItems: function () {
        _.forEach(this.itemsForSale.concat(this.playerItems), function (weaponItem) {
            weaponItem.destroyGraphics();
        }, this);
        _.forEach(this.arrowButtons, function (btn) {
            btn.destroy();
        }, this);
        this.itemsForSale = [];
        this.playerItems = [];
        this.arrowButtons = [];
        this.sprites.buyButton.setDisabled(true);
        this.sprites.sellButton.setDisabled(true);
        this.textLeft.text = this.defaultText;
        this.textRight.text = this.defaultText;
        this.createVendorItems();
        this.createPlayerItems();
        // if (this.selectedItem) {
        //     var selectedProduct = this.selectedItem.product;
        this.selectedItem = null;
        // this.selectProduct(selectedProduct);
        // }
    },

    createMusic: function () {
        console.log("createAudio");
        this.music = this.game.add.audio(this.ctrl.getMusic());
        this.startMusic();
        this.music.onStop.add(this.startMusic, this);
    },

    startMusic: function () {
        if (this.run)
            if (!this.music.isPlaying)
                this.music.play();
    },
    createSounds: function () {
        this.sounds.katsching = this.game.add.audio('snd_katsching');
        this.sounds.katsching_bottle = this.game.add.audio('snd_katsching_bottle');
        this.sounds.katsching_burp = this.game.add.audio('snd_katsching_burp');
        this.sounds.katsching_eat = this.game.add.audio('snd_katsching_eat');
        this.sounds.katsching_hit = this.game.add.audio('snd_katsching_hit');
        this.sounds.katsching_zipper = this.game.add.audio('snd_katsching_zipper');
    },

    selectProduct: function (product) {
        var productMatches = function (item) {
            return item.product === product;
        };
        var playerItemsMatching = _.filter(this.itemsForSale, productMatches, this);
        var vendorItemsMatching = _.filter(this.playerItems, productMatches, this);
        if (playerItemsMatching.length > 0) {
            this.onClickPlayerItem(playerItemsMatching[0]);
        } else if (vendorItemsMatching.length > 0) {
            this.onClickItem(vendorItemsMatching[0]);
        } else {
            console.log('could not reselect item.');
        }
    },

    onClickExit: function () {
        console.log('WeaponStore#onClickExit');
        this.run = false;
        this.music.stop();
        this.ctrl.onExit();
    },

    update: function () {
        this.textPlayerMoney.text = "Vermögen: " + this.ctrl.player.money + " Finger"
    }
};
