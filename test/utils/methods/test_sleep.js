import { sleep } from "../../../src/utils/methods.js";

import { expect } from "chai";

describe("sleep", async () => {
	it("sleeps", async () => {
		const stamp = Date.now();
		await sleep(1);
		const after = Date.now();

		expect(after - stamp).to.be.within(995, 1020);
	});
});
