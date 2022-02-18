// @ts-check

import Comment from "../Comment.js";

/** @typedef {import('../Client.js').default} Client */

/**
 * Placeholder for Reply Object
 * @extends Comment
 * @see {@link Reply}
 */
export default class Reply extends Comment {
	/**
	 *
	 * @param {Object} comment The comment payload to build the comment off of
	 * @param {Client} client
	 * @param {Object} [opts] Optional args for the constructor
	 * @param {string} [opts.url] Url to make requests to
	 * @param {Object} [opts.data] Data to add to the payload
	 */
	constructor(comment, client, opts = {}) {
		super(comment, client, opts);
	}

	/**
	 * The comment this comment was replying to
	 * @type {Promise<Comment|Reply>}
	 */
	get parent_comment() {
		return (async () => {
			let parent = await this.get("parent_comm_id");
			if (!parent) return null;
			return await this.client.get_comment({ id: parent, cid: await this.post_id });
		})();
	}

	/**
	 * Gets the root comment of this reply
	 * @type {Promise<Comment|Reply>}
	 */
	get root_comment() {
		return (async () => {
			let parent = await this.get("root_comm_id");
			if (!parent) return null;
			return await this.client.get_comment({
				id: parent,
				cid: await this.post_id,
			});
		})();
	}

	/**
	 * How many tiers of replies is this reply
	 * @type {Promise<number>}
	 */
	get depth() {
		return this.get("depth");
	}
}
