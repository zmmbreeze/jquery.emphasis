var rString = /['"]([^'"]+)['"]/;
var rMark = /(dot|circle|double-circle|triangle|sesame)/;
var rPosition = /(under|over|left|right)/;
/**
 * MarkInfo
 *
 * @constructor
 * @param {string} styleAndColor .
 * @param {string} position .
 */
var MarkInfo = function(styleAndColor, position) {
    this.parse(styleAndColor, position);
};

/**
 * set value on this object.
 * if set again then return false.
 *
 * @param {string} key .
 * @param {string} value .
 * @return {boolean} success.
 */
MarkInfo.prototype.set = function(key, value) {
    if (typeof this[key] !== 'undefined') {
        return false;
    }
    this[key] = value;
    return true;
};

/**
 * parse input to get markInfo
 *
 * @param {string} styleAndColor .
 * @param {string} position .
 */
MarkInfo.prototype.parse = function(styleAndColor, position) {
    var r;  // match result

    // set position
    if (position) {
        if (r = position.match(rPosition)) {
            // >> 'over'
            this.position = r[1];
        } else {
            // >> position value error
            this.error = true;
            return;
        }
    }

    // set style and color
    if (!styleAndColor) {
        this.error = true;
        return;
    }
    styleAndColor = styleAndColor.split(' ');

    var value;
    var setResult;
    for (var i = 0, l = styleAndColor.length; i < l; i++) {
        value = styleAndColor[i];

        if (r = value.match(rString)) {
            // >> '"@"'
            var stringMark = r[1];
            if (stringMark.length > 1) {
                stringMark = stringMark.charAt(0);
            }
            setResult = this.set('mark', stringMark);
            this.isStringMark = true;
            if (setResult) {
                return;
            }
        } else if (value.indexOf('none') !== -1) {
            // >> 'none'
            this.isNone = true;
            return;
        } else if (value.indexOf('filled') !== -1) {
            // >> 'filled'
            setResult = this.set('filled', true);
        } else if (value.indexOf('open') !== -1) {
            // >> 'open'
            setResult = this.set('filled', false);
        } else if (r = value.match(rMark)) {
            // >> 'dot'
            setResult = this.set('mark', r[1]);
        } else {
            // >> color like 'red'
            // TODO validate color param
            setResult = this.set('color', $.trim(value));
        }

        if (!setResult) {
            // >> styleAndColor value error
            this.error = true;
            return;
        }
    }

    if (typeof this.mark === 'undefined' &&
        typeof this.filled === 'undefined') {
        // >> mark and filled not set
        this.error = true;
    }
};

/**
 * auto complete values to
 *  {
 *      filled: true,
 *      mark: 'dot',
 *      color: 'red',
 *      position: 'under'
 *  }
 *
 */
MarkInfo.prototype.autoComplete = function() {
    if (this.isNone) {
        return;
    }
    var language = navigator.language || navigator.browserLanguage;
    language = language.slice(0, 2);
    var isJapanese = language === 'ja';

    // complete position
    if (this.position == null) {
        // not set position
        if (isJapanese) {
            this.position = 'over';
        } else {
            // other language like chinese
            this.position = 'under';
        }
    }

    // complete style
    var hasFilled = typeof this.filled !== 'undefined';
    var hasMark = typeof this.mark !== 'undefined';

    if ((hasFilled && hasMark) || (hasMark && this.isStringMark)) {
        // no need to complete
        return;
    }

    if (hasMark) {
        // no filled
        this.filled = true;
    } else if (hasFilled) {
        this.mark = 'circle';
    }
};
