// @ts-check

import Events from "events"; // allows for events like 'on_message'
import { sleep, paginator, post_body_paginator } from "../utils/methods.js";
import { ApiError, CaptchaError, AuthError } from "../utils/exceptions.js";
import Ban from "./small/Ban.js";
import axios from "axios";
import User from "./User.js";
import Guest from "./small/Guest.js";
import crypto from "crypto";
import Chats from "./Chats.js";
import ImagePost from "./small/ImagePost.js";
import VideoPost from "./small/VideoPost.js";
import Comment from "./Comment.js";
import Reply from "./small/Reply.js";
import FormData from "form-data";

/**
 * @typedef {Object} ClientOpts
 * @property {string} [user_agent] User agent to make requests with
 * @property {string} [prefix] Prefix for the bot commands
 * @property {string} [token] Bearer token for the bot to use if you have one stored
 * @property {string} [basic] Basic token for the bot to use if you have one stored
 * @property {Object} [config] Config for the bot to use
 */

/**
 * @typedef {Object} UserStats
 * @property {number} subscriptions Amount of subscriptions the user has
 * @property {number} subscribers Amount of subcribers the user has
 * @property {number} total_posts Amount of total posts the user has
 * @property {number} created Amount of created posts the user has
 * @property {number} featured Amount of features the user has
 * @property {number} total_smiles Amount of total smiles the user has
 * @property {number} achievements Amount of achievements the user has
 */

/**
 * @typedef {Object} ProfilePicture
 * @property {string} bg_color Background color of the profile picture
 * @property {Object} thumb Thumbnail urls of the profile picture
 * @property {string} thumb.small_url small url of the thumbnail 100x
 * @property {string} thumb.medium_url medium url of the thumbnail 200x
 * @property {string} thumb.large_url large url of the thumbnail 400x
 * @property {string} url URL of the profile picture
 */

/**
 * @typedef {Object} Level
 * @property {string} id Id of the level
 * @property {number} value Level rank (IE Level 1)
 * @property {number} points Amount of points needed to reach the level
 */

/**
 * @typedef {Object} UserRating
 * @property {number} points Amount of points the user has
 * @property {Level} current_level The current level of the user
 * @property {Level} next_level The next level for the user
 * @property {Level} max_level The max level for the API (99)
 * @property {boolean} is_show_level Does the rating show on the user's profile? (Not enabled)
 */

/**
 * Client used for interacting with the API
 */
