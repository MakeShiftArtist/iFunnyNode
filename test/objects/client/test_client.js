let Client = require("../../../src/objects/Client.js");

let { expect } = require("chai");

describe(
  "client",
  it("constructs", () => {
    const it = new Client({ prefix: "-", token: "foobar" });

    expect(it.prefix).to.equal("-");
    expect(it._token).to.equal("foobar");
  }),
);
