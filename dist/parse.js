"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _tag = require("./tag");

var _tag2 = _interopRequireDefault(_tag);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// All Tag parsers
var PARSERS = {
  value: function value(_value, schema, options) {
    return [_tag2.default.create({
      name: "value",
      attributes: getAttributes(_value, schema, options),
      children: parse(_value.document, schema, options)
    })];
  },
  // COMPAT
  state: function state(_state, schema, options) {
    return PARSERS.value(_state, schema, options);
  },
  document: function document(_document, schema, options) {
    return [_tag2.default.create({
      name: "document",
      attributes: getAttributes(_document, schema, options, false),
      children: _document.nodes.flatMap(function (node) {
        return parse(node, schema, options);
      }).toArray()
    })];
  },
  block: function block(_block, schema, options) {
    return [_tag2.default.create({
      name: canPrintAsShorthand(_block) ? _block.type : _block.object,
      attributes: getAttributes(_block, schema, options, canPrintAsShorthand(_block)),
      children: schema.isVoid(_block) ? [] : _block.nodes.flatMap(function (node) {
        return parse(node, schema, options);
      }).toArray()
    })];
  },
  inline: function inline(_inline, schema, options) {
    return [_tag2.default.create({
      name: canPrintAsShorthand(_inline) ? _inline.type : _inline.object,
      attributes: getAttributes(_inline, schema, options, canPrintAsShorthand(_inline)),
      children: schema.isVoid(_inline) ? [] : _inline.nodes.flatMap(function (node) {
        return parse(node, schema, options);
      }).toArray()
    })];
  },
  text: function text(_text, schema, options) {
    // COMPAT
    var leaves = _text.getLeaves ? _text.getLeaves() : _text.getRanges();
    var leavesTags = leaves.flatMap(function (leaf) {
      return parse(leaf, schema, options);
    }).toArray();
    if (options.preserveKeys) {
      return [_tag2.default.create({
        name: "text",
        attributes: { key: _text.key },
        children: leavesTags
      })];
    } else if (options.strict && _text.text === "") {
      return [_tag2.default.create({
        name: "text",
        children: leavesTags
      })];
    }

    return leavesTags;
  },
  leaf: function leaf(_leaf, schema, options) {
    return _leaf.marks.reduce(function (acc, mark) {
      return [_tag2.default.create({
        name: canPrintAsShorthand(mark) ? mark.type : mark.object,
        attributes: getAttributes(mark, schema, options, canPrintAsShorthand(mark)),
        children: acc
      })];
    }, [{
      print: function print() {
        return (0, _utils.printString)(_leaf.text);
      }
    }]);
  },
  // COMPAT
  range: function range(_range, schema, options) {
    return PARSERS.leaf(_range, schema, options);
  }
};

/*
 * Returns attributes (with or without key)
 */
function getAttributes(model, schema, options) {
  var asShorthand = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  var result = {};

  // type
  if (!asShorthand && model.type) {
    result.type = model.type;
  }

  // key
  if (options.preserveKeys && model.key) {
    result.key = model.key;
  }

  // data
  if (!asShorthand && !model.data.isEmpty()) {
    result.data = model.data.toJSON();
  } else {
    // Spread the data as individual attributes
    result = _extends({}, result, model.data.toJSON());
  }

  // isVoid
  if (!asShorthand && schema.isVoid(model)) {
    result.isVoid = true;
  }

  return result;
}

/*
 * Parse a Slate model to a Tag representation
 */
function parse(model, schema, options) {
  var object = model.object || model.kind;
  var parser = PARSERS[object];
  if (!parser) {
    throw new Error("Unrecognized Slate model " + object);
  }
  return parser(model, schema, options);
}

/*
 * True if the model can be print using the shorthand syntax 
 * (data spread into attributes)
 */
function canPrintAsShorthand(model) {
  var validAttributeKey = function validAttributeKey(key) {
    return (/^[a-zA-Z]/.test(key)
    );
  };

  return model.data.every(function (value, key) {
    return validAttributeKey(key);
  });
}

exports.default = parse;