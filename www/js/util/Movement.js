FTRPG.Util.Movement = {
    /**
     * @param cursors keyboard cursor keys
     * @returns {number|null} angle in which the sprite should be moved or null if angle no cursor pressed
     */
    currentKeyboardDirection: function (cursors) {
        if (cursors.left.isDown) {
            if (cursors.up.isDown) {
                return -135;
            } else if (cursors.down.isDown) {
                return 135;
            } else {
                return -180;
            }
        } else if (cursors.right.isDown) {
            if (cursors.up.isDown) {
                return -45;
            } else if (cursors.down.isDown) {
                return 45;
            } else {
                return 0;
            }
        } else if (cursors.up.isDown) {
            return -90;
        } else if (cursors.down.isDown) {
            return 90;
        }
        return null;
    },
    /**
     * @param angle angleToPointer
     * @returns {number} angle in which the sprite should be moved
     */
    currentTouchDirection: function (angle) {
        if (angle <= 22.5 && angle > -22.5) {
            return 0;
        } else if (angle <= -22.5 && angle > -67.5) {
            return -45;
        } else if (angle <= -67.5 && angle > -112.5) {
            return -90;
        } else if (angle <= -112.5 && angle > -135) {
            return -135;
        } else if (angle <= -135) {
            return -180;
        } else if (angle <= 67.5 && angle > 22.5) {
            return 45;
        } else if (angle <= 112.5 && angle > 67.5) {
            return 90;
        } else if (angle <= 135 && angle > 112.5) {
            return 135;
        } else if (angle > 135 && angle < 180) {
            return 135;// bug fix LGRPG-287
        }
        throw new FTRPG.Model.Exception('angle could not be mapped');
    },

    isAnyCursorActive: function (cursors) {
        return cursors.left.isDown ||
            cursors.right.isDown ||
            cursors.up.isDown ||
            cursors.down.isDown;
    },
    isPointerActive: function (pointer) {
        return pointer.isDown;
    },

    angleAnimationMap: {
        '0': 'right',
        '-45': 'right',
        '-90': 'up',
        '-135': 'left',
        '-180': 'left',
        '45': 'right',
        '90': 'down',
        '135': 'left'
    }

};
