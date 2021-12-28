// @ts-check
import Client from "./Client.js";
import FreshObject from "./FreshObject.js";
import User from "./User.js";

/**
 * Post Object, representing an iFunny Post of any type
 * @extends FreshObject
 * @see {@link Post}
 */
export default class Post extends FreshObject {
	/**
	 * @param {String} id Unique Post ID
	 * @param {Client} client Client used for methods
	 * @param {Object} [opts={}] Optional arguments
	 * @param {FreshOpts} [opts.data={}] Payload of the data if already known
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
		this.request_url = `${this.api}/content/${this.id_sync}`;
	}

	/**
	 * Sharable link to the post
	 * @type {Promise<String>}
	 */
	get link() {
		return this.get("link");
	}

	/**
	 * Content url with old banner watermark
	 * @type {Promise<String>}
	 */
	get url() {
		return this.get("url");
	}

	/**
	 * Content url with new overlay watermark
	 * @type {Promise<String>}
	 */
	get share_url() {
		return this.get("share_url");
	}

	/**
	 * Type of post (`video_clip` or `pic`)
	 * @type {Promise<String>}
	 */
	get type() {
		return this.get("type");
	}

	/**
	 * Title of the post
	 * @type {Promise<String>}
	 */
	get title() {
		return this.get("title");
	}

	/**
	 * Description of the post
	 * @type {Promise<String>}
	 */
	get description() {
		return this.get("description", "");
	}

	/**
	 * Tags attatched to the post
	 * @type {Promise<Array<String>>}
	 */
	get tags() {
		return this.get("tags", []);
	}

	/**
	 * Publish status\
	 * `published` or `delayed`
	 * @type {Promise<String>}
	 */
	get state() {
		return this.get("state");
	}

	/**
	 * Shot status\
	 * (I don't know what this does)
	 * @type {Promise<String>}
	 */
	get shot_status() {
		return this.get("shot_status");
	}

	/**
	 * Post visibility
	 * @type {Promise<String>}
	 */
	get visibility() {
		return this.get("visibility");
	}

	/**
	 * Creation date in UNIX
	 * @type {Promise<Number>}
	 */
	get created_at() {
		return this.get("date_create");
	}

	/**
	 * Publish date in UNIX
	 * @type {Promise<Number>}
	 */
	get published_at() {
		return this.get("publish_at");
	}

	/**
	 * Featured date in UNIX (if featured)
	 * @type {Promise<Number>}
	 */
	get issue_at() {
		return this.get("issue_at");
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
	get nums() {
		return this.get("nums", {});
	}

	/**
	 * How many smiles does the post have?
	 * @type {Promise<Number>}
	 */
	get smile_count() {
		return (async () => {
			return (await this.nums)?.smiles ?? 0;
		})();
	}

	/**
	 * How many unsmiles does the post have?
	 * @type {Promise<Number>}
	 */
	get unsmile_count() {
		return (async () => {
			return (await this.nums)?.unsmiles ?? 0;
		})();
	}

	/**
	 * How many guest smiles does the post have?
	 * (Not sure what counts as a guest smile)
	 * @type {Promise<Number>}
	 */
	get guest_smiles() {
		return (async () => {
			return (await this.nums)?.guest_smiles ?? 0;
		})();
	}

	/**
	 * How many comments does the post have?
	 * @type {Promise<Number>}
	 */
	get comment_count() {
		return (async () => {
			return (await this.nums)?.comments ?? 0;
		})();
	}

	/**
	 * How many views does the post have?
	 * @type {Promise<Number>}
	 */
	get view_count() {
		return (async () => {
			return (await this.nums)?.views ?? 0;
		})();
	}

	/**
	 * How many republishes does the post have?
	 * @type {Promise<Number>}
	 */
	get republication_count() {
		return (async () => {
			return (await this.nums)?.republished ?? 0;
		})();
	}

	/**
	 * How many times has the post been shared?
	 * @type {Promise<Number>}
	 */
	get share_count() {
		return (async () => {
			return (await this.nums)?.shares;
		})();
	}

	/**
	 * Author of the post
	 * @type {Promise<User>}
	 */
	get author() {
		return (async () => {
			let creator = await this.get("creator");
			return new User(creator.id, this.client, { data: creator });
		})();
	}

	/**
	 * Author of the post\
	 * Alias for {@link author Post.author}
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
	 * Original Source of the content, if any
	 * @type {Promise<Object>}
	 */
	get copywright() {
		return this.get("copyright", {});
	}
}
