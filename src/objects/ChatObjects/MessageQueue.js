/**
 * @callback MessageCallback
 * @param {MessageObject}
 */

/**
 * @typedef {Object} MessageObject Object that message queue data is stored in
 * @property {String} channel_name
 * @property {String} nick
 * @property {String} content
 * @property {MessageCallback} callback
 */

/**
 * Message queuer and handler
 */
export default class MessageQueue {
	/**
	 * @param {import("../Chats.js").default} chat_client
	 */
	constructor(chat_client) {
		/**
		 * @type {import("../Chats.js").default}
		 */
		this.chats = chat_client;

		/**
		 * @type {MessageObject[]}
		 */
		this.queued_messages = [];

		/**
		 * @type {MessageObject[]}
		 */
		this.queued_priority = [];
	}

	/**
	 * Adds priority messages to the front of the queued messages
	 */
	handlePriority() {
		let priority = [].concat(this.queued_priority);
		for (let message of priority) {
			this.queued_messages.unshift(message);
			this.queued_priority.shift();
		}
	}

	/**
	 * Recursive function for sorting and handling messages.
	 * @param {Number} [timeout=0] Time befire next recursion of message.
	 */
	handle(timeout = 0) {
		setTimeout(() => {
			let message = this.queued_messages[0];
			let content = "";
			let contents = {};

			if (!message) {
				this.queued_messages.shift();
				this.handlePriority();
				this.handle();
				return;
			}

			let callbacks = [];

			// ! Broken, needs to be fixed to send messages properly
			// ? Channel.send() just calls chats.send_message() directly
			// TODO Fix message sending so that it follows rate limit handling guidelines
			/**
			 * ? Rate Limit: 20 messages per minute
			 * Client should never be rate limited
			 * If there was no message sent in the last 3 seconds, send it immediately.
			 * If one WAS sent in the last 3 seconds, have the client wait the duration of the 3 seconds before sending the next message
			 * Consolidate a lot of messages for the same channel into the same message to reduce messages sent
			 * * Make auto-ratelimit handling an option, NOT a requirement, in case the user wants to handle it themselves
			 */
			for (let index in this.queued_messages) {
				let queued_message = this.queued_messages[index];
				if (queued_message.channel_name != message.channel_name) continue;

				let total_length = 0;

				for (let name in contents) {
					total_length += name.length + 2 + contents[name].length;
				}

				if (contents[queued_message.nick]) {
					if (total_length + queued_message.content.length + 2 < 5000) {
						contents[queued_message.nick] = `${
							contents[queued_message.nick]
						}${queued_message.content}`;
						callbacks.push(queued_message.callback);
						delete this.queued_messages[index];
					}
				} else {
					let queued_message_length =
						queued_message.nick.length + 2 + queued_message.content.length;

					if (total_length + queued_message_length < 5000) {
						contents[queued_message.nick] = `${queued_message.content}\n\n`;
						callbacks.push(queued_message.callback);
						delete this.queued_messages[index];
					}
				}
			}

			for (let nick in contents) {
				content += `${nick}: ${contents[nick]}\n`;
			}

			this.chats
				.send_message(message.name, content.slice(0, -3))
				.catch((err) => {
					if (err.error == "wamp.error.authorization_failed") {
						this.handle(1000);
					}
				})
				.then((data) => {
					this.queued_messages.shift();
					this.handlePriority();

					for (let callback of callbacks) {
						if (callback) {
							callback(data);
						}
					}
					this.handle(3050);
				});
		}, timeout);
	}

	/**
	 * adds a message to the queue
	 * @param {Object} opts
	 * @param {import("./Channel.js").default|String} opts.channel
	 * @param {import("./ChatUser.js").default|String} opts.nick
	 * @param {String} opts.content
	 * @param {MessageCallback} opts.callback
	 * @param {Boolean} [opts.priority=false]
	 */
	async addToQueue(opts) {
		let priority = opts.priority || false;

		let message = {
			channel_name: opts.channel?.name || opts.channel,
			nick: opts.user?.nick || opts.nick,
			content: opts.content,
			callback: opts.callback,
		};

		if (priority) {
			this.queued_priority.push(message);
		} else {
			this.queued_messages.push(message);
		}
	}
}
