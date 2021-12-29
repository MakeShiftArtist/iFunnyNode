// @ts-check
import Post from "./Post";
import Client from "./Client.js";

/**
 * iFunny Image Post Object with more specific functions for images
 * @extends Post
 * @see {@link Image}
 */
export default class Image extends Post {
	/**
	 * @param {String} id
	 * @param {Client} client
	 * @param {FreshOpts} opts
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
			return (await this.get("url")).replace(/\.jpg$/g, ".webp");
		})();
	}

	/**
	 * Text detected by iFunny's OCR\
	 * Alias for {@link ocr_text Post.ocr_text}
	 * @type {Promise<String|null>}
	 */
	get detected_text() {
		return (async () => {
			if ((await this.get("type")) === "pic")
				return await this.get("ocr_text");
			else return null;
		})();
	}

	/**
	 * Text detected by iFunny's OCR
	 * @type {Promise<String|null>}
	 */
	get ocr_text() {
		return this.detected_text;
	}

	/**
	 * Content url with the iFunny watermark cropped out
	 * @example
	 * 'https://imageproxy.ifunny.co/crop:x-20/images/{content_id}.{jpg|webp}'
	 * @type {Promise<String|null>}
	 */
	get cropped_url() {
		return (async () => {
			let content_id = await this.content_id;
			if (content_id === null) return null;
			return `https://imageproxy.ifunny.co/crop:x-20/images/${content_id}.jpg`;
		})();
	}
}
