import Client from "../../../src/objects/Client.js";

import { expect } from "chai";

describe(
	"client",
	it("constructs", () => {
		const it = new Client({
			prefix: "-",
			token: "foobar",
			user_agent: "spam",
		});

		expect(it.prefix).to.equal("-");
		expect(it._token).to.equal("foobar");
		expect(it._user_agent).to.equal("spam");
	})
);
