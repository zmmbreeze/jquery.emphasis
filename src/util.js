/*global hash:false, uniqueId:false, classInlineBlockHash:false,
classInlineHash:false, classOverMarkHash:false, classScaleHash:false,
classRightMarkHash:false, classLeftMarkHash:false*/

var styleSheet;
// cache for presudo-class css rule
var addedCssRule = {
    'char': {},
    'color': {},
    'mark': {}
};
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
        return false;
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
        // .inline-block.scale:before
        this.addCSSRule(
            '.' + classInlineBlockHash + '.' + classScaleHash + ':before',
            'width: 200%;'
        );

        // over
        // .inline-block.over
        this.addCSSRule('.' + classInlineBlockHash + '.' + classOverMarkHash,
            'padding:0.5em 0 0 0;'
        );
        // .inline.over:before
        this.addCSSRule(
            '.' + classInlineHash + '.' + classOverMarkHash + ':before',
            'top: -0.5em;' +
            'bottom: auto;'
        );
        // .inline-block.over:before
        this.addCSSRule(
            '.' + classInlineBlockHash + '.' + classOverMarkHash + ':before',
            'top: 0;' +
            'bottom: auto;'
        );


        // right
        // .inline-block.right
        this.addCSSRule('.' + classInlineBlockHash + '.' + classRightMarkHash,
            'padding:0 0.5em 0 0;'
        );
        // .right:before
        this.addCSSRule(
            '.' + classRightMarkHash + ':before',
            'left:auto;' +
            'vertical-align:middle;' +
            'height: 100%;' +
            'line-height: 100%;' +
            'width: 1em;' +
            'top: 0;' +
            'background: red;' +
            'bottom: auto;'
        );
        // .inline.right:before
        this.addCSSRule(
            '.' + classInlineHash + '.' + classRightMarkHash + ':before',
            'right: -0.5em;'
        );
        // .inline-block.right:before
        this.addCSSRule(
            '.' + classInlineBlockHash + '.' + classRightMarkHash + ':before',
            'right: 0;'
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
