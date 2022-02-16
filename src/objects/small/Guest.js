// @ts-check

import User from "../User.js";

/** @typedef {import('../Client.js').default} Client */

/**
 * Object representing an account guest
 * @extends User
 * @see {@link Guest}
 */
export default class Guest extends User {
	/**
	 * @param {string} id Id of the user
	 * @param {Client} client Client attached to the guest
	 * @param {Object} opts
	 */
	constructor(id, client, opts) {
		super(id, client, opts);

		/**
		 * The source timestamp of the visitor
		 * @type {number}
		 * @private
		 */
		this._timestamp = opts.visited_at ?? null;
	}

	/**
	 * When the User visited the client's profile
	 * @type {Date|null}
	 */
	get visited_at() {
		return this._timestamp ? new Date(this._timestamp) : null;
	}
}
