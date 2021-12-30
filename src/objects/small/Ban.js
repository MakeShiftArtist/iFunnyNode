// @ts-check
"use strict";

import FreshObject from "../FreshObject.js";
import Client from "../Client.js";

/**
 * @typedef {Object} BanOpts
 * @property {Object} [data={}] The data received from the server
 * @property {String} [url] The url to make requests to
 * @property {String} [user_id] The user id to fetch bans for
 */

/**
 * Represents an iFunny Ban Object
 * @extends FreshObject
 */
export default class Ban extends FreshObject {
	/**
	 * @param {String} id Id of the ban
	 * @param {Client} client Client the Ban object is attatched to
	 * @param {BanOpts} [opts]
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
		this.request_url = `/users/${this.user_id}/bans/${this.id}`;
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
			return new Date(await this.get("date_until"));
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
