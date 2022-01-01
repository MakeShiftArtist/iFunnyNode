import Client from "../../../src/objects/Client.js";

import { expect } from "chai";

describe("client basic token", async () => {
	it("can be generated", async () => {
		const it = new Client();

		// Saves basic
		let saved_basic = it.basic_token;

		// Changes basic
		it._config.basic_token = null;

		// Makes new basic token
		expect(it.basic_token).to.be.ok;

		// resets basic token
		it._config.basic_token = saved_basic;
		it.config = it._config;
	}),
		it("can be regenerated", async () => {
			const it = new Client();

			// Store token to not mess up config file
			let saved_basic = it.basic_token;

			// 1. New basic token
			it._config.basic_token = null;
			const first = it.basic_token;

			// 2. New basic token
			it._config.basic_token = null;
			const second = it.basic_token;

			// Different tokens
			expect(first).not.to.equal(second);
			// Same length
			expect(first.length).to.equal(second.length);

			// Reset config file
			it._config.basic_token = saved_basic;
			it.config = it._config;
		}),
		it("is put in config", async () => {
			const it = new Client();

			let saved_basic = it.basic_token;

			it._config.basic_token = "foobar";

			expect(it.basic_token).to.equal("foobar");

			it._config.basic_token = saved_basic;
			it.config = it._config;
		}),
		it("is cached", async () => {
			const it = new Client();

			let first = it.basic_token;

			let second = it.basic_token;

			expect(first).to.equal(second);
		}),
		it("is stored", async () => {
			const it = new Client();

			const first = it.basic_token;

			expect(new Client().basic_token).to.equal(first);
		});
});
