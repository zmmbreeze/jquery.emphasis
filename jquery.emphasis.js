/*global jQuery:false, document:false */

(function($) {
    // prevent duplicate
    // hash code from 'jquery.emphasis'
    var hash = '9a91ab9b8e64d2cf7fce0616b66efbaf';
    var htmlHash = 'emphasisOldHtml' + hash;
    var classInlineBlockHash = 'js-jquery-emphasis-inline-block' + hash;
    var classInlineHash = 'js-jquery-emphasis-inline' + hash;
    var classMarkHash = 'js-jquery-emphasis-mark' + hash;

    var uniqueId = 0;
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
        '\u200A': 1
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
            styleSheet.insertRule(selector + '{' + rules + '}', styleSheet.cssRules.length);
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
        var styleForBeforeClass =
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
            'text-decoration:inherit;';
        addCSSRule('.' + classInlineHash + ':before', styleForBeforeClass);
        addCSSRule('.' + classInlineBlockHash + ':before', styleForBeforeClass);
        addCSSRule('.' + classInlineHash + ' .' + classMarkHash,
            'bottom: -1em;'
        );
    }

    var markHasCssRule = {};
    function addBeforeCSSRule(mark, style) {
        if (markHasCssRule[mark]) {
            return markHasCssRule[mark];
        }

        var className = classMarkHash + (uniqueId++);
        addCSSRule('.' + className + ':before', style);
        markHasCssRule[mark] = className;
        return className;
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
        var children = $el.children();
        var node;
        for (var i = 0, l = children.length; i < l; i++) {
            node = children[i];
            var className = node.className;
            // is generated span
            // TODO if it's needed.
            var isGeneratedSpan = false;
                            //className.indexOf(classInlineBlockHash) !== -1 ||
                            //className.indexOf(classInlineHash) !== -1;
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
                useScale[1] + ':bottom left;' +
                'width: 200%;';
        } else {
            markStyle = 'font-size:' + markFontSize + 'px;' +
                        'width: 100%;' +
                        'height:' + markFontSize + 'px;' +
                        'line-height:' + markFontSize + 'px;';
        }

        // generate html
        var normalClass =
            (useInlineBlock ? classInlineBlockHash : classInlineHash);
        var uniqueClass = addBeforeCSSRule(
            markInfo.character,
            'content:\'' + markInfo.character + '\';' +
            markStyle
        );
        var prefixTag = '<span class="' +
                            normalClass + ' ' +
                            uniqueClass + '">';
        var suffixTag = '</span>';

        // update html
        /*
        $node.replaceWith(
            prefixTag +
                $node.text().split('').join(suffixTag + prefixTag) +
            suffixTag
        );
        */
        var text = $node.text();
        var c;
        var html = [
            /*
            '<style>',
                '.' + uniqueClass + ':before {',
                    'content:\'' + markInfo.character + '\';',
                '}',
            '</style>'
            */
        ];
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
                // support css3 text-emphasis

                if (markInfo != null) {
                    // >> $('em').emphasis('dot');

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
                    // >> $('em').emphasis('none');

                    $el.css(styleNames[0], 'none');
                }
            } else {
                // fallback

                if (markInfo != null) {
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
                } else {
                    // >> $('em').emphasis('none');

                    $el.html($el.data(htmlHash));

                    // forget
                    $el.removeData(htmlHash);

                }
            }
        });
    };

})(jQuery);
