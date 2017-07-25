FTRPG.Ctrl.BattleController = function (game, player, enemy, onBattleEnd, context, canFlee) {
    this.game = game;
    this.player = player;
    this.enemy = enemy;
    this.callOnBattleEnd = function (hasLost) {
        onBattleEnd.call(context, hasLost);
    };
    this.currFoodImpact = {
        precision: {
            player: 1.0,
            enemy: 1.0,
            playerExpires: -1, // meaning: until round x, the player precision will be active
            enemyExpires: -1 // meaning: until round x, the enemy precision will be active
        },
        hpEnemy: 0, // the player hp is not available here, hp will be increased instantly, not for specific duration.
        hpEnemyExpires: -1, // meaning: until round x, the enemy hp decrease will be active
        hpEnemyStatusText: ''
    };
    this.isPlayersTurn = true;
    this.currRound = 0;
    this.currentlyInDefense = false;
    this.canFlee = canFlee;
};

FTRPG.Ctrl.BattleController.prototype = {
    game: null,
    battleType: null,
    player: null,
    enemy: null,
    currFoodImpact: {
        precision: {
            player: 1.0,
            enemy: 1.0,
            playerExpires: -1, // meaning: until round x, the player precision will be active
            enemyExpires: -1 // meaning: until round x, the enemy precision will be active
        },
        hpEnemy: 0, // the player hp is not available here, hp will be increased instantly, not for specific duration.
        hpEnemyExpires: -1, // meaning: until round x, the enemy hp decrease will be active
        hpEnemyStatusText: ''
    },
    isPlayersTurn: true, // player begins
    currRound: 0, // count from 0 upwards
    currentlyInDefense: false,

    getPlayersInventory: function () {
        return this.player.getInventory();
    },

    getPlayerSpriteName: function () {
        return 'spr_battle_player';
    },

    getEnemySpriteName: function () {
        return this.enemy.images[0];
    },
    getPlayerHP: function () {
        return this.player.hp;
    },

    getBigPlayerStatusText: function () {
        var precision = this.currFoodImpact.precision.player > 1.0 ? '  |  Präzision x ' + this.currFoodImpact.precision.player : '';
        var enemy1 = this.currFoodImpact.precision.enemy < 1.0 ? '  |  Gegner-Präzision x' + this.currFoodImpact.precision.enemy : '';
        var enemy2 = this.currFoodImpact.hpEnemy > 0 ? '  |  Gegner HP -' + this.currFoodImpact.hpEnemy : '';
        return 'Gesundheitszustand: ' + this.getPlayerHP() + ' HP' + precision + enemy1 + enemy2;
    },

    getEnemyStatus: function () {
        var usesMunition = this.enemy.currentWeapon instanceof FTRPG.Model.Munition;
        return this.enemy.name + ' nutzt: ' + (usesMunition ? this.enemy.currentWeapon.weaponName : this.enemy.currentWeapon.name);
    },
    getPlayerStatus: function (attackButtonsAreShowing) {
        var currWeapon = this.player.currentWeapon;
        if (currWeapon instanceof FTRPG.Model.Munition) {
            return 'Waffe: ' + currWeapon.weaponName + ' - ' + this.player.howMuchOf(currWeapon) + ' ' + currWeapon.munitionLeftText;
        } else {
            return 'Waffe: ' + currWeapon.name;
        }
    },

    getEnemyHP: function () {
        return this.enemy.hp;
    },

    getPlayerProgressText: function () {
        if (this.currFoodImpact.precision.player > 1.0) {
            return '- erhöhte Präzision';
        } else return '';
    },
    getEnemyProgressText: function () {
        if (this.currFoodImpact.hpEnemy > 0) {
            return '- ' + this.currFoodImpact.hpEnemyStatusText;
        }
        if (this.currFoodImpact.precision.enemy < 1.0) {
            return '- Präzision geschwächt';
        } else return '';
    },

    canApplyThisFood: function (impact) {
        var isAlreadyApplied = // FTRPG.Constants.FoodImpact.playerHP can never be applied because it will be applied instantly
            (impact === FTRPG.Constants.FoodImpact.playerPrecision && this.currFoodImpact.precision.player > 1.0)
            || (impact === FTRPG.Constants.FoodImpact.enemyPrecision && this.currFoodImpact.precision.enemy < 1.0)
            || (impact === FTRPG.Constants.FoodImpact.enemyHP && this.currFoodImpact.hpEnemy > 0);
        var isAlreadyHealthy = impact === FTRPG.Constants.FoodImpact.playerHP && this.getPlayerHP() === this.player.getMaxHP();
        return !isAlreadyApplied && !isAlreadyHealthy;
    },

    getPlayerPrecision: function () {
        return this.player.currentWeapon.precision * this.currFoodImpact.precision.player;
    },

    getEnemyPrecision: function () {
        return this.enemy.currentWeapon.precision * this.currFoodImpact.precision.enemy;
    },

    /**
     * Called when the user clicked one of the attack buttons
     * @param attackType FTRPG.Constants.AttackType
     * @param callback takes 5args:
     * 1st is attacktype
     * 2nd first if player did hit
     * 3rd if player has won after the attack
     * 4th if the munition ran out
     * 5th the weapon which was used (may vary from current weapon cuase munition ran out)
     * @param context cb context
     */
    onAttackEnemy: function (attackType, callback, context) {
        console.log('BattleController#onAttackEnemy', attackType);
        var isOffensiveAttack = attackType === FTRPG.Constants.AttackType.offensive;
        var weapon = this.player.currentWeapon;
        var precision = this.getPlayerPrecision();
        var didHit = FTRPG.Constants.Balancing.playerWillHitEnemy(precision, this.player.skillLevel);
        var willWin = false;
        var munitionRanOut = false;
        if (weapon instanceof FTRPG.Model.Munition && attackType === FTRPG.Constants.AttackType.offensive) {
            munitionRanOut = this.player.removeMunition(weapon);
        }
        if (isOffensiveAttack && didHit) {
            willWin = this.reduceEnemyHP(this.currFoodImpact.hpEnemy + weapon.damage);
        } else if (!isOffensiveAttack) {
            //defensive attack
            this.currentlyInDefense = true;
            if (this.currFoodImpact.hpEnemy > 0) {
                willWin = this.reduceEnemyHP(this.currFoodImpact.hpEnemy);
            }
        }
        this.updateFoodImpactExpirations();
        callback.call(context, attackType, isOffensiveAttack && didHit, willWin, munitionRanOut, weapon);
    },

    updateFoodImpactExpirations: function () {
        var currImpact = this.currFoodImpact;
        currImpact.precision.playerExpires--;
        currImpact.hpEnemyExpires--;
        if (this.currFoodImpact.precision.playerExpires === 0) {
            console.log('foodImpact Expiration: player precision');
            this.currFoodImpact.precision.playerExpires = -1;
            this.currFoodImpact.precision.player = 1.0;
        }
        if (this.currFoodImpact.hpEnemyExpires === 0) {
            console.log('foodImpact Expiration: enemy HP');
            this.currFoodImpact.hpEnemyExpires = -1;
            this.currFoodImpact.hpEnemy = 0;
        }
    },

    /**
     *
     * @param callback takse 2 booleans: first if enemy did hit, second if player has lost after the attack
     */
    onEnemyAttacks: function (callback, context) {
        console.log('BattleContorller#onEnemyAttacks');
        var weapon = this.enemy.currentWeapon;
        var defense = this.player.getCurrentDefense();
        var skillLevel = this.player.skillLevel;
        var didHit = FTRPG.Constants.Balancing.enemyWillHitPlayer(this.getEnemyPrecision(), defense, skillLevel);
        var damage = FTRPG.Constants.Balancing.getEnemysDamage(weapon.damage, this.currentlyInDefense);
        var willDie = didHit && this.reducePlayerHP(damage);
        this.currFoodImpact.precision.enemyExpires--;
        if (this.currFoodImpact.precision.enemyExpires === 0) {
            console.log('foodImpact Expiration: enemy precision');
            this.currFoodImpact.precision.enemyExpires = -1;
            this.currFoodImpact.precision.enemy = 1.0;
        }
        this.currRound++;
        this.currentlyInDefense = false;
        console.log('starting round ' + this.currRound);
        callback.call(context, didHit, willDie);
    },

    getDurationUntilEnemyAttacks: function () {
        return this.game.rnd.between(2000, 3000);
    },

    reduceEnemyHP: function (value) {
        this.enemy.hp = Math.max(0, this.enemy.hp - value);
        return this.enemy.hp === 0;
    },

    reducePlayerHP: function (value) {
        this.player.hp = Math.max(0, this.player.hp - value);
        return this.player.hp === 0;
    },

    onApplyMunition: function (munition) {
        console.log('BattleController#onApplyMunition');
        this.player.currentWeapon = munition;
    },

    onApplyFood: function (food) {
        console.log('BattleController#onApplyFood');
        this.player.removeItem(this.player.foods, food);

        switch (food.impact) {
            case FTRPG.Constants.FoodImpact.enemyHP:
                this.currFoodImpact.hpEnemy = food.impactValue;
                this.currFoodImpact.hpEnemyExpires = food.impactDuration;
                this.currFoodImpact.hpEnemyStatusText = FTRPG.Constants.Battle.enemyHPStatus[food.images[0]];
                break;
            case FTRPG.Constants.FoodImpact.playerHP:
                this.player.hp = Math.min(this.player.getMaxHP(), this.player.hp + food.impactValue); // apply instantly
                break;
            case FTRPG.Constants.FoodImpact.playerPrecision:
                this.currFoodImpact.precision.playerExpires = food.impactDuration;
                this.currFoodImpact.precision.player = food.impactValue;
                break;
            case FTRPG.Constants.FoodImpact.enemyPrecision:
                this.currFoodImpact.precision.enemyExpires = food.impactDuration;
                this.currFoodImpact.precision.enemy = food.impactValue;
                break;

            default:
                throw new FTRPG.Model.Exception('this impact type is not implemented');
        }

    },
    onApplyWeapon: function (weapon) {
        console.log('BattleController#onApplyWeapon');
        this.player.currentWeapon = weapon;
    },
    onApplyArmour: function (armour) {
        console.log('BattleController#onApplyArmour');
        this.player.currentArmour = armour;
    },

    getCurrentWeapon: function () {
        return this.player.currentWeapon;
    },

    getCurrentArmour: function () {
        return this.player.currentArmour;
    },

    onPlayerLost: function () {
        console.log('BattleController#onPlayerLost');
        this.callOnBattleEnd(true);
    },

    onPlayerFled: function () {
        console.log('BattleController#onPLayerFled');
        return FTRPG.Constants.Balancing.playerWillSucceedFleeing(this.enemy.maxHP);
    },

    onPlayerWon: function () { // also called after he succeeded fleeing
        console.log('BattleController#onPlayerWon');
        this.player.money = Math.max(0, this.player.money + FTRPG.Constants.Balancing.howMuchMoneyWillPlayerWin(this.player, this.game.rnd));
        this.player.skillLevel++;
        this.callOnBattleEnd(false);
    },


    onPlayerFledSuccessFully: function () {
        console.log('player could flee successfully');
        this.callOnBattleEnd(false);
    },

    onPlayerWasCaughtOnFleeing: function () {
        var loss = FTRPG.Constants.Balancing.howMuchMoneyWillPlayerLoseWhenCaught(this.player, this.game.rnd);
        console.log('player was caught on fleeing and loses ' + loss + 'fingers');
        this.player.money = Math.max(0, this.player.money - loss);
        Math.max(this.player.money);
        this.callOnBattleEnd(false);
    },

    getPriceTagText: function (product, player) {
		return FTRPG.Util.ProductHelper.getPriceTagText(product, player);
    },

    getProductDescription: function (product, player) {
		return FTRPG.Util.ProductHelper.getProductDescription(product, player);
    }
}
;
