import Calls from "../../utils/calls.js";
import ChatPaginator from "./ChatPaginator.js";
import ChatUser from "./ChatUser.js";
import Message from "./Message.js";
import { EventEmitter } from "events";

/**
 * Channel object representing an iFunny chat channel.
 * @extends EventEmitter
 * @see {@link Channel}
 */
export default class Channel extends EventEmitter {
	/**
	 *
	 * @param {import("./Context.js").default} context
	 * @param {*} payload
	 */
	constructor(context, payload) {
		super();

		/**
		 * Context associated with this channel
		 * @type {import("./Context.js").default}
		 */
		this.context = context;

		/**
		 * The payload of the channel
		 * @type {{[key: String]: any}}
		 */
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
	 * Shortcut to `this.context.chats.socket`
	 * @type {import("./SocketInstance.js").default}
	 */
	get socket() {
		return this.context.chats.socket;
	}

	/**
	 * Shortcut for `this.context.chats.client`
	 */
	get client() {
		return this.context.chats.client;
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
	 * @type {Promise<Generator<Message>>}
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
	 * @type {Promise<Generator<ChatUser>>}
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
	 * @type {Promise<Generator<ChatUser>>}
	 */
	get members() {
		return Promise.resolve(
			async function* () {
				let members = ChatPaginator(this.context, {
					call: Calls.list_members,
					key: "members",
					SocketOpts: {
						chat_name: this.name_sync,
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
	 * The ChatUser object for the client
	 * @type {Promise<ChatUser|null>}
	 */
	get me() {
		return async () => {
			for await (let member of await this.members) {
				if (member.is_me) {
					return member;
				}
			}
			return null;
		};
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
		this.socket.call(Calls.kick_member, [this.name, id]);
		return this.fresh;
	}

	/**
	 * Hides the chat client side
	 * @returns {Promise}
	 */
	async hide() {
		this.socket.call(Calls.hide_chat, [this.name]);
		return this.fresh;
	}

	/**
	 * Adds an operator to a PUBLIC group chat
	 * @param {import("../User.js").default|ChatUser|String} user User object or id you want to add to operator list
	 * @returns {Promise}
	 */
	async add_operator(user) {
		// Client must be an admin to add operators
		if (!(await this.me).is_admin) {
			throw new Error("You must be an admin of the chat to add an operator");
		}

		let id = user?.id_sync || user;
		// TODO Use is_operator instead of for loop
		for await (let operator of await this.operators) {
			if (operator.id === (await this.client.id)) {
				this.socket.call(Calls.register_operators, [await this.name, [id]]);
				return this.fresh;
			}
		}

		throw new Error("Bot must be an admin to add operators");
	}

	/**
	 * Mutes a channel for specified number of MS
	 * @param {Number} until When you want the mute to stop
	 * @returns {Promise}
	 */
	mute(until) {
		//Until needs to be a UNIX stamp
		// ! chat is undefined
		this.socket.call(Calls.mute - chat, [this.name, until]);
		return this.fresh;
	}

	/**
	 * Unmutes a channel
	 * @returns {Promise<Channel>}
	 */
	unmute() {
		this.socket.call(Calls.unmute_chat, [this.name]);
		return this.fresh;
	}

	/**
	 * Accepts an invite from a channel
	 * @returns {Promise<Channel>} Channel.fresh
	 */
	accept_invite() {
		this.socket.call(Calls.accept_invite, [this.name]);
		return this.fresh;
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
			//let nick = opts.nick || null;
			/*
			this.context.chats.messageQueue.addToQueue({
				name: this.name_sync,
				nick: nick,
				content: content,
				callback: (data) => {
					resolve(data);
				},
			});
			*/
			this.context.chats.send_message(this.name_sync, content);
		});
	}

	/**
	 * Starts listening to a channel and emits to "message"
	 */
	listen() {
		let listeners = this.context.chats.channel_listeners;
		let infex_of = listeners.findIndex((ele) => ele.name_sync === this.name_sync);
		if (infex_of === -1) {
			this.context.chats.channel_listeners.push(this);
		}
	}

	/**
	 * Stops listening to a channel
	 */
	stop_listening() {
		let listeners = this.context.chats.channel_listeners;
		this.context.chats.channel_listeners = listeners.filter(
			(ele) => ele.name_sync !== this.name_sync
		);
	}
}
