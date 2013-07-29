/*global jQuery:false, document:false */

(function($) {
    var markMap = {
        dot: ['\u2022', '\u25E6'],
        circle: ['\u25CF', '\u25CB'],
        'double-circle': ['\u25C9', '\u25CE'],
        triangle: ['\u25B2', '\u25B3']
    };

    function addCSSRule(selector, rules, index) {
        var sheet = document.styleSheets[0];
        if(sheet.insertRule) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        } else {
            sheet.addRule(selector, rules, index);
        }
    }

    function initCSSRule() {
        addCSSRule('.js-jquery-emphasis-inline-block',
            'position:relative;' +
            'display:inline-block; zoom:1;'
        );
        addCSSRule('.js-jquery-emphasis-inline',
            'position:relative;' +
            ''
        );
        addCSSRule('.js-jquery-emphasis-mark',
            'position:absolute;'
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
        if (dom.style[styleName[0].toLowerCase() + styleName.slice(1)] === '') {
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
     * @param {string} styleAdColor .
     * @param {string} position .
     * @param {Object=} option 
     *                      {
     *                          language: 'zh',
     *                          writingMode: 'vertical' // horizontal
     *                      }.
     */
    function emphasis(element, styleAndColor, position, option) {
        var styleNames;
        var $el = $(element);
        /*
        if (styleNames = supportEmphasis()) {
            if (position) {
                $el.css(styleNames[1], position);
            }
            $el.css(styleNames[0], styleAndColor);
        } else {
        */
            fakeEmphasis(element, styleAndColor, position, option);
        // }
    }

    function fakeEmphasis(element, styleAndColor, position, option) {
        if (styleAndColor === 'none') {
            // TODO revert
        } else {
            makeTemplate(element);
        }
    }

    function calculateMarkInfo(element, styleAndColor, position, option) {
        // TODO
        var tmp = styleAndColor.split(' ');
        var styleAndMark = tmp[0];
        tmp = styleAndMark.split(' ');
        var style;
        var mark;
        if (tmp[0] === 'filled' || tmp[0] === 'open') {
            style = tmp[0];
            mark = markMap[tmp[1]];
        } else {
            style = tmp[1];
            mark = markMap[tmp[0]];
        }
        var color = tmp[1];

        return {
            position: position,
            mark: mark,
            color: color,
            style: style
        }
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

        var prefixTag;
        var suffixTag;
        if (useInlineBlock) {
            prefixTag = '<span class="js-jquery-emphasis-inline-block">';
            suffixTag = '<span class="js-jquery-emphasis-mark">' +
                            markInfo.mark +
                        '</span>' +
                        '</span>';
        } else {
            prefixTag = '<span class="js-jquery-emphasis-inline">';
            suffixTag = '<span class="js-jquery-emphasis-mark">' +
                            markInfo.mark +
                        '</span>' +
                        '</span>';
        }

        $el.html('<span class="js-jquery-emphasis">' +
                 $el.text().split('').join('</span><span>') +
                '</span>');
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
            emphasis(element, styleAndcolor, position, option);
        });
    };
})(jQuery);
