/**
 * Dialogue is a library which helps rendering conversations with Phaser.
 * @see https://github.com/PLyn/Phaser_Dialogue_module/blob/master/lib/Dialogue.js
 */
FTRPG.Dialogue = function (game, onDialogFinished) {
    this.G = game;
    this.xml = null;
    this.text = '';
    this.style = '';
    this.message = null;
    this.length = 0;
    this.time = 0;
    this.line = '';
    this.i = 1;
    this.sceneID = 0;
    this.XMLquery = '';
    this.currentString = "";
    this.tileSprite = null;
    this.image = null;
    this.imageBorder = null;
    this.onDialogFinished = onDialogFinished;
};

FTRPG.Dialogue.prototype = {
    parseXML: function (xmlkey, sceneNumber) {
        console.log("dialogue#parseXML");
        this.xml = this.G.cache.getText(xmlkey);
        this.sceneID = sceneNumber;
        var parser = new DOMParser();
        this.xml = parser.parseFromString(this.xml, "application/xml");
        this.length = 0;
        var childNodes = this.xml.querySelector('[id="' + this.sceneID + '"]').childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i].nodeName !== "#text") {
                this.length++;
            }
        }
    },
    renderWindow: function (bgImgKey, image) {
        console.log("dialogue#renderWindow");
        this.tileSprite = this.G.add.image(0, this.G.height - 200, bgImgKey);
        this.tileSprite.width = this.G.width;
        this.tileSprite.height = 200;
        this.tileSprite.fixedToCamera = true;
        if (image != null) {
            this.image = this.G.add.tileSprite(28, this.G.height - 172, 144, 144, image, 0);
            this.imageBorder = this.G.add.image(22, this.G.height - 178, 'ui_portait_border', 0);
            this.imageBorder.fixedToCamera = true;
            this.image.fixedToCamera = true;
        }

    },
    load: function () {
        this.XMLquery = this.xml.querySelector('[id="' + this.sceneID + '"]' + ' ' + '[id="' + this.i + '"]');
        this.currentString = this.XMLquery.textContent;
    },
    showDialogue: function (text, style) {
        console.log("dialogue#showDialogue");
        //save data from variables
        this.text = text;
        this.style = style;

        this.message = this.G.add.text(this.G.width / 2, this.G.height - 100, '', this.style);
        this.message.fixedToCamera = true;
        // this.skipText = this.G.add.text(100, 100, 'überspringen', this.style); //TODO add skip option
        // this.skipText.anchor.setTo(1);
        this.message.anchor.setTo(0.4, 1);
        //10 is the speed, higher number makes the sentence render slower
        this.time = this.G.time.now + 30;
    },
    updateDialogue: function () {
        // console.log("dialogue#updateDialogue");
        //if there are no more nodes in the particular scene then reinitialize all the variables back to their default values
        if (this.i <= this.length) {
            this.load();
            if (this.G.time.now > this.time) { //delays rendering of sentence
                if (this.line.length < this.currentString.length) {
                    this.line = this.currentString.substr(0, this.line.length + 1); //loads small part of sentence at the time til you get the full sentence
                    this.message.setText(this.line);
                    this.time = this.G.time.now + 30;
                }
            }
            this.G.input.onDown.addOnce(this.onInputDown, this); //on touch or click then load the function onInputDown
        }
        else {
            this.destroy(); //destroy objects
            this.onDialogFinished();
        }
    },
    onInputDown: function () {
        this.message.setText('');
        this.i++;
        this.line = '';
        this.time = this.G.time.now + 80;
    },
    destroy: function () {
        this.imageBorder.destroy();
        this.tileSprite.destroy();
        this.message.destroy();
        this.image.destroy();
    }

};
