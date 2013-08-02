/*global jQuery:false, document:false, navigator:false */

(function($) {
    // prevent duplicate
    // hash code from 'jquery.emphasis'
    var hash = '9a91ab9b8e64d2cf7fce0616b66efbaf';
    var htmlHash = 'emphasisOldHtml' + hash;
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

    /**
     * add CSS rule at last.
     *
     * @param {string} selector '.foo'.
     * @param {string} rules 'color:red;background:blue;'.
     */
    var styleSheet;
    function addCSSRule(selector, rules) {
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
    }

    /**
     * init css style.
     */
    function initCSSRule() {
        if (initCSSRule.inited) {
            return;
        }
        initCSSRule.inited = true;

        // .inline-block
        addCSSRule('.' + classInlineBlockHash,
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
        addCSSRule('.' + classInlineBlockHash + '.' + classOverMarkHash,
            'padding:0.5em 0 0 0;'
        );

        // .inline
        addCSSRule('.' + classInlineHash,
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
        addCSSRule('.' + classInlineHash + ':before',
            styleForBeforeClass +
            'bottom: -1em;'
        );
        // .inline-block:before
        addCSSRule(
            '.' + classInlineBlockHash + ':before',
            styleForBeforeClass
        );

        // .inline.scale:before
        addCSSRule(
            '.' + classInlineHash + '.' + classScaleHash + ':before',
            'bottom: -0.5em;' +
            'width: 200%;'
        );
        // .inline.over:before
        addCSSRule(
            '.' + classInlineHash + '.' + classOverMarkHash + ':before',
            'top: -0.5em;' +
            'bottom: auto;'
        );

        // .inline-block.scale:before
        addCSSRule(
            '.' + classInlineBlockHash + '.' + classScaleHash + ':before',
            'width: 200%;'
        );
        // .inline-block.over:before
        addCSSRule(
            '.' + classInlineBlockHash + '.' + classOverMarkHash + ':before',
            'top: 0;' +
            'bottom: auto;'
        );
    }

    // cache for presudo-class css rule
    var addedCssRule = {
        'char': {},
        'color': {},
        'mark': {}
    };
    /**
     * add css rule for presudo-class `:before`
     *
     * @param {string} type char|mark|color.
     * @param {string} key .
     * @param {string} style .
     * @return {string} className.
     */
    function addBeforeCSSRule(type, key, style) {
        var rules = addedCssRule[type];
        if (rules[key]) {
            return rules[key];
        }

        var className = type + (uniqueId++) + hash;
        addCSSRule('.' + className + ':before', style);
        rules[key] = className;
        return className;
    }

    /**
     * test style
     *
     * @param {HTMLElement} dom .
     * @param {string} styleName .
     * @return {string} supported style name or empty string.
     */
    function testStyle(dom, styleName) {
        // true style name
        var tStyleName = styleName.charAt(0).toLowerCase() + styleName.slice(1);
        if (typeof dom.style[tStyleName] !== 'undefined') {
            return tStyleName;
        }
        var prefixs = ['webkit', 'moz', 'o', 'ms'];
        for (var i = 0, l = prefixs.length; i < l; i++) {
            if (dom.style[prefixs[i] + styleName] === '') {
                return prefixs[i] + styleName;
            }
        }
        return false;
    }

    /**
     * webkitTransformOrigin => -webkit-transform-origin
     * transformOrigin => transform-origin
     *
     * @param {string} jsName .
     * @return {string} cssName.
     */
    function jsNameToCssName(jsName) {
        return jsName
            .replace(/[A-Z]/g, function(match) {
                return '-' + match.toLowerCase();
            })
            .replace(/^(webkit|moz|o|ms)\-/, '-$1-');
    }

    /**
     * test transform scale(fallback by zoom) support.
     *
     * @return {boolean|array} .
     */
    function supportScale() {
        if (typeof supportScale.result !== 'undefined') {
            return supportScale.result;
        }

        var div = document.createElement('div');
        var result;
        var transformName = testStyle(div, 'Transform');
        var transformOriginName = testStyle(div, 'TransformOrigin');
        if (transformName && transformOriginName) {
            transformName = jsNameToCssName(transformName);
            transformOriginName = jsNameToCssName(transformOriginName);
            result = [transformName, transformOriginName];
        } else {
            result = null;
        }

        supportScale.result = result;
        return result;
    }

    /**
     * test emphasis support.
     *
     * @return {array} .
     */
    function supportEmphasis() {
        return;
        // TODO
        if (typeof supportEmphasis.result !== 'undefined') {
            return supportEmphasis.result;
        }

        var div = document.createElement('div');
        var textEmphasisName = testStyle(div, 'TextEmphasis');
        var textEmphasisPositionName = testStyle(div, 'TextEmphasisPosition');
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
    }

    /**
     * do fakeEmphasis
     *
     * @param {Object} $el node.
     * @param {Object} markInfo .
     */
    function fakeEmphasis($el, markInfo) {
        var children = $el.children();
        var node;
        for (var i = 0, l = children.length; i < l; i++) {
            node = children[i];
            var className = node.className;
            // is generated span
            // TODO if it's needed.
            var isGeneratedSpan =
                    className.indexOf(classInlineBlockHash) !== -1 ||
                    className.indexOf(classInlineHash) !== -1;
            // is ignore html tag like style/script/textarea/input
            var nodeName = node.nodeName.toLowerCase();
            if (!(skipHtmlTagName[nodeName] || isGeneratedSpan)) {
                fakeEmphasis($(node), markInfo);
            }
        }

        var contents = $el.contents();
        var content;
        for (var j = 0, ll = contents.length; j < ll; j++) {
            content = contents[j];
            if (content.nodeType === 3) {
                textToHtml($(content), $el, markInfo);
            }
        }
    }

    /**
     * text node to html with mark
     *
     * @param {Object} $node text node.
     * @param {Object} $parent parent node.
     * @param {Object} markInfo .
     */
    function textToHtml($node, $parent, markInfo) {
        // jQuery must >= 1.4
        var fontSize = parseInt($parent.css('font-size'), 10);
        var lineHeight = getLineHeight($parent, fontSize);
        var markFontSize = fontSize / 2;

        // if not has enough space to place emphasis mark,
        // then use inline-block.
        var useInlineBlock = false;
        if (((lineHeight - fontSize) / 2) < markFontSize) {
            useInlineBlock = true;
        }

        // calculate mark style
        var useScale = supportScale();
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
        var uniqueFontClass = addBeforeCSSRule(
            'mark',
            useScale ? markInfo.position : markFontSize,
            markStyle
        );

        // add css rule for color
        var uniqueColorClass = '';
        if (markInfo.color) {
            uniqueColorClass = addBeforeCSSRule(
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
        var uniqueCharClass = addBeforeCSSRule(
            'char',
            markInfo.character,
            'content:\'' + markInfo.character + '\';'
        );

        // define position class
        var positionClass = positionClassMap[markInfo.position];

        // fake letterSpacing
        var letterSpacing = $parent.css('letter-spacing');
        var marginRightStyle = '';
        if (letterSpacing !== 'normal') {
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
    }

    /**
     * get line-height in 'px'
     *
     * TODO can't get the real line-height for this line.
     */
    function getLineHeight($el, fontSize) {
        var lineHeight = $el.css('line-height');
        if (lineHeight === 'normal') {
            return getNormalLineHeight(fontSize);
        } else if (lineHeight.match(/px/)) {
            return parseInt(lineHeight, 10);
        } else {
            return fontSize * lineHeight;
        }
    }

    /**
     * get line-height in 'px' when it equal to 'normal'.
     */
    function getNormalLineHeight(fontSize) {
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
        // TODO auto detect writingMode
        var writingMode = 'horizontal';

        // complete position
        if (this.position == null) {
            // not set position
            if (writingMode === 'vertical') {
                this.position = 'right';
            } else {
                if (isJapanese) {
                    this.position = 'over';
                } else {
                    // other language like chinese
                    this.position = 'under';
                }
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
            this.mark = writingMode === 'vertical' ? 'sesame' : 'circle';
        }
    };

    /**
     * Add text-emphasis fallback.
     * TODO
     *
     * @param {Object} $el .
     * @param {Object} style .
     */
    $.fn.emphasis = function(styleAndColor, position) {

        initCSSRule();

        var markInfo = new MarkInfo(styleAndColor, position);
        if (markInfo.error) {
            return;
        }
        markInfo.autoComplete();

        this.each(function(index, element) {
            var $el = $(element);

            var styleNames = supportEmphasis();
            if (styleNames) {
                // support css3 text-emphasis

                if (markInfo.isNone) {
                    // >> $('em').emphasis('none');

                    $el.css(styleNames[0], 'none');
                } else {
                    // >> $('em').emphasis('dot');

                    var cssInput = {};
                    cssInput[styleNames[0]] = '' +
                            (markInfo.filled ? 'filled' : 'open') +
                            ' ' +
                            markInfo.mark +
                            ' ' +
                            (markInfo.color || '');
                    cssInput[styleNames[1]] = markInfo.position;
                    $el.css(cssInput);
                }
            } else {
                // fallback

                if (markInfo.isNone) {
                    // >> $('em').emphasis('none');

                    $el.html($el.data(htmlHash));

                    // forget
                    $el.removeData(htmlHash);
                } else {
                    // >> $('em').emphasis('dot');

                    // remember
                    if (typeof $el.data(htmlHash) === 'undefined') {
                        // first time
                        // TODO not safe on IE, because of '`' character
                        $el.data(htmlHash, $el.html());
                    }

                    // calculate character
                    markInfo.character = markMap[markInfo.mark] ?
                        markMap[markInfo.mark][markInfo.filled ? 0 : 1] :
                        markInfo.mark.charAt(0);

                    fakeEmphasis($el, markInfo);
                }
            }
        });
    };

})(jQuery);
