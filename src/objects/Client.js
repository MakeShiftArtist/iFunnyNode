// @ts-check
import Events from "events"; // allows for events like 'on_message'
import { sleep } from "../utils/methods.js";
import { CaptchaError } from "../utils/exceptions.js";
import axios from "axios";
import { homedir } from "os";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import User from "./User.js";
import crypto from "crypto";

/**
 * Client used for interacting with the API
 */
export default class Client extends Events {
	/**
	 * @param {ClientOpts=} opts Options for the Client to use
	 */
	constructor(opts = {}) {
		super();

		// Read only data

		/**
		 * Client Id for creating the basic token
		 * @private
		 * @type {String}
		 */
		this._client_id = "MsOIJ39Q28";

		/**
		 * Client secret for creating the basic token
		 * @private
		 * @type {String}
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
		 * Url for this.get
		 * Only change if you know what you're doing
		 * @type {String}
		 */
		this.url = `/account`;

		// optional property defaults

		/**
		 * User agent for making requests
		 * iFunny version must be the most recent version for oauth!
		 * @type {String}
		 */
		this._user_agent =
			opts.user_agent ||
			"iFunny/7.14.2(22213) Android/12 (samsung; SM-G996U; samsung)";

		/**
		 * Prefix for the bot
		 * @type {String|null}
		 */
		this.prefix = opts.prefix || null;

		/**
		 * Bearer token if stored in cache
		 * @type {String|null}
		 */
		this._token = opts.token || null;

		/**
		 * Instance of axios with headers
		 * @type {import('axios').AxiosInstance}
		 */
		this.instance = axios.create({
			baseURL: "https://api.ifunny.mobi/v4/",
			timeout: 2500,
			headers: {
				"Ifunny-Project-Id": "iFunny",
				"User-Agent": this._user_agent,
				applicationstate: 1,
				accept: "application/json,image/jpeg,image/webp,video/mp4",
				"accept-language": "en-US",
				"accept-encoding": "gzip",
			},
		});

		// Changes auth to bearer if one is stored
		if (this._token) {
			this.instance.defaults.headers[
				"Authorization"
			] = `Bearer ${this._token}`;
		}

		// Make sure that our config file exists and use it
		if (!existsSync(`${homedir()}/.ifunnynode`)) {
			mkdirSync(`${homedir()}/.ifunnynode`);
		}

		/**
		 * Config path where tokens are stored
		 * @type {String}
		 */
		this._config_path = `${homedir()}/.ifunnynode/config.json`;
	}

	/**
	 * Get value from cached response
	 * @param {string} key Key to query
	 * @param {*} [fallback=null] Fallback value if no value is found (default's to null)
	 * @return {Promise<*>} Retrieved data from key or fallback
	 */
	async get(key, fallback = null) {
		let value = this._payload[key];

		// if the key was was cached and we don't care about updated data
		if (value !== undefined && !this._update) {
			this._update = false;
			return value;
		}

		this._update = false;
		this.instance
			.request({
				url: this.url,
				headers: this._token
					? `Bearer ${this._token}`
					: `Basic ${this.basic_token}`,
			})
			.then((response) => {
				this._payload = response.data.data;
				return this._payload[key] || fallback;
			})
			.catch((error) => {
				console.log(`Error getting data from getter ${key}`);
				console.log(error);
			});
	}

	/**
	 * Sets this._update to true for fetching new data
	 * @example
	 * this.foo // cached value
	 * this.fresh.foo // new value
	 * @return {Client} itself with this._update set to true
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
			if (!existsSync(this._config_path)) {
				writeFileSync(this._config_path, "{}");
			}

			this._config = JSON.parse(
				readFileSync(this._config_path).toString()
			);
		}
		return this._config;
	}

	/**
	 * Update this clients config
	 * and write it to the config file
	 * @type {Object}
	 */
	set config(value) {
		if (typeof value !== "object") {
			throw `value should be object, not ${typeof value}`;
		}
		this._config = value;
		writeFileSync(this._config_path, JSON.stringify(value, null, 2));
	}

