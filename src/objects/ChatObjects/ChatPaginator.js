/**
 * Paginator for chats using websocket calls
 * @param {import("./Context").default} context
 * @param {Object} PaginatorOpts
 * @param {String} PaginatorOpts.call Call that you want the paginator to make to the socket
 * @param {Object} PaginatorOpts.SocketOpts Opts to pass to the socket
 * @param {String} PaginatorOpts.key Key that you want the paginator to yield to
 */
export default function ChatPaginator(context, PaginatorOpts) {
	/**
	 * Generator function that remembers next data
	 */
	return async function* () {
		let call = PaginatorOpts.call;
		let opts = PaginatorOpts.SocketOpts;
		let key = PaginatorOpts.key;
		let next = null;
		let done = false;

		delete opts.next;

		function get() {
			return new Promise((resolve) => {
				let newOpts = { next: next, ...opts };

				context.chats.socket.call(call, newOpts, (data) => {
					next = data.argsDict.next || null;

					if (!next) {
						done = true;
					}

					resolve(data.argsDict[key]);
				});
			});
		}

		while (true) {
			let values = await get();
			for (let value of values) {
				yield value;
			}
			if (done) {
				break;
			}
		}

		return;
	};
}
