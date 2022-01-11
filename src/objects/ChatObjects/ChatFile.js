import ChatUser from "./ChatUser.js";
/**
 * Represents a file that was sent in Chats
 * @see {@link ChatFile}
 */
export default class ChatFile {
	constructor(ctx, payload) {
		/**
		 * @type {import("./ChatUser.js").default}
		 */
		this.author = new ChatUser(payload.user.id, ctx, payload.user);

		/**
		 * The payload of the file
		 * @type {Object}
		 */
		this._payload = payload;
	}

	/**
	 * Time the message was published
	 * @type {Date|null}
	 */
	get pub_at() {
		let time = this?._payload?.pub_at ?? null;
		return time ? new Date(time) : null;
	}

	/**
	 * File id
	 * @type {String}
	 */
	get id() {
		return this._payload?.id;
	}

	/**
	 * Status of file upload
	 * @type {Number}
	 */
	get status() {
		return this._payload?.status;
	}

	/**
	 * Hash of the post
	 * @type {String}
	 */
	get hash() {
		return this._payload?.files[0]?.hash;
	}

	/**
	 * Width of the thumbnail
	 * @type {Number}
	 */
	get thumb_width() {
		return this._payload?.files[0]?.thumb_width;
	}

	/**
	 * Thumbnail height
	 * @type {Number}
	 */
	get thumb_height() {
		return this._payload?.files[0]?.thumb_height;
	}

	/**
	 * Thumbnail url
	 * @type {String}
	 */
	get thumb_url() {
		return this._payload?.files[0]?.thumb_url;
	}

	/**
	 * Image url
	 * @type {String}
	 */
	get url() {
		return this._payload?.files[0]?.url;
	}
}