	/**
	 * iFunny Base API
	 * @type {String}
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
		let auth = this._token ? this._token : this.basic_token;
		let type = this._token ? "Bearer " : "Basic ";
		return {
			"Ifunny-Project-Id": "iFunny",
			"User-Agent": this._user_agent,
			Authorization: type + auth,
			applicationstate: 1,
			accept: "application/json,image/jpeg,image/webp,video/mp4",
			"accept-language": "en-US",
			"accept-encoding": "gzip",
		};
	}

	/**
	 * iFunny basic auth token\
	 * If none is stored in this Client's config, one will be generated\
	 * Basic tokens must be `156` characters long\
	 * iFunny creates basic auth token with UUID and not random bytes
	 * @type {String}
	 */
	get basic_token() {
		if (this.config.basic_token) {
			return this.config.basic_token;
		}

		let uuid = crypto.randomUUID().replace(/\-/g, "");
		let hex = crypto
			.createHash("sha256")
			.update(uuid)
			.digest("hex")
			.toUpperCase();
		let a = hex + "_MsOIJ39Q28:";
		let b = hex + ":MsOIJ39Q28:PTDc3H8a)Vi=UYap";
		let c = crypto.createHash("sha1").update(b).digest("hex");
		let auth = Buffer.from(a + c).toString("base64");

		this._config = Object.assign({ basic_token: auth }, this.config);
		this.config = this._config;

		return auth;
	}

	// ? Captcha needs to be solved to login for the first time
	/**
	 * @async Logs the Client in
	 * @param {String} email Email of the Client to log in with
	 * @param {String} [password] Password to log in with, required if no bearer is stored
	 * @param {Object} [opts={force: false}] Force log in with email and password, creating a new bearer token. NOT RECOMMENDED
	 * @return {Promise<Client>} Itself after the login completes
	 * @throws {@link CaptchaError}
	 */
	async login(email, password, opts = { force: false }) {
		if (!email) {
			throw new Error("email is required to login");
		}

		let config = this.config;

		if (config[`bearer ${email}`] && !opts.force) {
			this._token = config[`bearer ${email}`];

			try {
				this.instance.defaults.headers[
					"Authorization"
				] = `Bearer ${this._token}`;
				let response = await this.instance.request({
					url: "/account",
				});

				this.authorized = true;
				this._payload = response.data.data;
				this._id = this._payload.id;
				this.emit("login", false);
				return this;
			} catch (error) {
				let data = error.response.data;
				if (data.error == "invalid_grant") {
					throw new Error(data.error_description);
				}
				this.instance.defaults.headers[
					"Authorization"
				] = `Basic ${this.basic_token}`;
				this._token = null;
			}
		}

		if (!password) {
			throw new Error("No stored token, password is required");
		}

		let info = {
			grant_type: "password",
			username: email,
			password: password,
		};

		let data = Object.keys(info)
			.map((key) => `${key}=${info[key]}`)
			.join("&");

		let headers = {
			"content-type": "application/x-www-form-urlencoded",
			...this.headers,
		};

		try {
			let response = await this.instance.request({
				method: "POST",
				url: `/oauth2/token`,
				headers: headers,
				data: data,
			});

			if (!response.data.access_token) {
				throw new Error("access_token not given");
				//console.log(response.data);
			}

			this._token = response.data.access_token;
			this._config[`bearer ${email}`] = response.data.access_token;
			this.config = this._config;
		} catch (error) {
			if (error.response.data.error === "captcha_required") {
				throw new CaptchaError(error);
			}
		}
		this.instance.defaults.headers[
			"Authorization"
		] = `Bearer ${this._token}`;

		await sleep(5); // Primes bearer

		try {
			let response = await this.instance.request({
				url: `/account`,
			});

			this._payload = response.data.data;
			this._id = this._payload.id;
			this._user = await this.user_by_id(response.data.data.id);

			this.emit("login", true);
			return this;
		} catch (error) {
			console.log("error after bearer");
			throw error;
		}
	}

