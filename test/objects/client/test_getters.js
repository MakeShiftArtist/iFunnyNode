import Client from "../../../src/objects/Client.js";
import Endpoints from "../../../src/utils/endpoints.js";

import { expect } from "chai";

describe("client", async () => {
	it("correct api", async () => {
		expect(new Client().api).to.equal(Endpoints.base);
	});
	it("user agent", async () => {
		let client = new Client();
		let headers = client.headers;

		expect(headers["User-Agent"]).to.equal(client._user_agent);
	});
	it("config is ok", async () => {
		expect(new Client().config).to.be.ok;
	});
});
