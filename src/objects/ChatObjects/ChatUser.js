import User from "../User.js";

/**
 * Represents a ChatUser object from the websocket connection.
 * @extends User
 */
export default class ChatUser extends User {
	/**
	 * @param {String} id
	 * @param {import("./Context.js").default} context
	 * @param {Object} payload
	 */
	constructor(id, context, payload = {}) {
		super(id, context.chats.client, { data: payload });
		/**
		 * @type {import("./Context.js").default}
		 */
		this.context = context;

		/**
		 * @type {import("./SocketInstance.js").default}
		 */
		this.socket = this.context.chats.socket;

		/**
		 * User's chat payload from a chat
		 * @type {Object}
		 */
		this.chat_payload = payload;
	}

	/**
	 * Is the user an operator of the chat?
	 * @type {Boolean}
	 */
	get is_operator() {
		return this.chat_payload.role == 1;
	}

	/**
	 * Is the user an admin of the chat?
	 * @type {Boolean}
	 */
	get is_admin() {
		return this.chat_payload.role == 0;
	}

	/**
	 * Is the user a member of the chat?
	 * @type {Boolean}
	 */
	get is_member() {
		return this.chat_payload.role == 2;
	}

	/**
	 * Channel the ChatUser belongs to
	 * @type {Promise<import("./Channel.js").default>}
	 */
	get channel() {
		return this.context.chats.get_chat(`${this.context.chats.client.id}_${this.id}`);
	}

	/**
	 * When the user was last seen online
	 * @type {Date|null}
	 */
	get last_seen_at() {
		let time = this.chat_payload?.last_seen_at;
		return time ? new Date(time) : null;
	}

	/**
	 * Kicks a user from the current contexts channel
	 * @returns {Promise}
	 */
	kick() {
		return this.context.channel.kick(this);
	}
}
