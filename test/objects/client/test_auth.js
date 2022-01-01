import Client from "../../../src/objects/Client.js";

import { assert, expect } from "chai";

const EMAIL = process.env["IFUNNY_NODE_EMAIL"] ?? "";
const PASSWORD = process.env["IFUNNY_NODE_PASSWORD"] ?? "";

let client = new Client();
if (EMAIL === "" || PASSWORD === "") {
	this.skip();
}

try {
	await client.login({
		email: EMAIL,
		password: PASSWORD,
	});
} catch (err) {
	switch (err.message) {
		case "too_many_user_auths":
			break;
		case "captcha_required":
			break;
		case "access_token not given":
			break;
		default:
			client.authorized = false;
	}
}
describe("client auth", async () => {
	it("headers use basic token", async () => {
		let new_client = new Client();

		expect(new_client.headers["Authorization"]).to.match(
			/Basic [a-zA-Z0-9=]{156}/
		);
	});
	it("uses token passed into constructor", async () => {
		let new_client = new Client({ token: "foobar" });
		expect(new_client.headers["Authorization"]).to.equal("Bearer foobar");
	});
	beforeEach(async () => {
		if (!client.authorized) this.skip();
	});
	it("update headers on login", async () => {
		expect(client.headers["Authorization"]).to.match(/Bearer [a-z0-9]{64}/);
	});
	it("has valid headers", async () => {
		if (!client) {
			this.skip();
		}
		let headers = client.headers;
		expect(headers["Ifunny-Project-Id"]).to.equal("iFunny");
		expect(headers["accept"]).to.equal(
			"application/json,image/jpeg,image/webp,video/mp4"
		);
		expect(headers["applicationstate"]).to.equal(1);
		expect(headers["accept-language"]).to.equal("en-US");
		expect(headers["accept-encoding"]).to.equal("gzip");
		expect(typeof headers["User-Agent"]).to.equal("string");
	});
});
