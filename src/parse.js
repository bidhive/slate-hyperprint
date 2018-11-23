// @flow
import type { SlateModel, SlateSchema } from "./types";
import type { Options } from "./options";
import Tag from "./tag";
import { printString } from "./utils";

// All Tag parsers
const PARSERS = {
  value: (value, schema, options) => [
    Tag.create({
      name: "value",
      attributes: getAttributes(value, schema, options),
      children: parse(value.document, schema, options)
    })
  ],
  // COMPAT
  state: (state, schema, options) => PARSERS.value(state, schema, options),
  document: (document, schema, options) => [
    Tag.create({
      name: "document",
      attributes: getAttributes(document, schema, options, false),
      children: document.nodes.flatMap(node => parse(node, schema, options)).toArray()
    })
  ],
  block: (block, schema, options) => [
    Tag.create({
      name: canPrintAsShorthand(block) ? block.type : block.object,
      attributes: getAttributes(block, schema, options, canPrintAsShorthand(block)),
      children: schema.isVoid(block) ? [] : block.nodes.flatMap(node => parse(node, schema, options)).toArray()
    })
  ],
  inline: (inline, schema, options) => [
    Tag.create({
      name: canPrintAsShorthand(inline) ? inline.type : inline.object,
      attributes: getAttributes(inline, schema, options, canPrintAsShorthand(inline)),
      children: schema.isVoid(inline) ? [] : inline.nodes.flatMap(node => parse(node, schema, options)).toArray()
    })
  ],
  text: (text, schema, options) => {
    // COMPAT
    const leaves = text.getLeaves ? text.getLeaves() : text.getRanges();
    const leavesTags = leaves.flatMap(leaf => parse(leaf, schema, options)).toArray();
    if (options.preserveKeys) {
      return [
        Tag.create({
          name: "text",
          attributes: { key: text.key },
          children: leavesTags
        })
      ];
    } else if (options.strict && text.text === "") {
      return [
        Tag.create({
          name: "text",
          children: leavesTags
        })
      ];
    }

    return leavesTags;
  },
  leaf: (leaf, schema, options) =>
    leaf.marks.reduce(
      (acc, mark) => [
        Tag.create({
          name: canPrintAsShorthand(mark) ? mark.type : mark.object,
          attributes: getAttributes(mark, schema, options, canPrintAsShorthand(mark)),
          children: acc
        })
      ],
      [
        {
          print: () => printString(leaf.text)
        }
      ]
    ),
  // COMPAT
  range: (range, schema, options) => PARSERS.leaf(range, schema, options)
};

/*
 * Returns attributes (with or without key)
 */
function getAttributes(
  model: SlateModel,
  schema: SlateSchema,
  options: Options,
  // True to spread the data as attributes.
  // False to keep it under `data` and to make `type` explicit
  asShorthand: boolean = true
): Object {
  let result = {};

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
    result = { ...result, ...model.data.toJSON() };
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
function parse(model: SlateModel, schema: SlateSchema, options: Options): Tag[] {
  const object = model.object || model.kind;
  const parser = PARSERS[object];
  if (!parser) {
    throw new Error(`Unrecognized Slate model ${object}`);
  }
  return parser(model, schema, options);
}

/*
 * True if the model can be print using the shorthand syntax 
 * (data spread into attributes)
 */
function canPrintAsShorthand(model: SlateModel): boolean {
  const validAttributeKey = key => /^[a-zA-Z]/.test(key);

  return model.data.every((value, key) => validAttributeKey(key));
}

export default parse;
