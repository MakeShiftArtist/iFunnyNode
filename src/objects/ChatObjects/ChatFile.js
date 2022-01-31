import ChatUser from "./ChatUser.js";

/**
 * Represents a file that was sent in Chats
 * @see {@link ChatFile}
 */
export default class ChatFile {
	constructor(ctx, payload) {
		/**
		 * Author of the message
		 * @type {import("./ChatUser.js").default|null}
		 */
		this._author = null;

		/**
		 * Context the ChatFile belongs to
		 * @type {import("./Context.js").default|null}
		 */
		this.context = ctx;

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
	 * Thumbnail of the file
	 * @type {{'url': String, 'w': Number, 'h': Number}}
	 */
	get thumbnail() {
		return {
			url: this._payload?.files[0]?.thumb_url ?? null,
			h: this._payload?.files[0]?.thumb_height ?? 0,
			w: this._payload?.files[0]?.thumb_width ?? 0,
		};
	}

	/**
	 * Image url
	 * @type {String}
	 */
	get url() {
		return this._payload?.files[0]?.url;
	}

	/**
	 * Get's the author of the File sent
	 * @type {ChatUser|null}
	 */
	get author() {
		return this._author ?? null;
	}

	set author(user) {
		this._author = new ChatUser(user.id, ctx, user);
	}
}
