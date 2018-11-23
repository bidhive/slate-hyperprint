'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _standalone = require('prettier/standalone');

var _standalone2 = _interopRequireDefault(_standalone);

var _parserBabylon = require('prettier/parser-babylon');

var _parserBabylon2 = _interopRequireDefault(_parserBabylon);

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

var _slate = require('slate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_OPTIONS = {
    preserveKeys: false,
    strict: false,
    prettier: {
        semi: false,
        singleQuote: true,
        tabWidth: 4
    }
};

function hyperprint(model, schema) {
    var optionsParam = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_OPTIONS;

    if (!model) {
        throw new Error('slate-hyperprint: Expected a Slate model');
    }

    if (!schema) {
        schema = _slate.Schema.create({});
    }

    var options = _extends({}, DEFAULT_OPTIONS, optionsParam);

    var printed = (0, _parse2.default)(model, schema, options).map(function (tag) {
        return tag.print(options);
    }).join('\n');

    var formatted = _standalone2.default.format(printed, _extends({}, options.prettier, {
        parser: 'babylon',
        plugins: [_parserBabylon2.default]
    }));

    var noSemi = formatted.trim().replace(/^;/, '');

    return noSemi;
}

// Directly print to the console
hyperprint.log = function (model, optionsParam
// eslint-disable-next-line no-console
) {
    return console.log(hyperprint(model, optionsParam));
};

exports.default = hyperprint;