import Channel from "./Channel.js";
import ChatUser from "./ChatUser.js";
import Message from "./Message.js";
import ChatFile from "./ChatFile.js";

/**
 * Context about iFunny chat data received from the websocket
 */
export default class Context {
	/**
	 * @param {import("../Chats.js").default} chat_client
	 * @param {*} opts
	 */
	constructor(chat_client, opts = {}) {
		//Opts may include command information, ect
		Object.assign(this, opts);

		/**
		 * Chat client that the contect is associated with
		 * @type {import("../Chats.js").default}
		 */
		this.chats = chat_client;

		/**
		 * @private
		 * @type {ChatUser[]}
		 */
		this._users = [];

		/**
		 * @private
		 * @type {ChatUser}
		 */
		this._user = null;

		/**
		 * @private
		 * @type {Channel[]}
		 */
		this._channels = [];

		/**
		 * @private
		 * @type {Channel}
		 */
		this._channel = null;

		/**
		 * @private
		 * @type {Message}
		 */
		this._message = null;

		/**
		 * @private
		 * @type {ChatFile}
		 */
		this._file = null;

		/**
		 * All files attached
		 * @type {ChatFile[]}
		 */
		this._files = [];
	}

	set file(data) {
		this._file = new ChatFile(this, data);
	}

	/**
	 * File of the context if there is one
	 * @type {ChatFile}
	 */
	get file() {
		return this._file;
	}

	set files(data) {
		this._files = data.map((file) => new ChatFile(this, file));
	}

	/**
	 * All files attached to the context
	 * @type {ChatFile[]}
	 */
	get files() {
		return this._files;
	}

	set channels(data) {
		this._channels = data.map((channel) => new Channel(this, channel));
	}

	/**
	 * Get contexts channels
	 * @type {Channel[]}
	 */
	get channels() {
		return this._channels;
	}

	set channel(data) {
		this._channel = new Channel(this, data);
	}

	/**
	 * Get channel of context
	 * @type {Channel}
	 */
	get channel() {
		return this._channel;
	}

	set user(data) {
		this._user = new ChatUser(data.id, this.chats.client, { context: this });
	}

	/**
	 * Get user of context
	 * @type {ChatUser}
	 */
	get user() {
		return this._user;
	}

	set users(data) {
		this._users = data.map((user) => new ChatUser(user.id, this, { data: user }));
	}

	/**
	 * Get users of context
	 * @type {ChatUser[]}
	 */
	get users() {
		return this._users;
	}

	set message(data) {
		this._message = new Message(this, data);
	}

	/**
	 * Gets message of context
	 * @type {Message}
	 */
	get message() {
		return this._message;
	}
}
