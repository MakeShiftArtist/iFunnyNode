// @ts-check

import FreshObject from "./FreshObject.js";
import User from "./User.js";
import { get_post_type } from "../utils/methods.js";

/**
 * @typedef {import("./Client.js").default} Client
 * @typedef {import('../objects/small/ImagePost.js').default} ImagePost
 * @typedef {import('../objects/small/VideoPost.js').default} VideoPost
 */

/**
 * Represents an iFunny comment on a post
 * @extends FreshObject
 * @see {@link Comment}
 */
export default class Comment extends FreshObject {
	/**
	 * @param {string} id Id of the comment
	 * @param {Client} client Client the comment object is associated with
	 * @param {Object} [opts]
	 * @param {string} [opts.url] Url to make requests to
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
	}

	get text() {
		return this.get("text");
	}

	get id() {
		return this.get("id");
	}

	get latest_reply() {
		return this.get("last_reply");
	}

	/**
	 * The comment author
	 * @type {Promise<User>}
	 */
	get author() {
		return (async () => {
			let user = await this.get("user");
			return user ? new User(user.id, this.client, user) : null;
		})();
	}

	/**
	 * The post the comment belongs to
	 * @type {Promise<ImagePost|VideoPost>}
	 */
	get post() {
		return (async () => {
			let post = await this.get("post");
			return get_post_type(post, this.client);
		})();
	}

	/**
	 * Is the comment a reply to another comment?
	 * @type {Promise<boolean>}
	 */
	get is_reply() {
		return this.get("is_reply", false);
	}

	/**
	 * When the comment was posted
	 * @type {Promise<Date|null>}
	 */
	get date() {
		return (async () => {
			let date = await this.get("date");
			return date ? new Date(date) : null;
		})();
	}

	get post_id() {
		return this.get("cid");
	}

	get state() {
		return this.get("state");
	}

	get is_smiled() {
		return this.get("is_smiled");
	}

	get is_unsmiled() {
		return this.get("is_unsmiled");
	}

	get is_edited() {
		return this.get("is_edited");
	}

	get attachment() {
		return (async () => {
			let attch = await this.get("content");
			let post = attch?.content?.[0] ?? null;
			post = !post ? attch?.content_from_links?.[0] : post;
			post = !post ? attch?.giphy?.[0] : post;
			if (!post) return null;
			return this.client.get_post(post.id);
		})();
	}

	// TODO Finnish getters for comment, add Reply.js

	// TODO Add reply generator function for commments
}
