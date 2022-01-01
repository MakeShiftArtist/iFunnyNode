import { sleep } from "../../../src/utils/methods.js";

import { expect } from "chai";

describe(
	"sleep",
	it("sleeps", async () => {
		const stamp = Date.now();
		await sleep(1);
		const after = Date.now();

		expect(after - stamp).to.be.within(1000, 1020);
	})
);
