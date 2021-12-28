let Client = require("../../../src/objects/Client.js");

let { expect } = require("chai");

describe(
  "client basic token",
  it("can be generated", async () => {
    const it = new Client();

    it._config = {};
    expect(await it.basic_token).to.be.ok;
  }),
  it("can be regenerated", async () => {
    const it = new Client();

    it._config = {};
    const first = await it.basic_token;

    it._config = {};
    const second = await it.basic_token;

    expect(first).not.to.equal(second);
    expect(first.length).to.equal(second.length);
  }),
  it("it put in config", async () => {
    const it = new Client();

    it._config = { basic_token: "foobar" };

    expect(await it.basic_token).to.equal("foobar");
  }),
  it("is cached", async () => {
    const it = new Client();

    it._config = {};
    const first = await it.basic_token;

    expect(await it.basic_token).to.equal(first);
  }),
  it("is stored", async () => {
    const it = new Client();

    it._config = {};
    const first = await it.basic_token;

    expect(await (new Client()).basic_token).to.equal(first);
  }),
);
