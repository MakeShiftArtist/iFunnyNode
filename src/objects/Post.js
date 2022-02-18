// @ts-check
"use strict";

import Client from "./Client.js";
import FreshObject from "./FreshObject.js";
import User from "./User.js";
import Comment from "./Comment.js";
import { paginator } from "../utils/methods.js";

import url from "url";

/**
 * @typedef {Object} PostOpts
 * @property {Object} [data={}] The data received from the server
 * @property {string} [url='/content/{content_id}'] The url to make requests to
 */

/**
 * @typedef {Object} Thumbnail Watermark cropped at different sizes
 * @property {string} small_url Jpeg format, Square, Size 65x, Quality: 90x75
 * @property {string} url Jpeg format, Square, Size 160x, Quality: 90x75
 * @property {string} large_url Jpeg format, Square, Size 320x, Quality: 90x75
 * @property {string} x640_url Jpeg format, Size 640x Quality: 95x75
 * @property {string} webp_url Webp format, Square, Size 160x, Quality: 90
 * @property {string} large_webp_url Webp format, Square, Size 320x, Quality: 90
 * @property {string} proportional_url Jpeg format, Size 320x, Crop x800, Quality: 90x75
 * @property {string} proportional_webp_url Webp format, Size 320x, Crop, Quality: 90
 * @property {Size} proportional_size Proportional Size of the thumbnail
 */

/**
 * @typedef {Object} PostStats
 * @property {Number=} smiles Amount of smiles the post has
 * @property {Number=} unsmiles Amount of unsmiles the post has
 * @property {Number=} guest_smiles Amount of guest smiles the post has
 * @property {Number=} comments Amount of comments the post has
 * @property {Number=} views Amount of views the post has
 * @property {Number=} republished Amount of republishes the user has
 * @property {Number=} shares Amount of shares the post has
 */

/**
 * @typedef {Object} Size
 * @property {Number} w Width
 * @property {Number} h Height
 */

/**
 * Updates the payload.nums
 * @private
 * @param {Object} payload The post payload
 * @param {Object} nums the new nums to update the payload with
 * @returns {object} The new payload nums
 */
function updateSmiles(payload, nums) {
	let final = {
		smiles: nums.nums_smiles,
		unsmiles: nums.nums_unsmiles,
		guest_smiles: nums.nums_guest_smiles,
	};

	if (payload.nums) {
		return Object.assign(payload.nums, final);
	} else {
		payload.nums = final;
		return payload.nums;
	}
}

/**
 * Post Object, representing an iFunny Post of any type
 * @extends FreshObject
 * @see {@link Post}
 */
export default class Post extends FreshObject {
	/**
	 * @param {string} id Unique Post ID
	 * @param {Client} client Client used for methods
	 * @param {Object} [opts={}] Optional arguments
	 * @param {PostOpts} [opts.data={}] Payload of the data if already known
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
		let creator = this._payload["creator"] ?? null;
		/**
		 * Cached post author
		 * @type {User}
		 */
		this._user = new User(creator?.id ?? null, client, {
			data: creator ?? {},
		});