	/**
	 * The Client's User object
	 * Just use data in the Client object
	 * @type {Promise<User>}
	 */
	get user() {
		return (async () => {
			if (this._user && !this._update) {
				this._update = false;
				return this._user;
			}
			this._user = new User(await this.id, this);
			this._update = false;
			return this._user;
		})();
	}

	/**
	 * Gets a User by ID
	 * @param {String} id Id of the User to retrieve
	 * @return {Promise<User|null>} The {@link User} object of the client
	 * @throws {@link TypeError}
	 */
	async user_by_id(id) {
		if (typeof id !== "string") {
			throw new TypeError("id must be a string");
		}
		return (await this.user).by_id(id);
	}

	/**
	 * Gets a User object by nickname
	 * @param {String} nick Nickname of the User to retrieve
	 * @return {Promise<User|null>} The {@link User} object of the client
	 * @throws {@link TypeError}
	 */
	async user_by_nick(nick) {
		if (typeof nick !== "string") {
			throw new TypeError("nick must be a string");
		}
		return (await this.user).by_nick(nick);
	}

	/**
	 * The email address attached to the Client
	 * @type {Promise<String|null>}
	 */
	get email() {
		return this.get("email");
	}

	/**
	 * The hometown of the Client
	 * @type {Promise<String>}
	 */
	get hometown() {
		return this.get("hometown", "");
	}

	/**
	 * The location of the Client
	 * @type {Promise<String>}
	 */
	get location() {
		return this.get("location", "");
	}

	/**
	 * The Client's User Id
	 * @type {Promise<String|null>}
	 */
	get id() {
		return this.get("id");
	}

	/**
	 * Nick of the lient
	 * @type {Promise<String|null>}
	 */
	get nick() {
		return this.get("nick");
	}

	/**
	 * Original nick of the Client
	 * @type {Promise<String>}
	 */
	get original_nick() {
		return this.get("original_nick", this.nick);
	}

	/**
	 * Chat privacy of the Client\
	 * `public` allows anyone to open a chat with the User\
	 * `subscribers` only allows subscribers to open a chat with the User\
	 * `closed` doesn't allow anyone to open a chat with the User
	 * @type {Promise<String|null>}
	 */
	get chat_privacy() {
		return this.get("messaging_privacy_status");
	}

	/**
	 * The Client's about (bio)
	 * @type {Promise<String>}
	 */
	get about() {
		return this.get("about", "");
	}

	/**
	 * The Client's bio
	 * Alias for `this.about`
	 * @type {Promise<String>}
	 */
	get bio() {
		return this.about;
	}

	/**
	 * The Client's account link that can be opened in iFunny
	 * @type {Promise<String>}
	 */
	get link() {
		return this.get("web_url", `https://ifunny.co/user/${this.nick}`);
	}

	/**
	 * The Client's profile picture url
	 * @type {Promise<String|null>}
	 */
	get profile_picture() {
		return (async () => {
			let photo = await this.get("photo");
			return photo?.url ?? null;
		})();
	}

	/**
	 * The Client's profile picture background color
	 * @type {Promise<String|null>}
	 */
	get profile_picture_color() {
		return (async () => {
			return (await this.get("photo"))?.bg_color ?? null;
		})();
	}

	/**
	 * The Client's cover image url
	 * @type {Promise<String|null>}
	 */
	get cover_image() {
		return this.get("cover_url");
	}

