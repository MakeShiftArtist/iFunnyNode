// @ts-check
import Post from "./Post.js";
import Client from "./Client.js";

/**
 * @typedef {Object} VideoClip
 * @property {String} screen_url Jpeg format
 * @property {Number} bytes Amount of bytes the video is
 * @property {String} source_type The source type of the content
 * @property {Number} duration How long the video is in seconds
 */

/**
 * @typedef {Object} PostOpts
 * @property {Object} [data={}] The data received from the server
 * @property {String} [url='/content/{content_id}'] The url to make requests to
 */

/**
 * iFunny Video Post Object with more specfic functions for videos
 * @see {@link VideoPost}
 */
export default class VideoPost extends Post {
	/**
	 * @param {String} id Id of the video
	 * @param {Client} client
	 * @param {PostOpts} opts
	 */
	constructor(id, client, opts) {
		super(id, client, opts);
	}

	/**
	 * Data information about the video
	 * @type {Promise<VideoClip|null>}
	 */
	get video_data() {
		return this.get("video_clip", null);
	}

	/**
	 * Byte size of the video
	 * @type {Promise<Number>}
	 */
	get bytes() {
		return (async () => {
			return (await this.video_data)?.bytes ?? 0;
		})();
	}

	/**
	 * Gets the duration of the video in seconds
	 * @type {Promise<Number>}
	 */
	get duration() {
		return (async () => {
			return (await this.video_data)?.duration ?? 0;
		})();
	}

	/**
	 * The thumbnail for the video
	 * @type {Promise<String|null>}
	 */
	get screen_url() {
		return (async () => {
			return (await this.video_data)?.screen_url ?? null;
		})();
	}

	/**
	 * The source type for the video
	 * `user`
	 * @type {Promise<String|null>}
	 */
	get source_type() {
		return (async () => {
			return (await this.video_data)?.source_type ?? null;
		})();
	}
}
