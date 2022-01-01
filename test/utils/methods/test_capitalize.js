import { capitalize } from "../../../src/utils/methods.js";

import { assert, expect } from "chai";

describe(
	"capitalize",
	it("capitalizes leading letter characters", () => {
		const cases = [
			["uppercase", "Uppercase"],
			["Uppercase", "Uppercase"],
			["-lowercase", "-lowercase"],
			[" lowercase", " lowercase"],
		];

		for (const it of cases) {
			assert.equal(capitalize(it[0]), it[1]);
		}

		assert.equal(1, 1);
	})
);
