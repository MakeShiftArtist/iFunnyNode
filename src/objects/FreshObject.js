// @ts-check

import EventEmitter from "events"; // allows for events like 'on_message'

/**
 * @typedef {Object} FreshOpts
 * @property {Object} [data={}] The data received from the server
 * @property {string} [url] The url to make requests to
 */

/**
 * @typedef {import("./Client.js").default} Client
 * @typedef {import('axios').AxiosInstance} AxiosInstance
 */

/**
 * Base object that all other objects will inherit
 * @extends EventEmitter
 */
export default class FreshObject extends EventEmitter {
	/**
	 * @param {string|null} id Id of the object
	 * @param {Client} client Client the object belongs to
	 * @param {Object} [opts={}] Opts for the Object being created
	 * @param {Object} [opts.data={}] The data received from the server
	 * @param {string} [opts.url] The url to make requests to
	 */
	constructor(id, client, opts = {}) {
		super();
		if (typeof id !== "string" && id !== null) {
			throw new TypeError("id must be a string");
		}

		/**
		 * Id of the object
		 * @type {string|null}
		 */
		this.id_sync = id;

		/**
		 * Client the object belongs to
		 * @type {Client}
		 */
		this.client = client;

		/**
		 * The url used for making requests to get information about the object
		 * @type {string}
		 */
		this.request_url = opts.url ?? "/account";

		// data updated by methods

		/**
		 * Payload of the object gotten from the request
		 * @type {Object}
		 */
		this._payload = opts.data || { id };

		/**
		 * Should we force a new data request for the object?
		 *
		 * @type {Boolean}
		 */
		this._update = false;

		/**
		 * Shortcut for {@link Client.instance}
		 * @type {AxiosInstance}
		 */
		this.instance = this.client.instance;
	}

	/**
	 * Get value from cached response
	 * @param {string} key  Key to query
	 * @param {*} fallback  Default value if no value is found
	 * @return {Promise<*>}  Retrieved data
	 */
	async get(key, fallback = null) {
		let value = this._payload[key];

		// if the key was was cached and we don't care about updated data
		if (value !== undefined && !this._update) {
			this._update = false;
			return value;
		}

		this._update = false;
		let response = await this.instance.request({
			url: this.request_url,
		});

		// update cached data without losing existing data
		Object.assign(this._payload, response.data.data);
		return this._payload[key] ?? fallback;
	}

	/**
	 * Sets this._update to true for fetching new data
	 * @example
	 * this.foo // cached value
	 * this.fresh.foo // new value
	 * @return {this} itself with this._update set to true
	 */
	get fresh() {
		this._update = true;
		return this;
	}

	/**
	 * Shortcut for 'this.client.api'
	 * @return {string} Client api
	 */
	get api() {
		return this.client.api;
	}

	/**
	 * Shortcut for `this.client.headers`
	 * @type {Object}
	 */
	get headers() {
		return this.client.headers;
	}
}
