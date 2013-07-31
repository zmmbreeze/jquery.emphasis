/*global jQuery:false, document:false */

(function($) {
    // prevent duplicate
    // hash code from 'jquery.emphasis'
    var hash = '9a91ab9b8e64d2cf7fce0616b66efbaf';
    var argumentsHash = 'emphasisOldArguments' + hash;
    var textHash = 'emphasisOldText' + hash;
    var htmlHash = 'emphasisOldHtml' + hash;
    var classInlineBlockHash = 'js-jquery-emphasis-inline-block' + hash;
    var classInlineHash = 'js-jquery-emphasis-inline' + hash;
    var classMarkHash = 'js-jquery-emphasis-mark' + hash;

    var markMap = {
        dot: ['\u2022', '\u25E6'],
        circle: ['\u25CF', '\u25CB'],
        'double-circle': ['\u25C9', '\u25CE'],
        triangle: ['\u25B2', '\u25B3'],
        sesame: ['\uFE45', '\uFE46']
    };
    // TODO
    var ignoreCharacter = {
        // word-sperator
        // http://www.w3.org/TR/css3-text/#word-separator
        '\u0020': 1,
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
        '\u200A': 1
    };

    function addCSSRule(selector, rules, index) {
        var sheet = document.styleSheets[0];
        if (!sheet) {
            // if has no style element
            var style = document.createElement('style');
            $('head').eq(0).append(style);
            sheet = document.styleSheets[0];
        }
        if (sheet.insertRule) {
            sheet.insertRule(selector + '{' + rules + '}', index);
        } else {
            sheet.addRule(selector, rules, index);
        }
    }

    function initCSSRule() {
        if (initCSSRule.inited) {
            return;
        }
        initCSSRule.inited = true;
        addCSSRule('.' + classInlineBlockHash,
            'position:relative;' +
            'display:inline-block;_zoom:1;' +
            // reset style
            'float:none;' +
            'border:none;' +
            'margin:0;' +
            'padding:0 0 0.5em 0;' +
            'vertical-align: baseline;' +
            '*vertical-align: -0.5em;' +
            'color:inherit;' +
            'font-size:inherit;' +
            'text-decoration:inherit;' +
            'line-height:inherit;'
        );
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
            'text-decoration:inherit;' +
            'line-height:inherit;'
        );
        addCSSRule('.' + classMarkHash,
            'position:absolute;' +
            'bottom: 0;' +
            'left: 0;' +
            'height: 1em;' +
            'line-height: 1em;' +
            'text-align: center;' +
            // reset style
            'float:none;' +
            'border:none;' +
            'margin:0;' +
            'padding:0;' +
            'vertical-align: baseline;' +
            'color:inherit;' +
            'font-size: inherit;' +
            'text-decoration:inherit;'
        );
        addCSSRule('.' + classInlineHash + ' .' + classMarkHash,
            'bottom: -1em;'
        );
    }

    /**
     * test style
     *
     * @param {HTMLElement} dom .
     * @param {string} styleName .
     * @return {string|boolean} supported style name or `false`.
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
        if (supportScale.result != null) {
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
            result = false;
        }

        supportScale.result = result;
        return result;
    }

    /**
     * test emphasis support.
     *
     * @return {boolean|array} .
     */
    function supportEmphasis() {
        // TODO
        return false;
        if (supportEmphasis.result != null) {
            return supportEmphasis.result;
        }

        var div = document.createElement('div');
        var textEmphasisName = testStyle(div, 'TextEmphasis');
        var textEmphasisPositionName = testStyle(div, 'TextEmphasisPosition');
        var result;
        if (textEmphasisName && textEmphasisPositionName) {
            // support
            return [textEmphasisName, textEmphasisPositionName];
        } else {
            // not support
            result = false;
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
        var contents = $el.contents();
        var content;
        for (var j = 0, ll = contents.length; j < ll; j++) {
            content = contents[j];
            if (content.nodeType === 3) {
                textToHtml($(content), $el, markInfo);
            }
        }

        var children = $el.children();
        var node;
        for (var i = 0, l = children.length; i < l; i++) {
            node = children[i];
            var className = node.className;
            if (className !== classInlineBlockHash &&
                className !== classInlineHash) {
                fakeEmphasis($(node), markInfo);
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
                useScale[1] + ':bottom left;' +
                'width: 200%;';
        } else {
            markStyle = 'font-size:' + markFontSize + 'px;' +
                        'width: 100%;' +
                        'height:' + markFontSize + 'px;' +
                        'line-height:' + markFontSize + 'px;';
        }

        // generate html
        var prefixTag;
        var suffixTag;
        if (useInlineBlock) {
            prefixTag = '<span class="' + classInlineBlockHash + '">';
            suffixTag = '<span class="' + classMarkHash + '" style="' +
                             markStyle +
                        '">' +
                            markInfo.character +
                        '</span>' +
                        '</span>';
        } else {
            prefixTag = '<span class="' + classInlineHash + '">';
            suffixTag = '<span class="' + classMarkHash + '" style="' +
                            markStyle +
                        '">' +
                            markInfo.character +
                        '</span>' +
                        '</span>';
        }

        // update html
        $node.replaceWith(
            prefixTag +
                $node.text().split('').join(suffixTag + prefixTag) +
            suffixTag
        );
    }

    /**
     * get line-height in 'px'
     *
     * TODO can't get the real line-height for this line.
     */
    function getLineHeight($el, fontSize) {
        var lineHeight = $el.css('line-height');
        if (lineHeight === 'normal') {
            lineHeight = getNormalLineHeight(fontSize);
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
        if (getNormalLineHeight.result) {
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
        var lineHeight = tmp.height();
        getNormalLineHeight.result = lineHeight;
        return lineHeight;
    }

    /**
     * Add text-emphasis fallback.
     * TODO
     *
     * @param {Object} $el .
     * @param {Object} style .
     * @param {Object=} option
     *                      {
     *                          language: 'zh',
     *                          writingMode: 'vertical' // horizontal
     *                      }.
     */
    $.fn.emphasis = function(styleAndcolor, position, option) {
        var args = arguments;
        initCSSRule();
        var markInfo = {
            filled: true,
            mark: 'dot',
            color: 'red',
            position: 'under'
        };
        // TODO
        /*
        if (position == null) {
            // not set position
            if (option.writingMode === 'vertical') {
                position = 'right';
            } else {
                if (option.language === 'zh') {
                    position = 'under';
                } else {
                    position = 'over';
                }
            }
        }
        */
        this.each(function(index, element) {
            var $el = $(element);

            var styleNames;
            if (styleNames = supportEmphasis()) {
                if (markInfo != null) {
                    var cssInput = {};
                    cssInput[styleNames[0]] = '' +
                            (markInfo.filled ? 'filled' : 'open') +
                            ' ' +
                            markInfo.mark +
                            ' ' +
                            markInfo.color;
                    cssInput[styleNames[1]] = markInfo.position;
                    $el.css(cssInput);
                } else {
                    $el.css(styleNames[0], 'none');
                }
            } else {
                if (markInfo != null) {
                    // remember
                    $el.data(argumentsHash, args);
                    if (typeof $el.data(htmlHash) === 'undefined') {
                        // first time
                        // TODO not safe on IE, because of '`' character
                        $el.data(htmlHash, $el.html());
                        $el.data(textHash, $el.text());
                    }

                    // calculate character
                    markInfo.character = markMap[markInfo.mark] ?
                        markMap[markInfo.mark][markInfo.filled ? 0 : 1] :
                        markInfo.mark.charAt(0);
                    fakeEmphasis($el, markInfo);
                } else {
                    // forget
                    $el.removeData(argumentsHash);
                    $el.removeData(htmlHash);
                    $el.removeData(textHash);

                    $el.html($el.emphasisHtml());
                }
            }
        });
    };

    $.fn.emphasisHtml = function(newString) {
        var oldHtml = this.data(htmlHash);
        if (newString == null) {
            // $('foo').text();
            if (oldHtml) {
                // emphasised
                return oldHtml;
            } else {
                // pure text
                return $.fn.html.apply(this, arguments);
            }
        } else {
            // $('foo').text('string');
            var result = $.fn.html.apply(this, arguments);
            if (oldHtml) {
                // if it was emphasised, them emphasis again.
                this.emphasis.apply(this, this.data(argumentsHash));
            }
            return result;
        }
    };

    $.fn.emphasisText = function(newString) {
        var me = this;
        var result = '';

        this.each(function(index, element) {
            var $el = $(element);
            var oldText = $el.data(textHash);
            if (newString == null) {
                // $('foo').text();
                if (oldText) {
                    // emphasised
                    result += oldText;
                } else {
                    // pure text
                    result += $.fn.text.call($el, newString);
                }
            } else {
                // $('foo').text('string');
                $.fn.text.call($el, newString);
                if (oldText) {
                    // if it was emphasised, them emphasis again.
                    $el.emphasis.apply($el, $el.data(argumentsHash));
                }
            }
        });

        if (newString == null) {
            return result;
        } else {
            return this;
        }
    };

})(jQuery);
