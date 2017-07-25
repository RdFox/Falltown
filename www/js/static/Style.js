/**
 * Provides default and dynamic styles that can be used to style Phaser.Texts. A Phaser.Text takes a style object as argument.
 * This object can be genarated using the Factory by doing the following:<br>
 *  <li>StyleFactory.generate.smallText(...)</li>
 *  <li>StyleFactory.generate.bigStrokedText(...)</li>
 *  <li>...</li>
 *  <li>or by creating a custom style and then using StyleFactory.smallFont as parameter in your own style object</li>
 */
FTRPG.StyleFactory = {
    defaultFont: "Widelands",
    defaultTextColor: 'black',
    defaultAlign: 'center',

    defaultStrokeThickness: 3,
    defaultStrokeColor: 'white'
};

FTRPG.StyleFactory.smallFont = "20px " + FTRPG.StyleFactory.defaultFont;
FTRPG.StyleFactory.bigFont = "30px " + FTRPG.StyleFactory.defaultFont;

FTRPG.StyleFactory.generate = {
    smallText: function (wrapWidth, align, textColor) {
        return {
            fill: textColor || FTRPG.StyleFactory.defaultTextColor,
            font: FTRPG.StyleFactory.smallFont,
            wordWrap: wrapWidth > 0,
            wordWrapWidth: wrapWidth,
            align: align || FTRPG.StyleFactory.defaultAlign
        };
    },
    smallStrokedText: function (wrapWidth, strokeColor, strokeThickess, align) {
        return {
            font: FTRPG.StyleFactory.smallFont,
            wordWrap: wrapWidth > 0,
            stroke: strokeColor || FTRPG.StyleFactory.defaultStrokeColor,
            strokeThickness: strokeThickess || FTRPG.StyleFactory.defaultStrokeThickness,
            align: align || FTRPG.StyleFactory.defaultAlign
        };
    },
    bigText: function (wrapWidth, align, textColor) {
        return {
            fill: textColor || FTRPG.StyleFactory.defaultTextColor,
            font: FTRPG.StyleFactory.bigFont,
            wordWrap: wrapWidth > 0,
            wordWrapWidth: wrapWidth,
            align: align || FTRPG.StyleFactory.defaultAlign
        };
    },
    bigStrokedText: function (wrapWidth, strokeColor, strokeThickess, align, color) {
        return {
            font: FTRPG.StyleFactory.bigFont,
            fill: color || 'black',
            wordWrap: wrapWidth > 0,
            wordWrapWidth: wrapWidth,
            stroke: strokeColor || FTRPG.StyleFactory.defaultStrokeColor,
            strokeThickness: strokeThickess || FTRPG.StyleFactory.defaultStrokeThickness,
            align: align || FTRPG.StyleFactory.defaultAlign
        };
    }
};
