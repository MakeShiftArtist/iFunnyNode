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

		/**
		 * Is the user still in the chat?
		 * @private
		 * @type {Boolean}
		 */
		this._in_chat = true;
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
	 * @type {Promise<Date|null>}
	 */
	get last_seen_at() {
		return (async () => {
			let time = this.chat_payload?.last_seen_at;
			if (time) {
				return new Date(time);
			}
			await this.fetch();
			time = this.chat_payload?.last_seen_at;
			if (time === 0) {
				return new Date();
			} else if (time) {
				return new Date(time);
			} else return null;
		})();
	}

	/**
	 * Is the user currently online of the chat?
	 * @type {Promise<Boolean>}
	 */
	get online() {
		return (async () => {
			let diff = (await this.fresh.last_seen_at).getTime() - new Date().getTime();
			console.log(diff);
			return diff === 0;
		})();
	}

	/**
	 * Is the user a member of the chat?
	 * @type {Promise<Boolean>}
	 */
	get in_chat() {
		return (async () => {
			if (!this._update) {
				return this._in_chat;
			}
			for await (let member of await this.context.channel.members) {
				if ((await member.id) === (await this.id)) {
					this._in_chat = true;
				}
			}
		})();
	}

	/**
	 * Kicks a user from the current contexts channel
	 * @returns {Promise}
	 */
	kick() {
		return this.context.channel.kick(this);
	}

	/**
	 * Fetches the ChatUser from the current contexts channel
	 * @returns {Promise<ChatUser>}
	 */
	async fetch() {
		if (!this.in_chat && !this._update) return;
		let user = await this.context.channel.fetch_by_id(await this.id);
		if (user && user.chat_payload) {
			this.chat_payload = user.chat_payload;
			return user.fresh;
		}
		this._in_chat = false;
		return this.fresh;
	}
}
