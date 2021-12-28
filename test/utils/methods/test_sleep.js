const methods = require("../../../src/utils/methods.js");

const { assert, expect } = require("chai");

describe(
  "sleep",
  it(
    "sleeps",
    async () => {
      const stamp = Date.now();
      await methods.sleep(1);
      const after = Date.now();

      expect(after - stamp).to.be.within(1000, 1007);
    },
  ),
);
