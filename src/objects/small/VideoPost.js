// @ts-check

import Post from ".././Post.js";

/**
 * @typedef {Object} VideoClip
 * @property {string} screen_url Jpeg format
 * @property {number} bytes Amount of bytes the video is
 * @property {string} source_type The source type of the content
 * @property {number} duration How long the video is in seconds
 */

/**
 * @typedef {Object} PostOpts
 * @property {Object} [data={}] The data received from the server
 * @property {string} [url='/content/{content_id}'] The url to make requests to
 */

/** @typedef {import('../Client.js').default} Client */

/**
 * Represents a Video or GIF on iFunny
 * @see {@link VideoPost}
 */
export default class VideoPost extends Post {
	/**
	 * @param {string} id Id of the video
	 * @param {Client} client
	 * @param {PostOpts} [opts]
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
	}

	/**
	 * Byte size of the video
	 * @type {Promise<number>}
	 */
	get bytes() {
		return (async () => {
			return (await this.data)?.bytes ?? 0;
		})();
	}

	/**
	 * Gets the duration of the video in seconds
	 * @type {Promise<number>}
	 */
	get duration() {
		return (async () => {
			if ((await this.type) !== "video_clip") return null;
			return (await this.data)?.duration ?? 0;
		})();
	}

	/**
	 * The thumbnail image for the video or GIF
	 * @type {Promise<string|null>}
	 */
	get screen_url() {
		return (async () => {
			return (await this.data)?.screen_url ?? null;
		})();
	}

	/**
	 * The source type for the video
	 * `user`
	 * @type {Promise<string|null>}
	 */
	get source_type() {
		return (async () => {
			return (await this.data)?.source_type ?? null;
		})();
	}

	/**
	 * Url for the mp4 video if available
	 * @type {Promise<string|null>}
	 */
	get mp4_url() {
		return (async () => {
			if ((await this.type) === "gif") {
				return (await this.data)?.mp4_url ?? (await this.url);
			}
		})();
	}

	/**
	 * Number of bytes for the mp4 video if available
	 * @type {Promise<number|null>}
	 */
	get mp4_bytes() {
		return (async () => {
			if ((await this.type) === "gif") {
				return (await this.data)?.mp4_bytes ?? (await this.bytes);
			}
			return await this.bytes;
		})();
	}

	/**
	 * Url for the webm video if available
	 * @type {Promise<string|null>}
	 */
	get webm_url() {
		return (async () => {
			if ((await this.type) !== "vine") return null;

			return (await this.data)?.webm_url ?? null;
		})();
	}

	/**
	 * Number of bytes for the webm video if available
	 * @type {Promise<number|null>}
	 */
	get webm_bytes() {
		return (async () => {
			if ((await this.type) !== "vine") return null;
			return (await this.data)?.webm_bytes ?? null;
		})();
	}

	/**
	 * The logo url of the video if available
	 */
	get logo_url() {
		return (async () => {
			return (await this.data)?.logo_url ?? null;
		})();
	}
}
