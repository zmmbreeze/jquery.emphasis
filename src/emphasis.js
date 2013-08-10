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
