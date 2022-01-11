import ChatUser from "./ChatUser.js";

/**
 * Represents a message in a chat
 * @see {@link Message}
 */
export default class Message {
	/**
	 * Message object
	 * @param {import("./Context").default} context Context of the message
	 * @param {Object} payload Payload of the message
	 */
	constructor(context, payload = {}) {
		/**
		 * @type {import("./ChatUser").default}
		 */
		this.author = new ChatUser(payload.user.id, context, payload.user);

		/**
		 * Payload of the message to use getters on
		 */
		this._payload = payload ?? {};
	}

	/**
	 * String of the message
	 * @type {String|null}
	 */
	get content() {
		return this._payload?.text ?? null;
	}

	/**
	 * Date Object of when the message was sent
	 * @type {Date|null}
	 */
	get timestamp() {
		let time = this._payload?.pub_at ?? null;
		return time ? new Date(time) : null;
	}

	/**
	 * Local ID of the message\
	 * Set by the client, so this can be used to determine client type
	 * @type {String|null}
	 */
	get local_id() {
		let sub_load = this._payload?.payload;
		if (sub_load) {
			return sub_load?.local_id ?? sub_load?.localId ?? null;
		}
	}
}
