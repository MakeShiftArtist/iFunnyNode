import { EventEmitter } from "events";
import Socket from "./ChatObjects/SocketInstance.js";
import Calls from "../utils/calls.js";
import Context from "./ChatObjects/Context.js";
import MessageQueue from "./ChatObjects/MessageQueue.js";
import Channel from "./ChatObjects/Channel.js";

/**
 * Chat Client for using iFunny Chats via websockets
 * @extends EventEmitter
 */
export default class Chats extends EventEmitter {
	/**
	 * Chats handler and client for iFunny
	 * @param {import("./Client.js").default} client
	 */
	constructor(client) {
		super();
		/**
		 * The Base Client the Chat Client is connected to
		 * @type {import("./Client.js").default}
		 */
		this.client = client;

		/**
		 * The Chat Client's socket instance
		 * @type {Socket}
		 */
		this.socket = new Socket(this, client.id, client.bearer);

		/**
		 * @private
		 * @type {MessageQueue}
		 */
		this.messageQueue = new MessageQueue(this);

		/**
		 * Listeners for a specific channel
		 * @type {Channel[]}
		 */
		this.channel_listeners = [];

		/**
		 * Timestamp of chat start so we know to ignore old messages
		 * @type {Number}
		 */
		this.started_at = new Date().getTime();
	}

	/**
	 * Chat `on` Event handler, {EventEmitter}
	 * @param {('message')} event_name
	 * @param {{(...args: Context|any): void}} listener
	 * **Events:** \
	 * `message`: `Context`
	 */
	on(event_name, listener) {
		super.on(event_name, listener);
		return this;
	}

	/**
	 * Connects to websocket using a Wampy socket instance and gets channels and invites
	 * @returns {Promise<void>} An empty promise
	 */
	async connect() {
		this.socket.connect();

		this.started_at = new Date().getTime();

		this.socket.subscribe(Calls.invites(await this.client.id), (data) => {
			let context = new Context(this);
			context.channels = data.argsDict.chats;
			this.emit("invites", context);
		});

		this.socket.subscribe(Calls.chats(await this.client.id), async (data) => {
			for (let chat of data.argsDict.chats) {
				if (chat?.last_msg?.pub_at && chat?.last_msg?.pub_at < this.started_at) {
					return;
				}
				let context = new Context(this);
				context.channel = chat;

				if (chat.user) {
					context.user = chat.user;
				}

				if (chat.last_msg) {
					//1 == message
					//2 == file
					//3 == user_join
					//4 == user_leave
					//5 == channel_edit
					//6 == user_kicked
					switch (chat.last_msg.type) {
						case 1:
							context.message = chat.last_msg;
							this.emit("message", context);
							for (let channel of this.channel_listeners) {
								if (context.channel.name_sync === channel.name_sync) {
									channel.emit("message", context);
								}
							}
							break;
						case 2:
							context.file = chat.last_msg;
							this.emit("file", context);
							break;
						case 3:
							this.emit("user_joined", chat.last_msg);
							break;
						case 4:
							this.emit("user_left", chat.last_msg);
							break;
						case 5:
							this.emit("channel_edited", chat.last_msg);
							break;
						case 6:
							this.emit("user_kick", chat.last_msg);
							break;
						default:
							console.error(`UNKOWN MESSAGE TYPE:`, chat.last_msg);
					}
				}
				//Add author and users somewhere here
			}
		});

		this.messageQueue.handle();
	}

	/**
	 * Sends a message to a channel
	 * @param {import("./ChatObjects/Channel.js").default|String} channel
	 * @param {String} content Message you want to send
	 * @returns {Promise<{[key: string]: any}>}
	 */
	async send_message(channel, content) {
		let name = channel?.name || channel;
		return new Promise((resolve, reject) => {
			this.socket.publish(Calls.chat_publish(name), [200, 1, content], {
				onSuccess: (data) =>
					resolve({ timestamp: new Date().getTime(), ...data }),
				onError: (err) => reject(err),
			});
		});
	}

	// ! id is never called
	// TODO Fix Chats.get_chat
	/**
	 * @param {String} id
	 * @param {Context} context
	 * @returns {Promise<Channel>}
	 */
	async get_chat(id, context = null) {
		context = context || new Context(this);
		return new Promise((resolve, reject) => {
			this.socket.call(Calls.get_chat, {
				onSuccess: (data) => resolve(new Channel(context, data)),
				onError: (err) => reject(err),
			});
		});
	}
}
