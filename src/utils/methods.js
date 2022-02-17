// @ts-check
import VideoPost from "../objects/small/VideoPost.js";
import ImagePost from "../objects/small/ImagePost.js";

import crypto from "crypto";
import url from "url";

/**
 * @typedef {import('../objects/Client.js').default} Client
 */

/**
 * Capitalizes the first character of a string and makes the rest lowercase
 * @param {string} string
 * @returns {string} The capitalized version of the string
 * @example
 * capitalize("hElLO WoRld") // Hello world
 */
export function capitalize(string) {
	return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

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
 * @returns {string} The basic auth token
 */
export function create_basic_token() {
	let uuid = crypto.randomUUID().replace(/\-/g, "");
	let hex = crypto.createHash("sha256").update(uuid).digest("hex").toUpperCase();
	let a = hex + "_MsOIJ39Q28:";
	let b = hex + ":MsOIJ39Q28:PTDc3H8a)Vi=UYap";
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
 * @yields {Promise<any>}
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
 *
 * @param {Client} client Client to make requests with
 * @param {Object} opts
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
 * Returns the correct post class based on the post type
 * @param {Object} post The post to return correct type of
 * @param {Client} client
 * @returns {ImagePost|VideoPost}
 */
export function get_post_type(post, client) {
	if (!post) return null;
	switch (post.type) {
		case "caption":
		case "pic":
			return new ImagePost(post.id, this, { data: post });
		case "video_clip":
		case "gif":
			return new VideoPost(post.id, this, { data: post });
		default:
			throw new Error(`Post (${post.id}: Invalid post type: ${post.type}`);
	}
}

export default {
	capitalize,
	sleep,
	create_basic_token,
	paginator,
	get_post_type,
};
