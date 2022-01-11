import Calls from "../../utils/calls.js";
import ChatPaginator from "./ChatPaginator.js";
import ChatUser from "./ChatUser.js";
import Message from "./Message.js";
import { EventEmitter } from "events";

export default class Channel extends EventEmitter {
	/**
	 *
	 * @param {import("./Context").default} context
	 * @param {*} payload
	 */
	constructor(context, payload) {
		super();

		/**
		 * @type {import("./Context").default}
		 */
		this.context = context;

		/**
		 * @type {import("./SocketInstance").default}
		 */
		this.socket = this.context.chats.socket;

		this._payload = payload;

		/**
		 * Part of the freshable to check to see if data is in need of an update
		 * @type {Boolean}
		 */
		this._update = false;
		if (this._payload?.users && !context.users) {
			this.context.users = this._payload.users;
		}

		/**
		 * @type {ChatUser[]}
		 */
		this.users = context.users;
	}

	/**
	 * Gets a fresh object with new, updated data.
	 * @type {Channel}
	 */
	get fresh() {
		this._update = true;
		return this;
	}

	/**
	 * Get data from the payload and let it freshen up if needed
	 * @param {String} key
	 * @returns {Promise<any>}
	 */
	async get(key, fallback = null) {
		if (this._update) {
			this._payload = this._payload; //Replace with new payload
		}

		return this._payload[key] ?? fallback;
	}

	/**
	 * Number of unread messages
	 * @type {Promise<Number>}
	 */
	get unread_messages() {
		return this.get("messages_unread");
	}

	/**
	 * Url of chat image
	 * @type {Promise<String>}
	 */
	get cover() {
		return this.get("cover");
	}

	/**
	 * Name of the chat
	 * @type {Promise<String>}
	 */
	get title() {
		return this.get("title");
	}

	/**
	 * whether or not the client has joined the channel
	 * @type {Promise<Boolean>}
	 */
	get joined() {
		return (async () => {
			return (await this.get("join_state")) == 2;
		})();
	}

	/**
	 * Number of members online
	 * @type {Promise<Number>}
	 */
	get members_online() {
		return this.get("members_online");
	}

	/**
	 * Total number of members
	 * @type {Promise<Number>}
	 */
	get members_total() {
		return this.get("members_total");
	}

	/**
	 * Unique id of the channel
	 * @type {Promise<String>}
	 */
	get name() {
		return this.get("name");
	}

	/**
	 * Synchronous version of `this.name`
	 * @type {String}
	 */
	get name_sync() {
		return this._payload?.name ?? null;
	}

	/**
	 * Is this channel a dm with someone else?
	 * @type {Promise<Boolean>}
	 */
	get is_dm() {
		return (async () => {
			return (await this.get("type")) == 1;
		})();
	}

	/**
	 * Is this channel a private group chat?
	 * @type {Promise<Boolean>}
	 */
	get is_private() {
		return (async () => {
			return (await this.get("type")) == 2;
		})();
	}

	/**
	 * Is this channel a public group chat?
	 * @type {Promise<Boolean>}
	 */
	get is_public() {
		return (async () => {
			return (await this.get("type")) == 3;
		})();
	}

	/**
	 * Generator of messages you can iterate over
	 * @type {Promise<Generator<import("./Message").default>>}
	 */
	get messages() {
		return Promise.resolve(
			async function* () {
				let messages = ChatPaginator(this.context, {
					call: Calls.list_messages,
					key: "messages",
					SocketOpts: {
						limit: 50,
						chat_name: this.name,
					},
				});

				for await (let message of messages()) {
					yield new Message(this.context, message);
				}
			}.bind(this)()
		);
	}

	/**
	 * Generator of operators you can iterate over
	 * @type {Promise<Generator<import("./ChatUser").default>>}
	 */
	get operators() {
		return Promise.resolve(
			async function* () {
				if (!(await this.is_public)) {
					return;
				}

				let operators = ChatPaginator(this.context, {
					call: Calls.list_operators,
					key: "operators",
					SocketOpts: {
						chat_name: this.name, //weirdly the argument is called chat_name here
						limit: 120,
					},
				});

				for await (let operator of operators()) {
					yield new ChatUser(operator.id, this.context, operator);
				}
			}.bind(this)()
		);
	}

