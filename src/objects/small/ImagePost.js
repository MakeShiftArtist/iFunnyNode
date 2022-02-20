// @ts-check

import Post from ".././Post.js";

/**
 * @typedef {Object} PostOpts
 * @property {Object} [data={}] The data received from the server
 * @property {String} [url='/content/{content_id}'] The url to make requests to
 */

/** @typedef {import('../Client.js').default} Client */

/**
 * iFunny Image Post Object with more specific functions for images
 * @extends Post
 * @see {@link ImagePost}
 */
export default class ImagePost extends Post {
	/**
	 * @param {String} id
	 * @param {Client} client
	 * @param {PostOpts} opts
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
	}

	/**
	 * Webp version of the content url
	 * @type {Promise<String|null>}
	 */
	get webp_url() {
		return (async () => {
			return (await this.data)?.webp_url ?? null;
		})();
	}

	/**
	 * Text detected by iFunny's OCR\
	 * Alias for {@link ocr_text Post.ocr_text}
	 * @type {Promise<String|null>}
	 */
	get detected_text() {
		return this.ocr_text;
	}

	/**
	 * Text detected by iFunny's OCR
	 * @type {Promise<String|null>}
	 */
	get ocr_text() {
		return (async () => {
			let types = ["pic", "caption", "comics"];
			if (types.includes(await this.type)) {
				return await this.get("ocr_text");
			} else return null;
		})();
	}

	/**
	 * Content url with the iFunny watermark cropped out
	 * @example
	 * 'https://imageproxy.ifunny.co/crop:x-20/images/{content_id}.jpg'
	 * @type {Promise<String|null>}
	 */
	get cropped_url() {
		return (async () => {
			let content_id = await this.content_id;
			if (content_id === null) return null;
			return `https://imageproxy.ifunny.co/crop:x-20/images/${content_id}.jpg`;
		})();
	}

	/**
	 * The images caption, if Caption
	 * @type {Promise<string>}
	 */
	get caption() {
		return (async () => {
			if ((await this.type) !== "caption") return null;
			return (await this.get("caption"))?.caption_text ?? null;
		})();
	}
}
