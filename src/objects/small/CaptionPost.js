// @ts-check

import ImagePost from "./ImagePost.js";

/** @typedef {import('../Client.js').default} Client */

/**
 * Represents a captioned image in iFunny
 * @extends ImagePost
 * @see {@link CaptionPost}
 */
export default class CaptionPost extends ImagePost {
	/**
	 *
	 * @param {string} id Id of the post
	 * @param {Client} client
	 * @param {Object} opts
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
	}

	/**
	 * The images caption
	 * @type {Promise<string>}
	 */
	get caption() {
		return (async () => {
			return (await this.get("caption"))?.caption_text ?? null;
		})();
	}
}
