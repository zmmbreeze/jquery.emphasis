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

