// @ts-check

import FreshObject from "../FreshObject.js";

/**
 * Represents an iFunny Ban Object
 * @extends FreshObject
 * @see {@link Ban}
 */
export default class Ban extends FreshObject {
	/**
	 * @param {String} id Id of the ban
	 * @param {import("../Client.js").default} client Client the Ban object is attatched to
	 * @param {Object} [opts]
	 * @param {Object} [opts.data={}] The data received from the server
	 * @param {String} [opts.url] The url to make requests to
	 * @param {String} [opts.user_id] The user id to fetch bans for
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
		/**
		 * User id that the ban belongs to
		 * @type {String}
		 */
		this.user_id = opts.user_id || this.client.id_sync;

		/**
		 * Request url to make requests to
		 * @type {String}
		 */
		this.request_url = `/users/${this.user_id}/bans/${this.id_sync}`;
	}

	/**
	 * Id of the ban
	 * @type {Promise<String>}
	 */
	get id() {
		return (async () => {
			if (this.id_sync && !this._update) {
				return this.id_sync;
			}
			return await this.get("id");
		})();
	}

	/**
	 * Unix timestamp of when the ban expires
	 * @type {Promise<Date>}
	 */
	get date_until() {
		return (async () => {
			let time = await this.get("date_until");
			return time ? new Date(time * 1000) : null;
		})();
	}

	/**
	 * How much time is left for the ban to expire
	 * @type {Promise<Date>}
	 */
	get time_left() {
		return (async () => {
			let time = await this.date_until;
			return time ? new Date(time.getTime() - new Date().getTime()) : null;
		})();
	}

	/**
	 * The type of Ban
	 * @type {Promise<String>}
	 */
	get type() {
		return this.get("type");
	}
}
