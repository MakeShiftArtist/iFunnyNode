// @ts-check

import crypto from "crypto";
import url from "url";

/**
 * @typedef {import('../objects/Client.js').default} Client
 * @typedef {import('../utils/types').MemeExperience} MemeExperience
 */

/**
 * Asynchronously waits for a specified amount of time (in seconds)
 * @param {number} seconds Amount of seconds to sleep for
 * @returns {Promise<void>} A promise that is resolved when the sleep is complete
 */
export function sleep(seconds) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Creates a basic token for iFunny requests\
 * Basic auth tokens MUST be `156` characters long
 * Basic auth tokens *should* also be made using UUIDv4
 * @param {string} client_id Client installation Id for the basic token
 * @param {string} client_secret Client installation secret for the basic token
 * @returns {string} The basic auth token
 */
export function create_basic_token(client_id, client_secret) {
	let uuid = crypto.randomUUID().replace(/\-/g, "");
	let hex = crypto.createHash("sha256").update(uuid).digest("hex").toUpperCase();
	let a = hex + `_${client_id}:`;
	let b = hex + `:${client_id}:${client_secret}`;
	let c = crypto.createHash("sha1").update(b).digest("hex");
	return Buffer.from(a + c).toString("base64");
}

/**
 * Base paginator for API calls
 * @param {Client} client
 * @param {Object} opts Additional args for the paginator
 * @param {string} opts.url URL to request in the paginator
 * @param {string} opts.key Key to request in the paginator
 * @param {Object|url.URLSearchParams} [opts.params] Parameters for the api requests
 * @yields {Promise<unknown>}
 */
export async function* paginator(client, opts) {
	// Check required opts
	if (!opts.url || typeof opts.url !== "string") {
		throw new Error("No url provided");
	}
	if (!opts.key || typeof opts.key !== "string") {
		throw new Error("opts.key must be a string");
	}

	let hasNext = false;

	opts.params = opts.params ?? {};

	do {
		// Make request
		let { data } = await client.instance.request({
			url: opts.url,
			params: new url.URLSearchParams(opts.params ?? {}),
		});

		// Get iterable
		let items = data?.data?.[opts.key]?.items;
		if (!Array.isArray(items)) throw new Error(`Items not an array: ${items}`);

		// Store next variable
		hasNext = data?.data?.[opts.key]?.paging?.hasNext ?? false;
		if (hasNext) {
			opts.params.next = data.data[opts.key].paging.cursors.next;
		}

		for (let item of items) {
			yield item;
		}
		/*
		if (!hasNext) {
			console.log(data.data);
		}*/
	} while (hasNext);
}

/**
 * Paginates data using `POST` method and body for `next` and `limit` key
 * @param {Client} client Client to make requests with
 * @param {Object} opts
 * @param {string} opts.url Url to paginate with
 * @param {string} opts.key Key for the items[] array
 * @param {number} [opts.limit] Items to return per reuest
 * @param {Object|url.URLSearchParams} [opts.body] Body data for the requests
 */
export async function* post_body_paginator(client, opts) {
	// Check required opts
	if (!opts.url || typeof opts.url !== "string") {
		throw new Error("No url provided");
	}
	if (!opts.key || typeof opts.key !== "string") {
		throw new Error("opts.key must be a string");
	}
	opts.body = opts.body ?? {};

	let hasNext = false;

	do {
		// Make request
		let { data } = await client.instance.request({
			method: "POST",
			url: opts.url,
			data: opts.body ?? {},
		});

		// Get iterable
		let items = data?.data?.[opts.key]?.items;
		if (!Array.isArray(items)) throw new Error(`Items not an array: ${items}`);

		// Store next variable
		hasNext = data?.data?.[opts.key]?.paging?.hasNext ?? false;
		if (hasNext) {
			opts.body.next = data.data[opts.key].paging.cursors.next;
		}

		for (let item of items) {
			yield item;
		}
		/*
		if (!hasNext) {
			console.log(data.data);
		}*/
	} while (hasNext);
}

/**
 * Reduces badge data into it's own object inside the meme_experience object
 * @param {Object} experience Meme experience to format
 * @returns {MemeExperience}
 */
export function meme_xp(experience) {
	return {
		days: experience?.days ?? 0,
		next_milestone: experience?.next_milestone ?? null,
		rank: experience?.rank ?? "Meme Explorer",
		badge: {
			url: experience?.badge_url ?? "https://img.ifunny.co/meme_experience/0.png",
			size: experience?.badge_size ?? {
				w: 0,
				h: 0,
			},
		},
	};
}

export default {
	sleep,
	create_basic_token,
	paginator,
	post_body_paginator,
	meme_xp,
};
