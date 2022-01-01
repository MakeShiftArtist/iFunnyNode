import { capitalize } from "../../../src/utils/methods.js";

import { assert, expect } from "chai";

const cases = [
	["uppercase", "Uppercase"],
	["Uppercase", "Uppercase"],
	["-lowercase", "-lowercase"],
	[" lowercase", " lowercase"],
];
describe("capitalize", async () => {
	it("capitalizes leading letter characters", () => {
		for (let it of cases) {
			expect(capitalize(it[0])).to.be.equal(it[1]);
		}
	});
});