	/**
	 * The Client's cover image background color (hex code)
	 * @type {Promise<String|null>}
	 */
	get cover_image_color() {
		return this.get("cover_bg_color");
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
	 * @type {Promise<String>}
	 */
	get chat_token() {
		return this.get(
			"messenger_token",
			"1010101010101010101010101010101010101010"
		);
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
	 * Is the Client User's an iFunny team member?
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
		return this.get("is_benned");
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
	 * @type {Promise<Object>}
	 */
	get bans() {
		return this.get("bans", {});
	}

	/**
	 * The Client's Meme Experience
	 * @type {Promise<Object|null>}
	 */
	get meme_experience() {
		return this.get("meme_experience");
	}

	/**
	 * The Client's total days using the app
	 * @type {Promise<Number>}
	 */
	get days() {
		return (async () => {
			return (await this.meme_experience)?.days ?? 0;
		})();
	}

	/**
	 * The Client's Meme Experience rank
	 * @type {Promise<String|null>}
	 */
	get rank() {
		return (async () => {
			return (await this.meme_experience)?.rank ?? null;
		})();
	}

	/**
	 * The Client's Meme Experience image url
	 * @type {Promise<String|null>}
	 */
	get badge_url() {
		return (async () => {
			return (await this.meme_experience)?.badge_url ?? null;
		})();
	}

	/**
	 * The Client's Meme Experience image size
	 * @type {Promise<Object|null>}
	 */
	get badge_size() {
		return (async () => {
			(await this.meme_experience)?.badge_size ?? null;
		})();
	}

	/**
	 * Total amount of days the Client needs for the next rank
	 * @type {Promise<Number|null>}
	 */
	get next_rank_days() {
		return (async () => {
			return (await this.meme_experience)?.next_milestone ?? null;
		})();
	}

	/**
	 * Days untill the Client gets the next rank
	 * @type {Promise<Number|null>}
	 */
	get days_till_next_rank() {
		return (async () => {
			if (!(await this.next_rank_days)) {
				return null;
			}
			return (await this.next_rank_days) - (await this.days);
		})();
	}

	/**
	 * The Client's {@link Stats} object
	 * Don't get this data directly, use the getter for them
	 * @type {Promise<UserStats|null>}
	 */
	get nums() {
		return this.get("num");
	}

	/**
	 * Amount of users the Client is subscribed to
	 * @type {Promise<Number>}
	 */
	get subscription_count() {
		return (async () => {
			return (await this.nums)?.subscriptions ?? 0;
		})();
	}

	/**
	 * Amount of subcribers the Client has
	 * @type {Promise<Number>}
	 */
	get subscriber_count() {
		return (async () => {
			return (await this.nums)?.subcribers ?? 0;
		})();
	}

	/**
	 * Amount of total posts on the Client's account
	 * @type {Promise<Number>}
	 */
	get post_count() {
		return (async () => {
			return (await this.nums)?.total_posts ?? 0;
		})();
	}

	/**
	 * Amount of posts that the Client uploaded (non-repubs)\
	 * Alias for {@link original_post_count Client.original_post_count}
	 * @type {Promise<Number>}
	 */
	get created_count() {
		return (async () => {
			return (await this.nums)?.created ?? 0;
		})();
	}

	/**
	 * Amount of posts that the Client uploaded (non-repubs)
	 * Alias for {@link created_count Client.created_count}
	 * @type {Promise<Number>}
	 */
	get original_post_count() {
		return this.created_count;
	}

	/**
	 * Amount of posts on the clients counts that are republishes
	 * Not original
	 * @type {Promise<Number>}
	 */
	get republication_count() {
		return (async () => {
			return (await this.post_count) - (await this.created_count);
		})();
	}

	/**
	 * Amount of features the Client has
	 * @type {Promise<Number>}
	 */
	get feature_count() {
		return (async () => {
			return (await this.nums)?.featured ?? 0;
		})();
	}

	/**
	 * Amount of smiles the Client has (only counts for posts)
	 * @type {Promise<Number>}
	 */
	get smile_count() {
		return (async () => {
			return (await this.nums)?.total_smiles ?? 0;
		})();
	}

	/**
	 * Amount of achievements the Client has
	 * @type {Promise<Number>}
	 */
	get achievement_count() {
		return (async () => {
			return (await this.nums)?.achievements ?? 0;
		})();
	}

	/**
	 * Rating of the User (No longer used by iFunny)
	 * I'm not adding the getters for this since it's been redacted
	 * @type {Promise<Object|null>}
	 */
	get rating() {
		return this.get("rating");
	}
}
