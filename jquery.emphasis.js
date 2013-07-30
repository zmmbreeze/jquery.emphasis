/*global jQuery:false, document:false */

(function($) {
    var markMap = {
        dot: ['\u2022', '\u25E6'],
        circle: ['\u25CF', '\u25CB'],
        'double-circle': ['\u25C9', '\u25CE'],
        triangle: ['\u25B2', '\u25B3'],
        sesame: ['\uFE45', '\uFE46']
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
        addCSSRule('.js-jquery-emphasis-inline-block',
            'position:relative;' +
            'display:inline-block;zoom:1;' +
            // reset style
            'float:none;' +
            'border:none;' +
            'margin:0;' +
            'padding:0 0 0.5em 0;' +
            'vertical-align: baseline;' +
            '*vertical-align: -0.5em;' +
            'color:inherit;' +
            'font-size:inherit;' +
            'text-decoration:inherit'
        );
        addCSSRule('.js-jquery-emphasis-inline',
            'position:relative;' +
            // reset style
            'float:none;' +
            'border:none;' +
            'margin:0;' +
            'padding:0;' +
            'vertical-align: baseline;' +
            'color:inherit;' +
            'font-size:inherit;' +
            'text-decoration:inherit'
        );
        addCSSRule('.js-jquery-emphasis-mark',
            'position:absolute;' +
            'bottom: 0;' +
            'left: 0;' +
            'font-size: 0.5em;' +
            'width: 2em;' +
            'height: 1em;' +
            'line-height: 1em;' +
            'text-align: center;' +
            '-webkit-text-size-adjust:none;'
        );
        addCSSRule('.js-jquery-emphasis-inline .js-jquery-emphasis-mark',
            'bottom: -1em;'
        );
    }

    /**
     * test style
     *
     * @param {HTMLElement} dom .
     * @param {string} styleName .
     * @return {string|boolean} .
     */
    function testStyle(dom, styleName) {
        if (dom.style[styleName.charAt(0).toLowerCase() + styleName.slice(1)] === '') {
            return '';
        }
        var prefixs = ['webkit', 'moz', 'o', 'ms'];
        for (var i = 0, l = prefixs.length; i < l; i++) {
            if (dom.style[prefixs[i] + styleName] === '') {
                return prefixs[i];
            }
        }
        return false;
    }

    /**
     * test emphasis support
     * @return {boolean|array} .
     */
    function supportEmphasis() {
        if (supportEmphasis.result != null) {
            return supportEmphasis.result;
        }

        var div = document.createElement('div');
        var prefix = testStyle(div, 'TextEmphasis');
        var result;
        // TODO
        prefix = false;
        if (prefix !== false) {
            // support
            if (!prefix) {
                // ''
                result = (div.style.textEmphasisPosition === '') ?
                    ['textEmphasis', 'textEmphasisPosition'] :
                    false;
            } else {
                // has prefix
                result = (div.style[prefix + 'TextEmphasisPosition'] === '') ?
                    [prefix + 'TextEmphasis', prefix + 'TextEmphasisPosition'] :
                    false;
            }
        } else {
            // not support
            result = false;
        }

        supportEmphasis.result = result;
        return result;
    }

    /**
     * Add text-emphasis fallback.
     *
     * @param {HTMLElement} element .
     * @param {Object} style .
     * @param {Object=} option
     *                      {
     *                          language: 'zh',
     *                          writingMode: 'vertical' // horizontal
     *                      }.
     */
    function emphasis(element, style, option) {
        var styleNames;
        var $el = $(element);
        if (styleNames = supportEmphasis()) {
            if (style != null) {
                var cssInput = {};
                cssInput[styleNames[0]] = '' +
                        (style.filled ? 'filled' : 'open') +
                        ' ' +
                        style.mark +
                        ' ' +
                        style.color;
                cssInput[styleNames[1]] = style.position;
                $el.css(cssInput);
            } else {
                $el.css(styleNames[0], 'none');
            }
        } else {
            if (style != null) {
                fakeEmphasis(element, style, option);
            } else {
                removeFakeEmphasis($el);
            }
        }
    }

    function removeFakeEmphasis($el) {
        $el.text($el.text());
    }

    function fakeEmphasis(element, style, option) {
        style.character = markMap[style.mark] ?
            markMap[style.mark][style.filled ? 0 : 1] :
            style.mark.charAt(0);
        makeTemplate(element, style);
    }


    function makeTemplate(el, markInfo) {
        var $el = $(el);
        // jQuery must >= 1.4
        var fontSize = parseInt($el.css('font-size'), 10);
        var lineHeight = getLineHeight($el, fontSize);
        var markFontSize = fontSize / 2;

        // if not has enough space to place emphasis mark,
        // then use inline-block.
        var useInlineBlock = false;
        if (((lineHeight - fontSize) / 2) < markFontSize) {
            useInlineBlock = true;
        }

        var notUseEm = false;
        if (markFontSize < 12) {    // for chrome like browser has minimal font-size
            notUseEm = true;
        }

        var prefixTag;
        var suffixTag;
        if (useInlineBlock) {
            prefixTag = '<span class="js-jquery-emphasis-inline-block"">';
            suffixTag = '<span class="js-jquery-emphasis-mark" style="' +
                            (notUseEm ?
                                'width:' + fontSize + 'px;' +
                                'height:' + markFontSize + 'px;' +
                                'line-height:' + markFontSize + 'px;':
                                '') +
                        '">' +
                            markInfo.character +
                        '</span>' +
                        '</span>';
        } else {
            prefixTag = '<span class="js-jquery-emphasis-inline">';
            suffixTag = '<span class="js-jquery-emphasis-mark" style="' + 
                            (notUseEm ?
                                'width:' + fontSize + 'px;' +
                                'height:' + markFontSize + 'px;' +
                                'line-height:' + markFontSize + 'px;':
                                '') +
                        '">' +
                            markInfo.character +
                        '</span>' +
                        '</span>';
        }

        $el.html(prefixTag +
                    $el.text().split('').join(suffixTag + prefixTag) +
                    suffixTag);
    }

    /**
     * get line-height in 'px'
     *
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

    $.fn.emphasis = function(styleAndcolor, position, option) {
        initCSSRule();
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
            emphasis(
                element,
                {
                    filled: true,
                    mark: 'dot',
                    color: 'red',
                    position: 'under'
                },
                option
            );
        });
    };
})(jQuery);
