import Post from "./Post";

/**
 * iFunny Image Object with more specific functions for images
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
	 * @type {Promise<String>}
	 */
	get webp_url() {
		return (async () => {
			let type = await this.get("type");
			return (await this.get(type))?.webp_url ?? null;
		})();
	}

	/**
	 * Dynamic title of the post\
	 * Alias for {@link fixed_title Image.fixed_title}
	 * @type {Promise<String>}
	 */
	get dynamic_title() {
		return this.fixed_title;
	}

	/**
	 * Fixed title of the Post
	 * Alias for {@link dynamic_title Image.dynamic_title}
	 * @type {Promise<String>}
	 */
	get fixed_title() {
		return this.get("fixed_title", this.title);
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
}
