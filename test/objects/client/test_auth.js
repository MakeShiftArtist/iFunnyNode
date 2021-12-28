let Client = require("../../../src/objects/Client.js");

let { expect } = require("chai");

const EMAIL = process.env["IFUNNY_NODE_EMAIL"] ?? "";
const PASSWORD = process.env["IFUNNY_NODE_PASSWORD"] ?? "";

beforeEach(async function () {
  if (EMAIL === "" || PASSWORD === "") {
    this.skip();
  }

  this.client = new Client();
  await this.client.login(EMAIL, PASSWORD);
});

describe(
  "client auth",
  it("gets properties", async function () {
    // TODO
  }),
);
