import Client from "../../../src/objects/Client.js";

import { expect } from "chai";

describe("client", async () => {
	it("constructs with correct opts", () => {
		let prefix = "-";
		let token =
			"spamspamspamspamspamspamspamspamspamspamspamspamspamspamspamspam";
		let user = "foobar";
		let client = new Client({
			prefix: prefix,
			token: token,
			user_agent: user,
		});

		expect(client.prefix).to.equal(prefix);
		expect(client.bearer).to.equal(token);
		expect(client._user_agent).to.equal(user);
	});
});
