/* @flow */

import type { Value, Document, Block, Inline, Text, Range, Schema } from 'slate';

export type SlateModel = Value | Document | Block | Inline | Text | Range;
export type SlateSchema = Schema;
