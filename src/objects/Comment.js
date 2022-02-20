// @ts-check

import FreshObject from "./FreshObject.js";
import User from "./User.js";

/**
 * @typedef {import("./Client.js").default} Client
 * @typedef {import('../objects/small/ImagePost.js').default} ImagePost
 * @typedef {import('../objects/small/VideoPost.js').default} VideoPost
 * @typedef {import('../objects/small/Reply.js').default} Reply
 */

/**
 * Represents an iFunny comment on a post
 * @extends FreshObject
 * @see {@link Comment}
 */
export default class Comment extends FreshObject {
	/**
	 * @param {Object} comment The comment's raw object
	 * @param {Client} client Client the comment object is associated with
	 * @param {Object} [opts] Optional args for the constructor
	 * @param {string} [opts.url] Url to make requests to
	 * @param {Object} [opts.data] Data to add to the payload
	 */
	constructor(comment, client, opts = {}) {
		if (!comment?.cid || !comment?.id) {
			throw new Error('comment param needs "cid" and "id" properties');
		}
		super(comment.id, client, opts);
		this._payload = opts?.data ?? comment;
		this.request_url = opts?.url ?? `/content/${comment.cid}/comments/${comment.id}`;
	}

	/**
	 * Text of the comment
	 * @type {Promise<string>}
	 */
	get text() {
		return this.get("text");
	}

	/**
	 * Id of the comment
	 * @type {Promise<string>}
	 */
	get id() {
		return this.get("id");
	}

	/**
	 * Reply of the comment
	 * @type {Promise<Reply|null>}
	 */
	get latest_reply() {
		// @ts-ignore
		return (async () => {
			let comm = await this.get("last_reply");
			return comm ? await this.client.get_comment(comm) : null; // Should always return reply
		})();
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
			let post = await this.get("content");
			return await this.client.get_post(post);
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

	/**
	 * Id of the post that the comment was posted on
	 * @type {Promise<string>}
	 */
	get post_id() {
		return this.get("cid");
	}

	/**
	 * State of the comment (idk what this is)\
	 * `normal`
	 * @type {Promise<string>}
	 */
	get state() {
		return this.get("state");
	}

	/**
	 * Has the client smiled this comment?
	 * @type {Promise<boolean>}
	 */
	get is_smiled() {
		return this.get("is_smiled");
	}

	/**
	 * Has the client unsmiled this comment?
	 * @type {Promise<boolean>}
	 */
	get is_unsmiled() {
		return this.get("is_unsmiled");
	}

	/**
	 * Has the comment been edited?
	 * @type {Promise<boolean>}
	 */
	get is_edited() {
		return this.get("is_edited");
	}

	/**
	 * The attachment of the comment, if any
	 * @type {Promise<ImagePost|VideoPost|null>}
	 */
	get attachment() {
		return (async () => {
			let attch = await this.get("content");
			let post =
				attch?.content?.[0] ??
				attch?.content_from_links?.[0] ??
				attch?.giphy?.[0];

			if (!post) return null;
			return await this.client.get_post(post);
		})();
	}

	/**
	 * Users mentioned in the comment
	 * @type {Promise<User[]>}
	 */
	get mentions() {
		return (async () => {
			let { mention_user = null } = await this.get("attachments");
			if (!mention_user) return null;
			if (!Array.isArray(mention_user)) {
				throw new Error(`mention_user returned non array: ${mention_user}`);
			}
			return mention_user.map(
				(user) => new User(user.id, this.client, { data: user })
			);
		})();
	}

	/**
	 * Object with smile, unsmile, and reply count
	 * @type {Promise<Object>}
	 */
	get nums() {
		return this.get("nums", {});
	}

	/**
	 * How many smiles the comment has
	 * @type {Promise<number>}
	 */
	get smile_count() {
		return (async () => {
			return (await this.nums)?.smiles ?? 0;
		})();
	}

	/**
	 * How many unsmiles the comment has
	 * @type {Promise<number>}
	 */
	get unsmile_count() {
		return (async () => {
			return (await this.nums)?.unsmiles ?? 0;
		})();
	}

	/**
	 * How many replies the comment has
	 * @type {Promise<number>}
	 */
	get reply_count() {
		return (async () => {
			return (await this.nums)?.smiles ?? 0;
		})();
	}

	/**
	 * Content thumbnails for the attachments
	 * @type {Promise<Object|null>}
	 */
	get content_thumbs() {
		return this.get("content_thumbs");
	}

	// TODO Add reply generator function for commments
}