export default class Client extends Events {
	/**
	 * @param {ClientOpts} [opts] Options for the Client to use
	 */
	constructor(opts = {}) {
		super();

		// Read only data

		/**
		 * Client Id for creating the basic token
		 * @private
		 * @type {string}
		 */
		this._client_id = "MsOIJ39Q28";

		/**
		 * Client secret for creating the basic token
		 * @private
		 * @type {string}
		 */
		this._client_secret = "PTDc3H8a)Vi=UYap";

		// Data updated by methods

		/**
		 * Is the Client authorized for requests? (Has a valid bearer token)
		 * @type {Boolean}
		 */
		this.authorized = false;

		/**
		 * Should the Client use cached data?
		 * @private
		 * @type {Boolean}
		 */
		this._update = false;

		/**
		 * Cached payload from request
		 * @private
		 * @type {Object}
		 */
		this._payload = {};

		/**
		 * Client's cached user object
		 * @private
		 * @type {User}
		 */
		this._user = new User(null, this, { url: this.request_url });

		/**
		 * Url for this.get
		 * Only change if you know what you're doing
		 * @type {string}
		 */
		this.request_url = `/account`;

		// optional property defaults

		/**
		 * User agent for making requests
		 * iFunny version must be the most recent version for oauth!
		 * @type {string}
		 */
		this.user_agent =
			opts.user_agent ||
			"iFunny/7.18.1(1120212) Android/12 (samsung; SM-G996U; samsung)";

		/**
		 * Prefix for the bot
		 * @type {string|null}
		 */
		this.prefix = opts.prefix || null;

		/**
		 * Instance of axios with headers
		 * @type {import('axios').AxiosInstance}
		 */
		this.instance = axios.create({
			baseURL: "https://api.ifunny.mobi/v4/",
			timeout: 2500,
			headers: {
				"Ifunny-Project-Id": "iFunny",
				"User-Agent": this.user_agent,
				applicationstate: 1,
				accept: "application/json,image/jpeg,image/webp,video/mp4",
				"accept-language": "en-US",
				"accept-encoding": "gzip",
			},
		});

		// Request interceptors
		this.instance.interceptors.request.use((config) => {
			// Update headers for FormData requests
			if (config.data instanceof FormData) {
				Object.assign(config.headers, config.data.getHeaders());
			}
			return config;
		});

		// Reponse interceptors

		this.instance.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error?.response?.status === 408 || error?.code === "ECONNABORTED") {
					return Promise.reject(
						new ApiError(
							error,
							`Timeout (${error.config.timeout}ms) Exceeded on url "${error.config.url}"`
						)
					);
				} else return Promise.reject(error);
			}
		);

		// Checks opts.token to see if it's a valid bearer token
		if (opts.token) {
			if (typeof opts.token !== "string") {
				throw new TypeError(`Token must be a string, not ${typeof opts.token}`);
			}
			if (!opts.token.match(/^[a-z0-9]{64}$/g) || opts.token.length !== 64) {
				throw new Error(`Invalid bearer token: ${opts.token}`);
			}
			this.instance.defaults.headers["Authorization"] = `Bearer ${opts.token}`;
			this.authorized = true; // Assumes valid bearer token
		}

		/**
		 * Bearer token if stored in cache
		 * @type {string|null}
		 */
		this._token = opts.token ?? null;

		/**
		 * Basic token if stored in cache
		 * @type {string|null}
		 */
		this._basic = opts.basic ?? null;

		/**
		 * Config for whatever you need to store within the client
		 * @type {Object}
		 */
		this.config = opts.config ?? {};

		// Make sure that our config file exists and use it

		/**
		 * The client's chat clinet instance
		 * @type {Chats}
		 */
		this.chats = new Chats(this);
	}

	/**
	 * Client's on Event handler use {EventEmitter}
	 * @param {('login')} event_name
	 * @param {{(...args: any): void}} listener
	 * **Events:** \
	 * `login`: `boolean`
	 */
	on(event_name, listener) {
		super.on(event_name, listener);
		return this;
	}

	/**
	 * Get value from cache or update cache
	 * @param {string} key Key to query
	 * @param {*} [fallback=null] Fallback value if no value is found (default's to null)
	 * @return {Promise<*>} Retrieved data from key or fallback
	 * @throws `Error`
	 */
	async get(key, fallback = null) {
		// Checks authorization before attempting a request
		if (!this.authorized || !this.bearer) {
			throw new Error(`Client not authorized\nToken: ${this.bearer}`);
		}

		let value = this._payload[key];

		// if the key was was cached and we don't care about updated data
		if (value !== undefined && !this._update) {
			this._update = false;
			return value;
		}

		this._update = false;

		await this._update_payload();

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
	 * This objects config, loaded from and written to a json file
	 * @type {Object}
	 */
	get config() {
		if (!this._config) {
			this._config = {};
		}
		return this._config;
	}

	/**
	 * Update this clients config
	 * and write it to the config file
	 */
	set config(value) {
		if (typeof value !== "object") {
			throw `value should be object, not ${typeof value}`;
		}
		this._config = value;
	}

	/**
	 * Bearer token for this client
	 * @type {string|null}
	 */
	get bearer() {
		return this._token;
	}

	/**
	 * Sets the client's token and updates this.authorized
	 */
	set bearer(value) {
		if (value === null) {
			this.authorized = false;
			this._token = value;
			return;
		}
		if (typeof value !== "string") {
			throw new TypeError(`Token must be a string, not ${typeof value}`);
		}
		if (!value.match(/^[a-z0-9]{64}$/g) || value.length !== 64) {
			throw new Error(`Invalid bearer token: ${value}`);
		}
		this.instance.defaults.headers["Authorization"] = `Bearer ${value}`;

		this.authorized = true; // Assumes valid bearer token
		this._token = value;
	}

	/**
	 * iFunny Base API
	 * @type {string}
	 */
	get api() {
		return "https://api.ifunny.mobi/v4";
	}

	/**
	 * iFunny headers, needed for all requests
	 * Will use which appropriate authentication is available
	 * @type {Object}
	 */
	get headers() {
		let auth = this.bearer || this.basic_token;
		let type = this.bearer ? "Bearer " : "Basic ";
		return {
			"Ifunny-Project-Id": "iFunny",
			"User-Agent": this.user_agent,
			Authorization: type + auth,
			applicationstate: 1,
			accept: "application/json,image/jpeg,image/webp,video/mp4",
			"accept-language": "en-US",
			"accept-encoding": "gzip",
		};
	}

	/**
	 * iFunny basic auth token\
	 * If none is stored in this Client cache, one will be generated
	 * @type {string}
	 */
	get basic_token() {
		// Return cached basic token
		if (this._basic && !this._update) {
			return this._basic;
		}

		// Generate the token
		// ? Basic tokens must be made using UUIDv4, and must be 156 characters long
		let uuid = crypto.randomUUID().replace(/\-/g, "");
		let hex = crypto.createHash("sha256").update(uuid).digest("hex").toUpperCase();
		let a = hex + `_${this._client_id}:`;
		let b = hex + `:${this._client_id}:${this._client_secret}`;
		let c = crypto.createHash("sha1").update(b).digest("hex");
		let auth = Buffer.from(a + c).toString("base64");

		this._basic = auth;
		this._update = false;
		return auth;
	}

	/**
	 * Update's the Client's account payload for getters.\
	 * Can await this if you want to see the full object details
	 * @private
	 * @returns {Promise<Object>} The Client's payload
	 * @throws {@link ApiError}
	 * @throws `Error`
	 */
	async _update_payload() {
		if (!this.authorized || !this.bearer) {
			throw new Error(`Client not authorized\nToken: ${this.bearer}`);
		}
		try {
			let response = await this.instance.request({
				url: this.request_url,
			});

			// Update values included in response
			Object.assign(this._payload, response.data.data);

			// Update user payload
			this._user = new User(this.id_sync, this, {
				data: this._payload,
				url: this.request_url,
			});

			return this._payload;
		} catch (error) {
			let data = error?.response?.data;
			if (data?.error === "invalid_grant") {
				throw new ApiError(error, data.error_description);
			} else throw error?.response ?? error;
		}
	}

	// ? Captcha needs to be solved to login for the first time
	/**
	 * Logs the Client in
	 * @param {Object} [opts] Optional params for logging in
	 * @param {string} [opts.email] Email of the Client to log in with
	 * @param {string} [opts.password] Password to log in with, required if no bearer is stored
	 * @param {Boolean} [opts.force=false] Force log in with email and password
	 * @return {Promise<Client>} Itself after the login completes
	 * @throws {@link CaptchaError}
	 * @fires Client#login
	 */
	async login(opts = { force: false }) {
		// Use stored bearer
		if (this.bearer && !opts.force) {
			await this._update_payload();
			this.authorized = true;
			this.emit("login", false);
			return this;
		}

		if (!opts.email) {
			throw new Error("email is required to login without a token");
		}

		// Needs password to generate new bearer token
		if (!opts.password) {
			throw new Error("No stored token, password is required");
		}

		let info = {
			grant_type: "password",
			username: opts.email,
			password: opts.password,
		};

		let data = Object.keys(info)
			.map((key) => `${key}=${info[key]}`)
			.join("&");

		try {
			let response = await this.instance.request({
				method: "POST",
				url: `/oauth2/token`,
				headers: {
					"content-type": "application/x-www-form-urlencoded",
				},
				data: data,
			});

			if (!response?.data?.access_token) {
				throw new Error("access_token not given");
				//console.log(response.data);
			}
			// uses sette function
			this.bearer = response.data.access_token;
		} catch (error) {
			//console.error(error?.data);
			if (error.response.data.error === "captcha_required") {
				throw new CaptchaError(error);
			} else if (error.response.data.error === "too_many_user_auths") {
				throw new AuthError(error);
			} else throw error;
		}

		await sleep(5); // Primes bearer

		await this._update_payload();
		this.emit("login", true);
		return this;
	}

	/**
	 * Gets a User by ID
	 * @param {string} id Id of the User to retrieve
	 * @return {Promise<User|null>} The {@link User} object of the client
	 * @throws {@link TypeError}
	 */
	async user_by_id(id) {
		if (typeof id !== "string") {
			throw new TypeError("id must be a string");
		}
		return await this.user.by_id(id);
	}

	/**
	 * Gets a User object by nickname
	 * @param {string} nick Nickname of the User to retrieve
	 * @return {Promise<User|null>} The {@link User} object of the client
	 * @throws {@link TypeError}
	 */
	async user_by_nick(nick) {
		if (typeof nick !== "string") {
			throw new TypeError("nick must be a string");
		}
		return await this.user.by_nick(nick);
	}

	/**
	 * The Client's User object
	 * @type {User}
	 */
	get user() {
		if (!!this._user.id_sync && !this._update) {
			return this._user;
		}
		this._user = new User(this.id_sync, this, {
			data: this._payload,
			url: this.request_url,
		});
		if (this._update) this._user._update = true;
		this._update = false;

		return this._user;
	}

	/**
	 * The email address attached to the Client
	 * @type {Promise<string|null>}
	 */
	get email() {
		return this.get("email");
	}

	/**
	 * The hometown of the Client
	 * @type {Promise<string>}
	 */
	get hometown() {
		return this.get("hometown", "");
	}

	/**
	 * The location of the Client
	 * @type {Promise<string>}
	 */
	get location() {
		return this.get("location", "");
	}

	/**
	 * The Client's User Id
	 * @type {Promise<string|null>}
	 */
	get id() {
		return this.get("id", this.id_sync);
	}

	/**
	 * Synchronous version of {@link Client.id}\
	 * Will return `null` if the Client hsan't made any requests
	 * @type {string|null}
	 */
	get id_sync() {
		return this._payload?.id ?? null;
	}

	/**
	 * Nick of the lient
	 * @type {Promise<string|null>}
	 */
	get nick() {
		return this.get("nick");
	}

	/**
	 * Original nick of the Client
	 * @type {Promise<string>}
	 */
	get original_nick() {
		return this.get("original_nick", this.nick);
	}

	/**
	 * Chat privacy of the Client\
	 * `public` allows anyone to open a chat with the User\
	 * `subscribers` only allows subscribers to open a chat with the User\
	 * `closed` doesn't allow anyone to open a chat with the User
	 * @type {Promise<string|null>}
	 */
	get chat_privacy() {
		return this.get("messaging_privacy_status");
	}

	/**
	 * The Client's about
	 * Alias for {@link bio Client.bio}
	 * @type {Promise<string>}
	 */
	get about() {
		return this.get("about", "");
	}

	/**
	 * The Client's bio
	 * Alias for {@link about Client.about}
	 * @type {Promise<string>}
	 */
	get bio() {
		return this.about;
	}

	/**
	 * The Client's account link that can be opened in iFunny\
	 * Alias for {@link web_url Client.web_url}
	 * @type {Promise<string>}
	 */
	get link() {
		return this.web_url;
	}

	/**
	 * The Client's account link that can be opened in iFunny\
	 * Alias for {@link link Client.link}
	 * @type {Promise<string>}
	 */
	get web_url() {
		return this.get("web_url");
	}

	/**
	 * The Client's profile picture
	 * @type {Promise<ProfilePicture>}
	 */
	get profile_picture() {
		return this.get("photo");
	}

	/**
	 * The Client's cover image url
	 * @type {Promise<{ url: string, bg_color: string }>}
	 */
	get cover_image() {
		return this.user.cover_image;
	}

	/**
	 * Is this User available for chat?
	 * You can't chat with yourself so this should always be false
	 * @type {Promise<Boolean>}
	 */
	get can_chat() {
		return this.get("is_available_for_chat");
	}

	/**
	 * Is the Client User's account private?
	 * @type {Promise<Boolean>}
	 */
	get is_private() {
		return this.get("is_private");
	}

	/**
	 * Has the Client used chats before?
	 * @type {Promise<Boolean>}
	 */
	get chat_active() {
		return this.get("messenger_active");
	}

	/**
	 * Client's messenger token for chats
	 * I believe this is left over from sendbird chats
	 * @type {Promise<string>}
	 */
	get chat_token() {
		return this.get("messenger_token", "1010101010101010101010101010101010101010");
	}

	/**
	 * Is the Client blocked from using chat?
	 * @type {Promise<Boolean>}
	 */
	get blocked_in_chats() {
		return this.get("is_blocked_in_messenger");
	}

	/**
	 * Is the Client in safe mode?
	 * Only sees memes approved by moderators
	 * @type {Promise<Boolean>}
	 */
	get safe_mode() {
		return this.get("safe_mode");
	}

	/**
	 * Is the Client an iFunny moderator?
	 * @type {Promise<Boolean>}
	 */
	get is_moderator() {
		return this.get("is_moderator");
	}

	/**
	 * Is the Client an iFunny team member?
	 * @type {Promise<Boolean>}
	 */
	get is_staff() {
		return this.get("is_ifunny_team_member");
	}

	/**
	 * Does the Client have unnotified bans?
	 * @type {Promise<Boolean>}
	 */
	get has_unnotified_bans() {
		return this.get("have_unnotified_bans");
	}

	/**
	 * Does the Client have unnotified strikes?
	 * @type {Promise<Boolean>}
	 */
	get has_unnotified_strikes() {
		return this.get("have_unnotified_strikes");
	}

	/**
	 * Does the Client have unnotified achievements?
	 * @type {Promise<Boolean>}
	 */
	get has_unnotified_achievements() {
		return this.get("have_unnotified_achievements");
	}

	/**
	 * Does the Client have unnotified levels?
	 * @type {Promise<Boolean>}
	 */
	get has_unnotified_levels() {
		return this.get("have_unnotified_levels");
	}

	/**
	 * Does the Client need to go through account setup?
	 * @type {Promise<Boolean>}
	 */
	get need_account_setup() {
		return this.get("need_account_setup");
	}

	/**
	 * Is the Client verified?
	 * @type {Promise<Boolean>}
	 */
	get is_verified() {
		return this.get("is_verified");
	}

	/**
	 * Is the Client banned?
	 * @type {Promise<Boolean>}
	 */
	get is_banned() {
		return this.get("is_banned");
	}

	/**
	 * Is the Client's account deleted?
	 * @type {Promise<Boolean>}
	 */
	get is_deleted() {
		return this.get("is_deleted");
	}

	/**
	 * Current bans attached to Client
	 * @type {Promise<Ban[]>}
	 */
	get bans() {
		return (async () => {
			/** @type {Object[]} */
			let bans = await this.get("bans", []);
			return bans.map((data) => new Ban(data.id, this, { data }));
		})();
	}

	/**
	 * The Client's {@link Stats} object
	 * Don't get this data directly, use the getter for them
	 * @type {Promise<UserStats|null>}
	 */
	get stats() {
		return this.get("num");
	}

	/**
	 * Amount of users the Client is subscribed to
	 * @type {Promise<number>}
	 */
	get subscription_count() {
		return (async () => {
			return (await this.stats)?.subscriptions ?? 0;
		})();
	}

	/**
	 * Amount of subcribers the Client has
	 * @type {Promise<number>}
	 */
	get subscriber_count() {
		return (async () => {
			return (await this.stats)?.subscribers ?? 0;
		})();
	}

	/**
	 * Amount of total posts on the Client's account
	 * @type {Promise<number>}
	 */
	get post_count() {
		return (async () => {
			return (await this.stats)?.total_posts ?? 0;
		})();
	}

	/**
	 * Amount of posts that the Client uploaded (non-repubs)\
	 * Alias for {@link original_post_count Client.original_post_count}
	 * @type {Promise<number>}
	 */
	get created_count() {
		return (async () => {
			return (await this.stats)?.created ?? 0;
		})();
	}

	/**
	 * Amount of posts that the Client uploaded (non-repubs)
	 * Alias for {@link created_count Client.created_count}
	 * @type {Promise<number>}
	 */
	get original_post_count() {
		return this.created_count;
	}

	/**
	 * Amount of posts on the clients account that are republishes
	 * Not original
	 * @type {Promise<number>}
	 */
	get republication_count() {
		return (async () => {
			return (await this.post_count) - (await this.created_count);
		})();
	}

	/**
	 * Amount of features the Client has
	 * @type {Promise<number>}
	 */
	get feature_count() {
		return (async () => {
			return (await this.stats)?.featured ?? 0;
		})();
	}

	/**
	 * Amount of smiles the Client has (only counts for posts)
	 * @type {Promise<number>}
	 */
	get smile_count() {
		return (async () => {
			return (await this.stats)?.total_smiles ?? 0;
		})();
	}

	/**
	 * Amount of achievements the Client has
	 * @type {Promise<number>}
	 */
	get achievement_count() {
		return (async () => {
			return (await this.stats)?.achievements ?? 0;
		})();
	}

	/**
	 * Rating of the User (No longer used by iFunny)
	 * @type {Promise<UserRating|null>}
	 */
	get rating() {
		return this.get("rating");
	}

	/**
	 * Gets a post object by data or id
	 * @param {object|string} post Post data or id of the post to retrieve
	 * @returns {Promise<ImagePost|VideoPost>}
	 */
	async get_post(post = null) {
		if (!["string", "object"].includes(typeof post)) {
			throw new TypeError("post must be a string or an object");
		}

		console.log(typeof post);
		if (typeof post === "string") {
			try {
				let { data } = await this.instance.request({
					url: `/content/${post}`,
				});
				if (!data?.data) return null;
				post = data.data;
			} catch (error) {
				if (error?.response?.data?.error === "not_found") {
					return null;
				} else throw error;
			}
		} else if (typeof post === "object" && post?.id && post?.type) {
		} else {
			throw new TypeError(
				"post must be a string or an object with id and type properties"
			);
		}

		switch (post?.type) {
			case "comics":
			case "caption":
			case "pic":
				return new ImagePost(post.id, this, { data: post });
			case "video_clip":
			case "vine":
			case "gif":
			case "gif_caption":
				return new VideoPost(post.id, this, { data: post });
			default:
				throw new Error(
					`Post (${post?.id ?? post}): Invalid post type: (${
						post?.type
					})\n${post}`
				);
		}
	}

	/**
	 * Gets a Comment or reply object from the Comment data
	 * @param {Object} comment Comment data to retrieve comment object from
	 * @returns {Promise<Reply|Comment>} Reply if comment is a reply, Comment otherwise
	 */
	async get_comment(comment) {
		if (!comment?.id || !comment?.cid) {
			throw new Error(`Comment (${typeof comment}) is invalid`);
		}
		let comm = new Comment(comment, this);
		if (await comment.is_reply) {
			return new Reply(comm._payload, this);
		}
		return comm;
	}

	/**
	 * Paginates {@link Guest Guests} from the client's guests
	 * @param {number} limit Limit on number of guests per API call
	 * @yields {Guest}
	 */
	async *guests(limit = 30) {
		let url = `/users/${await this.id}/guests`;

		let each_guest = paginator(this, {
			url: url,
			key: "guests",
			params: { limit },
		});

		for await (let item of each_guest) {
			let guest = item.guest;
			yield new Guest(guest.id, this, {
				data: guest,
				visited_at: item.visit_timestamp,
			});
		}
	}

	/**
	 * Paginates posts from the user's timeline
	 * @param {number} limit Number of posts per API call
	 * @yields {Promise<ImagePost|VideoPost>}
	 */
	async *timeline(limit = 30) {
		let posts = this.user.timeline(limit);
		for await (let post of posts) {
			yield post;
		}
	}

	/**
	 * Paginates posts from the featured feed
	 * @param {number} limit
	 * @param {boolean} is_new
	 */
	async *features(limit = 30, is_new = false) {
		let url = `/feeds/featured`;
		let feat_posts = paginator(this, {
			url,
			key: "content",
			params: { limit, is_new },
		});

		for await (let post of feat_posts) {
			yield await this.get_post(post);
		}
	}

	/**
	 * Paginates posts from the collective feed
	 * @param {number} limit
	 */
	async *collective(limit = 30) {
		let coll_posts = post_body_paginator(this, {
			url: "/feeds/collective",
			key: "content",
			body: { limit },
		});

		for await (let post of coll_posts) {
			yield await this.get_post(post);
		}
	}

	/**
	 * Paginates comments by the client
	 * @param {number} limit Number of comments per api request
	 * @yields {Promise<ImagePost|VideoPost>}
	 */
	async *comments(limit = 30) {
		let my_comms = paginator(this, {
			url: "/users/my/comments",
			key: "comments",
			params: { limit },
		});

		for await (let comment of my_comms) {
			//console.log(comment);
			yield await this.get_comment(comment);
		}
	}

	/**
	 * Request a password reset for iFunny's servers.\
	 * Resetting a password will void all bearers attatched to the account\
	 * Requesting a password reset under another account's email *will* work, but it sends the link to their email, not yours.\
	 * Attempting this anyways, will likely result in account ban or bot detection!
	 * @param {string} email Email of account to request password reset for.
	 */
	async request_password_reset(email = null) {
		if (!email) email = await this.email;
		let form = new FormData();
		form.append("email", email);

		let { data } = await this.instance.request({
			method: "POST",
			url: `${this.request_url}/password_change_request`,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			data: form,
		});

		return data?.status === 200;
	}
}