	/**
	 * Generator of members you may iterate over
	 * @type {Promise<Generator<import("./ChatUser").default>>}
	 */
	get members() {
		return Promise.resolve(
			async function* () {
				let members = ChatPaginator(this.context, {
					call: Calls.list_members,
					key: "members",
					SocketOpts: {
						chat_name: this.name,
						limit: 200,
						query: null,
					},
				});

				for await (let member of members()) {
					yield new ChatUser(member.id, this.context, member);
				}
			}.bind(this)()
		);
	}

	/**
	 * Gets a user from a channel by their username
	 * @param {String} nick
	 * @returns {Promise<ChatUser|null>}
	 */
	async fetch_by_nick(nick) {
		for await (let user of await this.members) {
			if ((await user.nick) == nick) {
				return user;
			}
		}
		return null;
	}

	/**
	 * Gets a user from a channel by there id
	 * @param {String} id
	 * @returns {Promise<ChatUser|null>}
	 */
	async fetch_by_id(id) {
		for await (let user of await this.members) {
			if ((await user.id) == id) {
				return user;
			}
		}
		return null;
	}

	/**
	 * Kicks a user from this chat
	 * @param {import("../User.js").default|ChatUser|String} user
	 * @returns {Promise}
	 */
	kick(user) {
		let id = user?.id || user;
		return this.socket.call(Calls.kick_member, [this.name, id]);
	}

	/**
	 * Hides the chat client side
	 * @returns {Promise}
	 */
	hide() {
		return this.socket.call(Calls.hide_chat, [this.name]);
	}

	/**
	 * Adds an operator to a PUBLIC group chat
	 * @param {import("../User.js").default|import("./ChatUser.js").default|String} user
	 * @returns {Promise}
	 */
	async add_operator(user) {
		//Add error handling lol
		let id = user?.id || user;

		for await (let operator of await this.operators) {
			if (operator.id == this.context.chats.client.id) {
				return this.socket.call(Calls.register_operators, [
					await this.name,
					[id],
				]);
			}
		}

		throw new Error("Bot must be an operator to add operators");
	}

	/**
	 * Mutes a channel for specified number of MS
	 * @param {Number} until When you want the mute to stop
	 * @returns {Promise}
	 */
	mute(until) {
		//Until needs to be a UNIX stamp
		// ! chat is undefined
		return this.socket.call(Calls.mute - chat, [this.name, until]);
	}

	/**
	 * Unmutes a channel
	 * @returns {Promise}
	 */
	unmute() {
		return this.socket.call(Calls.unmute_chat, [this.name]);
	}

	/**
	 * Accepts an invite from a channel
	 * @returns {Promise}
	 */
	accept_invite() {
		return this.socket.call(Calls.accept_invite, [this.name]);
	}

	/**
	 *
	 * @param {*} content
	 * @param {Object} opts
	 * @param {String|null} [opts.nick] Nickname of user to send to the right channel
	 * @returns {Promise<{[key: string]: any}>}
	 */
	async send(content, opts = {}) {
		/**
		 * Add feature for system messages
		 */
		return new Promise((resolve, reject) => {
			//let nick = (!(opts.nick) && (opts.nick != null)) ? this.context.author.nick : opts.nick
			let nick = opts.nick || null;

			this.context.chats.messageQueue.addToQueue({
				// ! this.name_sync hasn't binded the channel
				name: this.name_sync,
				nick: nick,
				content: content,
				callback: (data) => {
					resolve(data);
				},
			});
		});
	}

	/**
	 * Starts listening to a channel and emits to "message"
	 */
	listen() {
		this.socket.subscribe(Calls.listen_to_chat(this.name), (data) => {
			if (data.message) {
				this.emit("message", new Message(this.context, data.message));
			}
		});
	}

	/**
	 * Stops listening to a channel
	 * @returns {Promise}
	 */
	stop_listening() {
		return this.socket.unsubscribe(Calls.listen_to_chat(this.name));
	}
}
