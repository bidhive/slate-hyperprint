import assert from "assert";
import fs from "fs";
import { basename, extname, resolve } from "path";
import { KeyUtils, Schema } from "slate";
import hyperprint from "../src";

const schema = Schema.create({
  blocks: {
    image: {
      isVoid: true
    }
  },
  inlines: {
    link: {
      isVoid: true
    }
  }
})

/**
 * Tests.
 */

describe("slate-hyperprint", () => {
  const fixturesDir = resolve(__dirname, "./fixtures");
  const tests = fs
    .readdirSync(fixturesDir)
    .filter(t => t[0] != ".")
    .map(t => basename(t, extname(t)));

  tests.forEach(test => {
    it(test, () => {
      KeyUtils.resetGenerator();
      // eslint-disable-next-line
      const module = require(resolve(fixturesDir, test));
      const { input, output, options } = module;
      const actual = hyperprint(input, schema, options);
      const expected = output.trim();

      assert.equal(actual, expected);
    });
  });
});
