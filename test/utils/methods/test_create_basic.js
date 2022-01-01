import { expect } from "chai";
import { create_basic_token as basic_token } from "../../../src/utils/methods.js";
import Client from "../../../src/objects/Client.js";

describe("create_basic_token", async () => {
	let client = new Client();
	it("is valid basic auth", async () => {
		expect(basic_token().length).to.equal(client.basic_token.length);
	});
});
