"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slate = require("slate");

exports.default = _slate.Schema.create({
  blocks: {
    image: {
      isVoid: true
    }
  }
});