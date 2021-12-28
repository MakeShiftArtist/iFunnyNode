let Client = require("../../../src/objects/Client.js");
let Endpoints = require("../../../src/utils/endpoints.js");

let { expect } = require("chai");

describe(
  "client",
  it("api", async () => {
    expect(await (new Client()).api).to.equal(Endpoints.base);
  }),
  it("headers", async () => {
    let client = new Client();
    const headers = await client.headers;

    expect(headers["Authorization"]).to.equal(
      "Basic " + await client.basic_token,
    );

    expect(headers["User-Agent"]).to.equal(client._user_agent);
    expect(headers["User-Agent"]).to.be.ok;
  }),
  it("config", async () => {
    expect(await (new Client()).config).to.be.ok;
  }),
);
