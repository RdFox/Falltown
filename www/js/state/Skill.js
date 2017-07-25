FTRPG.State.Skill = function (game) {
    this.game = game;

};

FTRPG.State.Skill.prototype = {
    music: null,
    skillPoints: 5,
    setSkillPoints: 0,
    skillDistribution: [],
    sprites: {
        bg: null,
        textBoxBG: null,
        textBoxText: null,
        resetButton: null,
        doneButton: null,
        skillpointsText: null,
        descrTexts: [],
        valTexts: [],
        decreseButtons: [],
        increseButtons: []
    },
    onDoneCB: null,
    onDoneContext: null,

    init: function (controller, player, onDoneCB, onDoneContext) {
        this.onDoneContext = onDoneContext;
        this.onDoneCB = onDoneCB;
    },

    create: function () {
        this.skillPoints = 5;
        this.setSkillPoints = 0;
        this.createSprites();
        this.createMusic();
    },

    createMusic: function () {
        console.log("createAudio");
        this.music = this.game.add.audio('snd_bunker', 1, true);
        this.music.play();
    },


    createSprites: function () {
        var spr = this.sprites;
        spr.bg = this.game.add.image(0, 0, 'ui_border_menu');

        spr.textBoxBG = this.game.add.image(550, 100, 'bg_white');
        spr.bg.width = 330;
        spr.bg.height = 300;

        spr.resetButton = new FTRPG.Comp.TextButton(this.game, this.game.width - 410, this.game.height - 80, 'spr_button', this.reset, this, 1, 0, 2, 'Zurücksetzen');
        spr.doneButton = new FTRPG.Comp.TextButton(this.game, this.game.width - 210, this.game.height - 80, 'spr_button', this.onDoneCB, this.onDoneContext, 1, 0, 2, 'Fertig');
        spr.decreseButtons = [
            this.game.add.button(x, y, 'spr_arrow_left', cb, this, 1, 0, 2)
        ];
        for (var i = 0; i < 3; i++) {
            var x = i;
            var createCB = function (val) {
                return function () {
                    this.skillDistribution[x] += val;
                    this.setSkillPoints += val;
                }
            };
            spr.increseButtons.push(this.game.add.button(x, y, 'spr_arrow_right', createCB(1), this, 1, 0, 2));
            spr.decreseButtons.push(this.game.add.button(x, y, 'spr_arrow_left', createCB(-1), this, 1, 0, 2));
        }

        var style = FTRPG.StyleFactory.generate.smallText(295, 'left', 'black');
        spr.textBoxText = this.game.add.text(560, 110, 'Verteile deine Fähigkeitspunkte', style);
        spr.descrTexts = [
            this.game.add.text(50, 110, 'Präzision', style),
            this.game.add.text(50, 150, 'Charme', style),
            this.game.add.text(50, 190, 'Stärke', style)
        ];
        spr.valTexts = [
            this.game.add.text(120, 110, '', style),
            this.game.add.text(120, 150, '', style),
            this.game.add.text(120, 190, '', style)
        ];

    },


    update: function () {
        this.sprites.resetButton.setDisabled(this.setSkillPoints === 0);
        this.sprites.doneButton.setDisabled(this.setSkillPoints !== this.skillPoints);
        for (var i = 0; i < 3; i++) {
            this.sprites.valTexts[i].text = this.skillDistribution[i];
            this.sprites.increseButtons[i].visible = this.setSkillPoints < this.skillPoints;
            this.sprites.decreseButtons[i].visible = this.skillDistribution[i] > 0
        }
    },


    shutdown: function () {
        this.music.stop();
    }
};