		/**
		 * Request url for `this.get` method
		 * @type {string}
		 */
		this.request_url = `/content/${this.id_sync}`;
	}

	/**
	 * Asynchronous version of `this.id_sync`
	 * @type {Promise<string>}
	 */
	get id() {
		return this.get("id", this.id_sync);
	}

	/**
	 * Sharable link to the post
	 * @type {Promise<string>}
	 */
	get link() {
		return this.get("link");
	}

	/**
	 * Content url with old banner watermark
	 * @type {Promise<string>}
	 */
	get url() {
		return this.get("url");
	}

	/**
	 * Content url with new overlay watermark
	 * @type {Promise<string>}
	 */
	get share_url() {
		return this.get("share_url");
	}

	/**
	 * Type of post (`video_clip` or `pic`)
	 * @type {Promise<string>}
	 */
	get type() {
		return this.get("type");
	}

	/**
	 * Title of the post
	 * @type {Promise<string>}
	 */
	get title() {
		return this.get("title");
	}

	/**
	 * Description of the post
	 * @type {Promise<string>}
	 */
	get description() {
		return this.get("description", "");
	}

	/**
	 * Tags attatched to the post
	 * @type {Promise<Array<string>>}
	 */
	get tags() {
		return this.get("tags", []);
	}

	/**
	 * Publish status\
	 * `published` or `delayed`
	 * @type {Promise<string>}
	 */
	get state() {
		return this.get("state");
	}

	/**
	 * Status of the content's approval
	 * `approved` - Can be posted in comments
	 * @type {Promise<string>}
	 */
	get shot_status() {
		return this.get("shot_status");
	}

	/**
	 * Post visibility
	 * @type {Promise<string>}
	 */
	get visibility() {
		return this.get("visibility");
	}

	/**
	 * Creation date in UNIX
	 * @type {Promise<Date>}
	 */
	get created_at() {
		return (async () => {
			let time = await this.get("created_at");
			return time ? new Date(time) : null;
		})();
	}

	/**
	 * Publish date if it was already published
	 * @type {Promise<Date|null>}
	 */
	get published_at() {
		return (async () => {
			let published = (await this.get("state")) === "published";
			return published ? new Date(await this.get("published_at")) : null;
		})();
	}

	/**
	 * Featured date if it was featured
	 * @type {Promise<Date|null>}
	 */
	get issue_at() {
		return (async () => {
			let featured = await this.get("is_featured");
			return featured ? new Date(await this.get("issue_at")) : null;
		})();
	}

	/**
	 * Was the post smiled bt the client?
	 * @type {Promise<Boolean>}
	 */
	get is_smiled() {
		return this.get("is_smiled");
	}

	/**
	 * Was the post unsmiled bt the client?
	 * @type {Promise<Boolean>}
	 */
	get is_unsmiled() {
		return this.get("is_unsmiled");
	}

	/**
	 * Was the post featured?
	 * @type {Promise<Boolean>}
	 */
	get is_featured() {
		return this.get("is_featured");
	}

	/**
	 * Was the post removed by moderators or automod?
	 * @type {Promise<Boolean>}
	 */
	get is_abused() {
		return this.get("is_abused");
	}

	/**
	 * Was the post republished by the client?
	 * @type {Promise<Boolean>}
	 */
	get is_republished() {
		return this.get("is_republished");
	}

	/**
	 * Is the post pinned to the author's page?
	 * @type {Promise<Boolean>}
	 */
	get is_pinned() {
		return this.get("is_pinned");
	}

	/**
	 * Can this post be boosted?
	 * @type {Promise<Boolean>}
	 */
	get boostable() {
		return this.get("can_be_boosted");
	}

	/**
	 * Is it using the old watermark?
	 * @type {Promise<Boolean>}
	 */
	get old_watermark() {
		return this.get("old_watermark");
	}

	/**
	 * Fast start
	 * (Unknown)
	 * @type {Promise<Boolean>}
	 */
	get fast_start() {
		return this.get("fast_start");
	}

	/**
	 * The stats of the post
	 * @see {@link PostStats}
	 * @type {Promise<PostStats>}
	 */
	get stats() {
		return this.get("nums", {});
	}

	/**
	 * How many smiles does the post have?
	 * @type {Promise<Number>}
	 */
	get smile_count() {
		return (async () => {
			return (await this.stats)?.smiles ?? 0;
		})();
	}

	/**
	 * How many unsmiles does the post have?
	 * @type {Promise<Number>}
	 */
	get unsmile_count() {
		return (async () => {
			return (await this.stats)?.unsmiles ?? 0;
		})();
	}

	/**
	 * How many guest smiles does the post have?
	 * (Not sure what counts as a guest smile)
	 * @type {Promise<Number>}
	 */
	get guest_smiles() {
		return (async () => {
			return (await this.stats)?.guest_smiles ?? 0;
		})();
	}

	/**
	 * How many comments does the post have?
	 * @type {Promise<Number>}
	 */
	get comment_count() {
		return (async () => {
			return (await this.stats)?.comments ?? 0;
		})();
	}

	/**
	 * How many views does the post have?
	 * @type {Promise<Number>}
	 */
	get view_count() {
		return (async () => {
			return (await this.stats)?.views ?? 0;
		})();
	}

	/**
	 * How many republishes does the post have?
	 * @type {Promise<Number>}
	 */
	get republication_count() {
		return (async () => {
			return (await this.stats)?.republished ?? 0;
		})();
	}

	/**
	 * How many times has the post been shared?
	 * @type {Promise<Number>}
	 */
	get share_count() {
		return (async () => {
			return (await this.stats)?.shares;
		})();
	}

	/**
	 * Author of the post
	 * Alias for {@link Post.creator}
	 * @type {Promise<User>}
	 */
	get author() {
		return (async () => {
			if (this._user.id_sync !== null && !this._update) {
				return this._user;
			}
			let creator = await this.get("creator");
			this._user = new User(creator.id ?? null, this.client, {
				data: creator ?? {},
			});
		})();
	}

	/**
	 * Author of the post\
	 * Alias for {@link Post.author}
	 * @type {Promise<User>}
	 */
	get creator() {
		return this.author;
	}

	/**
	 * Pixel size of the post
	 * @type {Promise<Size>}
	 */
	get size() {
		return this.get("size");
	}

	/**
	 * Original Source of the content, if any\
	 * Not sure what the copywright object looks like, when I find out I will document it
	 * @type {Promise<Object>}
	 */
	get copywright() {
		return this.get("copyright", {});
	}

	/**
	 * Dynamic title of the post\
	 * Alias for {@link fixed_title Post.fixed_title}
	 * @type {Promise<string>}
	 */
	get dynamic_title() {
		return this.fixed_title;
	}

	/**
	 * Fixed title of the Post
	 * Alias for {@link dynamic_title Post.dynamic_title}
	 * @type {Promise<string>}
	 */
	get fixed_title() {
		return this.get("fixed_title", this.title);
	}

	/**
	 * Thumbnail object with additional content urls
	 * @type {Promise<Thumbnail>}
	 */
	get thumbnail() {
		return this.get("thumb");
	}

	/**
	 * The id for the post content url\
	 * NOT the id of the post object itself
	 * @type {Promise<string>}
	 */
	get content_id() {
		return (async () => {
			return (
				// match the content id regex
				(await this.url)?.match(
					/(?<=\/images\/|\/videos\/)([a-zA-Z0-9\_]+)(?=\.jpg$|\.gif$|\.webp$|\.mp4$)/
				)?.[0] ?? null // return the content id or null if undefined
			);
		})();
	}

	/**
	 * Return the original source of the post if it is a republish\
	 * If it's not a republish, it returns itself
	 * @type {Promise<Post>}
	 */
	get source() {
		return (async () => {
			let origin = await this.get("source");
			return origin ? new Post(origin.id, this.client, origin) : this;
		})();
	}

	/**
	 * Smiles a post
	 * @param {'prof'|'feat'|'coll'|'my-smiles'|'reads'} [from] Where the post is being seen
	 * @returns {Promise<this>}
	 */
	async smile(from = "prof") {
		let { data } = await this.instance.request({
			method: "PUT",
			url: `${this.request_url}/smiles`,
			params: new url.URLSearchParams({ from }),
		});
		updateSmiles(this._payload, data.data);
		this._payload.is_smiled = true;
		this._payload.is_unsmiled = false;
		return this;
	}

	/**
	 * Removes the smile if the post is smiled
	 * @param {'prof'|'feat'|'coll'|'my-smiles'|'reads'} [from] Where the post is being seen
	 * @returns {Promise<this>}
	 */
	async remove_smile(from = "prof") {
		let { data } = await this.instance.request({
			method: "DELETE",
			url: `${this.request_url}/smiles`,
			params: new url.URLSearchParams({ from }),
		});
		updateSmiles(this._payload, data.data);
		this._payload.is_smiled = false;
		return this;
	}

	/**
	 * Unsmiles a post
	 * @param {'prof'|'feat'|'coll'|'my-smiles'|'reads'} [from] Where the post is being seen
	 * @returns {Promise<this>}
	 */
	async unsmile(from = "prof") {
		let { data } = await this.instance.request({
			method: "PUT",
			url: `${this.request_url}/unsmiles`,
			params: new url.URLSearchParams({ from }),
		});
		updateSmiles(this._payload, data.data);
		this._payload.is_smiled = false;
		this._payload.is_unsmiled = true;
		return this;
	}

	/**
	 * Removes an unsmile if the content is smiled
	 * @param {'prof'|'feat'|'coll'|'my-smiles'|'reads'} [from] Where the post is being seen
	 * @returns {Promise<this>}
	 */
	async remove_unsmile(from = null) {
		let { data } = await this.instance.request({
			method: "DELETE",
			url: `${this.request_url}/unsmiles`,
			params: new url.URLSearchParams({ from }),
		});
		updateSmiles(this._payload, data.data);
		this._payload.is_unsmiled = false;
		return this;
	}

	/**
	 * Republishes a post
	 * @param {'prof'|'feat'|'coll'|'my-smiles'|'reads'} [from] Where the post is being seen
	 * @returns {Promise<Post>}
	 */
	async republish(from = null) {
		if (await this.is_republished) {
			throw new Error(`Post (${await this.id}) is already republished`);
		}
		let { data } = await this.instance.request({
			method: "POST",
			url: `${this.request_url}/republished`,
			params: new url.URLSearchParams({ from }),
		});
		return this.client.get_post(data.data.id);
	}

	/**
	 * Removes republish from post\
	 * If you do this on the republished ID, the id will be made invalid
	 * @return {Promise<this>}
	 */
	async unrepublish(from = null) {
		if (!(await this.is_republished)) {
			return this;
		}
		let { data } = await this.instance.request({
			method: "DELETE",
			url: `${this.request_url}/republished`,
			params: new url.URLSearchParams({ from }),
		});
		this._payload.nums = this._payload.nums ?? {};
		this._payload.nums.republished = data.nums_republished;
		this._payload.is_republished = false;
		return this;
	}

	/**
	 * Pins a post if it's on the client's timeline
	 * @returns {Promise<this>}
	 */
	async pin() {
		if ((await this.author).id_sync !== (await this.client.id)) {
			throw new Error(`Post (${await this.id}) isn't owned by the client`);
		}
		await this.instance.request({
			method: "PUT",
			url: `${this.request_url}/pinned`,
		});
		this._payload.is_pinned = true;
		return this;
	}

	/**
	 * Unpins the post from the client's timeline
	 * @return {Promise<this>}
	 */
	async unpin() {
		if (!(await this.is_pinned)) {
			return this;
		}

		await this.instance.request({
			method: "DELETE",
			url: `${this.request_url}/pinned`,
		});
		this._payload.is_pinned = false;
		return this;
	}

	// TODO Add post_comment method

	async *comments(limit = 50) {
		let all_comms = paginator(this.client, {
			url: `${this.request_url}`,
			key: "comments",
			params: { limit },
		});

		for await (let comment of all_comms) {
			// Since this doesn't load replies, we can just use Comment
			yield new Comment(comment.id, this.client, {
				data: comment,
			});
		}
	}
}
