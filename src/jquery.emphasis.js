/*
jQuery.emphasis.js

Copyright 2013 mzhou / @zhoumm
Version: 0.2.0
License:
    https://raw.github.com/zmmbreeze/jquery.emphasis/master/MIT-LICENTSE.txt
*/

/*global jQuery:false, document:false, navigator:false */

(function($) {


// prevent duplicate
// hash code from 'jquery.emphasis'
var hash = '9a91ab9b8e64d2cf7fce0616b66efbaf';
var classInlineBlockHash = 'inline-block' + hash;
var classInlineHash = 'inline' + hash;
var classScaleHash = 'scale' + hash;
var classOverMarkHash = 'over' + hash;
var classUnderMarkHash = 'under' + hash;
var positionClassMap = {
    'over': classOverMarkHash,
    'under': classUnderMarkHash
};

var uniqueId = 0;
var markMap = {
    dot: ['\u2022', '\u25E6'],
    circle: ['\u25CF', '\u25CB'],
    'double-circle': ['\u25C9', '\u25CE'],
    triangle: ['\u25B2', '\u25B3'],
    sesame: ['\uFE45', '\uFE46']
};
// TODO
// not exactly like spec
// only list commonly used characters
var ignoreCharacter = {
    // word-sperator
    // http://www.w3.org/TR/css3-text/#word-separator
    ' ': 1,
    '\u00A0': 1,
    '\u1361': 1,
    '\u10100': 1,
    '\u10101': 1,
    '\u1039F': 1,
    '\u1091F': 1,
    '\u0F0B': 1,
    '\u0F0C': 1,
    '\u200B': 1,
    '\u3000': 1,
    '\u2000': 1,
    '\u200A': 1,
    // unicode control characters, only show commmonly used one.
    // http://en.wikipedia.org/wiki/Unicode_control_characters
    '\u0000': 1,
    '\u0009': 1,
    '\u000A': 1,
    '\u000D': 1,
    '\u0085': 1
};
var skipHtmlTagName = {
    'style': 1,
    'script': 1,
    'textarea': 1,
    'input': 1
};

/* RegExp */
var rString = /['"]([^'"]+)['"]/;
var rMark = /(dot|circle|double-circle|triangle|sesame)/;
var rPosition = /(under|over|left|right)/;
var rString = /['"]([^'"]+)['"]/;
var rMark = /(dot|circle|double-circle|triangle|sesame)/;
var rPosition = /(under|over|left|right)/;

// styleSheet used to add css style
var styleSheet;
// cache for presudo-class css rule
var addedCssRule = {
    'char': {},
    'color': {},
    'mark': {}
};

/*global hash:false, uniqueId:false, classInlineBlockHash:false,
classInlineHash:false, classOverMarkHash:false, classScaleHash:false,
styleSheet:true, addedCssRule:false */


var Util = {
    /**
     * add CSS rule at last.
     *
     * @param {string} selector '.foo'.
     * @param {string} rules 'color:red;background:blue;'.
     */
    addCSSRule: function(selector, rules) {
        if (!styleSheet) {
            var style = document.createElement('style');
            style.type = 'text/css';
            $('head').eq(0).prepend(style);
            styleSheet = document.styleSheets[0];
        }

        if (styleSheet.insertRule) {
            styleSheet.insertRule(
                selector + '{' + rules + '}',
                styleSheet.cssRules.length
            );
        } else {
            // IE
            styleSheet.addRule(selector, rules, -1);
        }
    },
    /**
     * add css rule for presudo-class `:before`
     *
     * @this
     * @param {string} type char|mark|color.
     * @param {string} key .
     * @param {string} style .
     * @return {string} className.
     */
    addBeforeCSSRule: function(type, key, style) {
        var rules = addedCssRule[type];
        if (rules[key]) {
            return rules[key];
        }

        var className = type + (uniqueId++) + hash;
        this.addCSSRule('.' + className + ':before', style);
        rules[key] = className;
        return className;
    },
    /**
     * test style
     *
     * @param {HTMLElement} dom .
     * @param {string} styleName .
     * @return {string} supported style name or empty string.
     */
    testStyle: function(dom, styleName) {
        var prefixs = ['webkit', 'moz', 'o', 'ms'];
        for (var i = 0, l = prefixs.length; i < l; i++) {
            if (dom.style[prefixs[i] + styleName] === '') {
                return prefixs[i] + styleName;
            }
        }

        var tStyleName = styleName.charAt(0).toLowerCase() + styleName.slice(1);
        if (typeof dom.style[tStyleName] !== 'undefined') {
            return tStyleName;
        }
        return false;
    },
    /**
     * webkitTransformOrigin => -webkit-transform-origin
     * transformOrigin => transform-origin
     *
     * @param {string} jsName .
     * @return {string} cssName.
     */
    jsNameToCssName: function(jsName) {
        return jsName
            .replace(/[A-Z]/g, function(match) {
                return '-' + match.toLowerCase();
            })
            .replace(/^(webkit|moz|o|ms)\-/, '-$1-');
    },
    /**
     * test transform scale(fallback by zoom) support.
     *
     * @this
     * @return {boolean|array} .
     */
    supportScale: function supportScale() {
        if (typeof supportScale.result !== 'undefined') {
            return supportScale.result;
        }

        var div = document.createElement('div');
        var result;
        var transformName = this.testStyle(div, 'Transform');
        var transformOriginName = this.testStyle(div, 'TransformOrigin');
        if (transformName && transformOriginName) {
            transformName = this.jsNameToCssName(transformName);
            transformOriginName = this.jsNameToCssName(transformOriginName);
            result = [transformName, transformOriginName];
        } else {
            result = null;
        }

        supportScale.result = result;
        return result;
    },
    /**
     * test emphasis support.
     *
     * @this
     * @return {array} .
     */
    supportEmphasis: function supportEmphasis() {
        // TODO
        if (typeof supportEmphasis.result !== 'undefined') {
            return supportEmphasis.result;
        }

        var div = document.createElement('div');
        var textEmphasisName = this.testStyle(div, 'TextEmphasis');
        var textEmphasisPositionName =
            this.testStyle(div, 'TextEmphasisPosition');
        var result;
        if (textEmphasisName && textEmphasisPositionName) {
            // support
            result = [textEmphasisName, textEmphasisPositionName];
        } else {
            // not support
            result = null;
        }

        supportEmphasis.result = result;
        return result;
    },
    /**
     * test writing-mode css style
     *
     * @this
     * @return {array} .
     */
    supportWritingMode: function supportWritingMode() {
        if (typeof supportWritingMode.result !== 'undefined') {
            return supportWritingMode.result;
        }

        var div = document.createElement('div');
        var result;
        var writingModeName = this.testStyle(div, 'WritingMode');
        if (writingModeName) {
            writingModeName = this.jsNameToCssName(writingModeName);
            result = writingModeName;
        } else {
            result = null;
        }

        supportWritingMode.result = result;
        return result;
    },

    /**
     * init css style.
     *
     * @this
     */
    initCSSRule: function initCSSRule() {
        if (initCSSRule.inited) {
            return;
        }
        initCSSRule.inited = true;

        // .inline-block
        this.addCSSRule('.' + classInlineBlockHash,
            'position:relative;' +
            'display:inline-block;_zoom:1;' +
            // reset style
            'float:none;' +
            'border:none;' +
            'margin:0;' +
            'padding:0 0 0.5em 0;' +
            'vertical-align: baseline;' +
            // '*vertical-align: -0.5em;' +
            'color:inherit;' +
            'font-size:inherit;' +
            'font-family:inherit;' +
            'letter-spacing: normal;' +     // reset letter-spacing
            'text-decoration:inherit;' +
            'line-height:inherit;'
        );
        // .inline-block.over
        this.addCSSRule('.' + classInlineBlockHash + '.' + classOverMarkHash,
            'padding:0.5em 0 0 0;'
        );

        // .inline
        this.addCSSRule('.' + classInlineHash,
            'position:relative;' +
            // reset style
            'float:none;' +
            'border:none;' +
            'margin:0;' +
            'padding:0;' +
            'vertical-align: baseline;' +
            'color:inherit;' +
            'font-size:inherit;' +
            'font-family:inherit;' +
            'letter-spacing: normal;' +     // reset letter-spacing
            'text-decoration:inherit;' +
            'line-height:inherit;'
        );
        var styleForBeforeClass =
            'position:absolute;' +
            'bottom: 0;' +
            'left: 0;' +
            'height: 1em;' +
            'line-height: 1em;' +
            'text-align: center;' +
            'width: 100%;' +
            // reset style
            'float:none;' +
            'border:none;' +
            'margin:0;' +
            'padding:0;' +
            'vertical-align: baseline;' +
            'color:inherit;' +
            'font-size: inherit;' +
            'font-family:inherit;' +
            'text-decoration: none;';
        // .inline:before
        this.addCSSRule('.' + classInlineHash + ':before',
            styleForBeforeClass +
            'bottom: -1em;'
        );
        // .inline-block:before
        this.addCSSRule(
            '.' + classInlineBlockHash + ':before',
            styleForBeforeClass
        );

        // .inline.scale:before
        this.addCSSRule(
            '.' + classInlineHash + '.' + classScaleHash + ':before',
            'bottom: -0.5em;' +
            'width: 200%;'
        );
        // .inline.over:before
        this.addCSSRule(
            '.' + classInlineHash + '.' + classOverMarkHash + ':before',
            'top: -0.5em;' +
            'bottom: auto;'
        );

        // .inline-block.scale:before
        this.addCSSRule(
            '.' + classInlineBlockHash + '.' + classScaleHash + ':before',
            'width: 200%;'
        );
        // .inline-block.over:before
        this.addCSSRule(
            '.' + classInlineBlockHash + '.' + classOverMarkHash + ':before',
            'top: 0;' +
            'bottom: auto;'
        );
    },

    /**
     * get line-height in 'px'
     *
     * TODO can't get the real line-height for this line.
     * @this
     * @param {object} $el element.
     * @param {number} fontSize .
     * @return {number} line-height.
     */
    getLineHeight: function($el, fontSize) {
        var lineHeight = $el.css('line-height');
        if (lineHeight === 'normal') {
            return this.getNormalLineHeight(fontSize);
        } else if (lineHeight.match(/px/)) {
            return parseInt(lineHeight, 10);
        } else {
            return fontSize * lineHeight;
        }
    },

    /**
     * get line-height in 'px' when it equal to 'normal'.
     *
     * @this
     * @param {number} fontSize .
     * @return {number} line-height.
     */
    getNormalLineHeight: function getNormalLineHeight(fontSize) {
        if (typeof getNormalLineHeight.result !== 'undefined') {
            return getNormalLineHeight.result;
        }
        var tmp = $('<div style="' +
                        'padding:0;' +
                        'display:block;' +
                        'border:0;' +
                        'position:absolute;' +
                        'line-height:normal;' +
                        'overflow:hidden;' +
                        'width:100px;' +
                    '">Some words.</div>');
        tmp.css('font-size', fontSize + 'px');
        tmp.appendTo('body');
        var lineHeight = tmp.height();
        tmp.remove();
        getNormalLineHeight.result = lineHeight;
        return lineHeight;
    }
};

/*jshint eqnull:true, boss: true */
/*global rString:false, rMark:false, rPosition:false, rString:false,
rMark:false, rPosition:false, navigator:false, $:false */

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

/*global classInlineBlockHash:false, classInlineHash:false,
classOverMarkHash:false, classScaleHash:false,
skipHtmlTagName:false, Util:false, positionClassMap:false,
ignoreCharacter:false, MarkInfo:false, markMap:false */

/**
 * Emphasis
 *
 * @constructor
 * @param {object} markInfo .
 * @param {object} $el element.
 * @param {boolean|array} styleNames .
 */
function Emphasis(markInfo, $el, styleNames) {
    this.markInfo = markInfo;
    this.$el = $el;
    this.styleNames = styleNames;
    this.setEmphasis();
}

/**
 * remove emphasis
 *      $('em').emphasis('none');
 */
Emphasis.prototype.removeEmphasis = function() {
    if (this.styleNames) {

        this.$el.css(this.styleNames[0], 'none');
    } else {
        this.removeEmphasizedTag(this.$el);
    }
};

/**
 * set emphasis
 *      $('em').emphasis('dot');
 */
Emphasis.prototype.setEmphasis = function() {
    if (this.markInfo.isNone) {
        this.removeEmphasis();
    } else {
        this.markInfo.autoComplete();

        if (this.styleNames) {
            this.setEmphasisByCSS();
        } else {
            this.setEmphasisByFallback();
        }
    }
};

/**
 * set emphasis by css
 */
Emphasis.prototype.setEmphasisByCSS = function() {
    var cssInput = {};
    if (this.markInfo.isStringMark) {
        // >> '@'
        cssInput[this.styleNames[0]] = '"' + this.markInfo.mark + '"';
    } else {
        // >> 'filled dot'
        cssInput[this.styleNames[0]] = '' +
                (this.markInfo.filled ? 'filled' : 'open') +
                ' ' +
                this.markInfo.mark +
                ' ' +
                (this.markInfo.color || '');
    }
    cssInput[this.styleNames[1]] = this.markInfo.position;
    this.$el.css(cssInput);
};

/**
 * set emphasis by fallback
 */
Emphasis.prototype.setEmphasisByFallback = function() {
    Util.initCSSRule();

    // calculate character
    this.markInfo.character = markMap[this.markInfo.mark] ?
        markMap[this.markInfo.mark][this.markInfo.filled ? 0 : 1] :
        this.markInfo.mark.charAt(0);

    this.fakeEmphasis(this.$el, this.markInfo);
};

/**
 * remove emphasized tag, even children's.
 *
 * @param {object} $el .
 * @param {boolean} noDeep not remove children's emphasized tag.
 */
Emphasis.prototype.removeEmphasizedTag = function($el, noDeep) {
    if (this.isEmphasizedTag($el[0])) {
        $el.replaceWith($el.text());
        return;
    }

    var children = $el.children();
    var $node;
    for (var i = 0, l = children.length; i < l; i++) {
        $node = $(children[i]);
        if (this.isEmphasizedTag($node[0])) {
            $node.replaceWith($node.text());
        } else {
            if (!noDeep) {
                this.removeEmphasizedTag($node);
            }
        }
    }
};

/**
 * if has emphasized tag.
 *
 * @param {object} $el .
 * @return {boolean} .
 */
Emphasis.prototype.hasEmphasizedTag = function($el) {
    var children = $el.children();
    var node;
    for (var i = 0, l = children.length; i < l; i++) {
        node = children[i];
        if (this.isEmphasizedTag(node)) {
            return true;
        }
    }
    return false;
};

/**
 * is this node a emphasized tag.
 *
 * @param {object} node .
 * @return {boolean} .
 */
Emphasis.prototype.isEmphasizedTag = function(node) {
    var className = node.className;
    // is generated span
    return className.indexOf(classInlineBlockHash) !== -1 ||
           className.indexOf(classInlineHash) !== -1;
};

/**
 * do fakeEmphasis
 *
 * @param {Object} $el node.
 * @param {Object} markInfo .
 * @param {number=} level dom level.
 */
Emphasis.prototype.fakeEmphasis = function($el, markInfo, level) {
    level = level || 1;

    if (level === 1) {
        // has priority to override style like css.
        this.removeEmphasizedTag($el, true);
    }

    var contents = $el.contents();
    var content;
    for (var j = 0, ll = contents.length; j < ll; j++) {
        content = contents[j];

        if (content.nodeType === 3) {
            // is text node
            this.textToHtml($(content), $el, markInfo);

        } else if (content.nodeType === 1) {
            // is normal tag
            var isEmphasizedTag = this.isEmphasizedTag(content);

            // is ignore html tag like style/script/textarea/input
            var nodeName = content.nodeName.toLowerCase();
            if (!(skipHtmlTagName[nodeName] || isEmphasizedTag)) {
                this.fakeEmphasis($(content), markInfo, level + 1);
            }
        }
    }
};

/**
 * text node to html with mark
 *
 * @param {Object} $node text node.
 * @param {Object} $parent parent node.
 * @param {Object} markInfo .
 */
Emphasis.prototype.textToHtml = function($node, $parent, markInfo) {
    // jQuery must >= 1.4
    var fontSize = parseInt($parent.css('font-size'), 10);
    var lineHeight = Util.getLineHeight($parent, fontSize);
    var markFontSize = fontSize / 2;

    // if not has enough space to place emphasis mark,
    // then use inline-block.
    var useInlineBlock = false;
    if (((lineHeight - fontSize) / 2) < markFontSize) {
        useInlineBlock = true;
    }

    // calculate mark style
    var useScale = Util.supportScale();
    var markStyle;
    if (useScale) {
        // support `transform: scale(0.5);`
        markStyle = useScale[0] + ':scale(0.5);' +
            useScale[1] +
            (markInfo.position === 'over' ? ':top left;' : ':bottom left;');
    } else {
        markStyle = 'font-size:' + markFontSize + 'px;' +
                    'height:' + markFontSize + 'px;' +
                    'line-height:' + markFontSize + 'px;';
    }
    // add css rules for mark `font-size or scale` relative style
    var uniqueFontClass = Util.addBeforeCSSRule(
        'mark',
        useScale ? markInfo.position : markFontSize,
        markStyle
    );

    // add css rule for color
    var uniqueColorClass = '';
    if (markInfo.color) {
        uniqueColorClass = Util.addBeforeCSSRule(
            'color',
            markInfo.color,
            // use `!important` for color
            'color:' + markInfo.color + ' !important;'
        );
    }

    // define inline / inline-block class
    var normalClass =
        (useInlineBlock ? classInlineBlockHash : classInlineHash);

    // css rules for `content: '@';`
    var uniqueCharClass = Util.addBeforeCSSRule(
        'char',
        markInfo.character,
        'content:\'' + markInfo.character + '\';'
    );

    // define position class
    var positionClass = positionClassMap[markInfo.position];

    // fake letterSpacing
    var letterSpacing = $parent.css('letter-spacing');
    var marginRightStyle = '';
    if (letterSpacing !== 'normal' &&
        letterSpacing !== 0) {
        marginRightStyle = 'margin-right:' + letterSpacing + ';';
    }

    // generate html
    var prefixTag = '<span class="' +
                        normalClass + ' ' +
                        uniqueCharClass + ' ' +
                        uniqueFontClass + ' ' +
                        uniqueColorClass + ' ' +
                        (useScale ? classScaleHash : '') + ' ' +
                        positionClass +
                        '" style="' +
                        marginRightStyle +
                        '">';
    var suffixTag = '</span>';

    // update html
    var text = $node.text();
    var c;
    var html = [];
    for (var i = 0, l = text.length; i < l; i++) {
        c = text.charAt(i);
        if (ignoreCharacter[c]) {
            html.push(c);
        } else {
            html.push(prefixTag);
            html.push(c);
            html.push(suffixTag);
        }
    }
    $node.replaceWith(html.join(''));
};

/**
 * Add text-emphasis fallback.
 *
 * @this
 * @param {string} styleAndColor .
 * @param {string} position .
 * @return {object} .
 */
$.fn.emphasis = function(styleAndColor, position) {
    var markInfo = new MarkInfo(styleAndColor, position);
    if (markInfo.error) {
        return;
    }

    this.each(function(index, element) {
        var $el = $(element);
        var styleNames = Util.supportEmphasis();
        new Emphasis(markInfo, $el, styleNames);
    });
    return this;
};

})(jQuery);
