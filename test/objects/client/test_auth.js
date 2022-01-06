import Client from "../../../src/objects/Client.js";

import { expect } from "chai";

const EMAIL = process.env["IFUNNY_NODE_EMAIL"] ?? "";
const PASSWORD = process.env["IFUNNY_NODE_PASSWORD"] ?? "";
let skip = false;

const client = new Client();
let config = client.config;

beforeEach(async () => {
	skip = false;
	if (EMAIL === "" || PASSWORD === "") {
		skip = true;
	}

	client.config = config;

	try {
		await client.login({
			email: EMAIL,
			password: PASSWORD,
		});
	} catch (err) {
		skip = true;
	}
});
after(async () => {
	client.config = config;
});
describe("client auth", async () => {
	it("headers use basic token", async () => {
		const new_client = new Client();

		expect(new_client.headers["Authorization"]).to.match(
			/Basic [a-zA-Z0-9=]{156}/
		);
	});
	it("uses token passed into constructor", async () => {
		let token =
			"spamspamspamspamspamspamspamspamspamspamspamspamspamspamspamspam";
		const new_client = new Client({ token: token });
		expect(new_client.headers["Authorization"]).to.equal(`Bearer ${token}`);
	});

	it("rejects bad bearers", async () => {
		let token = "foo";
		expect(() => new Client({ token: token })).to.throw(
			Error,
			`Invalid bearer token: ${token}`
		);
		expect(() => (new Client().bearer = token)).to.throw(
			Error,
			`Invalid bearer token: ${token}`
		);

		expect(() => (new Client().bearer = [token])).to.throw(
			TypeError,
			`Token must be a String, not ${typeof [token]}`
		);
	});
	it("update headers on login", async () => {
		client.on("login", async () => {
			expect(client.headers["Authorization"]).to.match(
				/Bearer [a-z0-9]{64}/
			);
		});
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
