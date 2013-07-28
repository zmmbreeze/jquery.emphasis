/*global jQuery:false */

(function($) {
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
     * @param {String} styleAdColor .
     * @param {String} position .
     */
    function emphasis(element, styleAndcolor, position) {
        var styleNames;
        var $el = $(element);
        if (styleNames = supportEmphasis()) {
            if (position) {
                $el.css(styleNames[1], position);
            }
            $el.css(styleNames[0], styleAndcolor);
        } else {
            //
        }
        console.log(styleNames);
    }


    $.fn.emphasis = function(styleAndcolor, position) {
        this.each(function(index, element) {
            emphasis(element, styleAndcolor, position);
        });
    };
})(jQuery);
