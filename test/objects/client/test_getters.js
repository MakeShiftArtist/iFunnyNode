import Client from "../../../src/objects/Client.js";
import Endpoints from "../../../src/utils/endpoints.js";

import { expect } from "chai";
beforeEach(function () {
	console.log(this.currentTest.title);
});

describe(
	"client",
	it("api", async () => {
		expect(new Client().api).to.equal(Endpoints.base);
	}),
	it("headers", async () => {
		let client = new Client();
		let headers = client.headers;

		expect(headers["Authorization"]).to.equal(
			"Basic " + client.basic_token
		);

		expect(headers["User-Agent"]).to.equal(client._user_agent);
		expect(headers["User-Agent"]).to.be.ok;
	}),
	it("config", async () => {
		expect(new Client().config).to.be.ok;
	})
);
