// @ts-check
import FreshObject from "./FreshObject.js";
import axios from "axios";
import Client from "./Client.js";

export default class User extends FreshObject {
	/**
	 * User Object
	 * @param {string} id id of the user
	 * @param {Client} client client used to get the user
	 * @param {object} [opts={}] optional data
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
		this.url = `${this.api}/users/${id}`;
	}

	/**
	 * Get a user by their id
	 * @param {String} id Nick of the user to get
	 * @return {Promise<User|null>} The user found for this nick, or null if no such user
	 */
	async by_id(id) {
		if (typeof id !== "string") {
			throw new TypeError("id must be a string");
		}

		try {
			let headers = await this.headers;
			let response = await axios({
				method: "GET",
				url: this.api + "/users/" + id,
				headers: await this.headers,
			});

			return new User(response.data.data.id, this.client, {
				data: response.data.data,
			});
		} catch (err) {
			if (
				(err.response && err.response.data.error === "not_found") ||
				err.response.data.error === "user_is_unavailable" ||
				err.response.data.error_description === "Invalid user id"
			) {
				return null;
			}

			throw err;
		}
	}

	/**
	 * Get a user by their nickname
	 * @param {String} nick Nick of the user to get
	 * @return {Promise<User|null>} The user found for this nick, or null if no such user
	 */
	async by_nick(nick) {
		if (typeof nick !== "string") {
			throw new TypeError("nick must be a string");
		}
		try {
			let response = await axios({
				method: "GET",
				url: `${this.client.api}/users/by_nick/${nick}`,
				headers: await this.headers,
			});

			return new User(response.data.data.id, this.client, {
				data: response.data.data,
			});
		} catch (err) {
			if (
				(err.response && err.response.data.error === "not_found") ||
				err.response.data.error === "user_is_unavailable"
			) {
				return null;
			}
			throw err;
		}
	}

	/**
	 * Nick of the user
	 * @type {Promise<String>}
	 */
	get nick() {
		return this.get("nick");
	}

	/**
	 * Id of the user
	 * @type {Promise<String>}
	 */
	get id() {
		return (async () => {
			let id = await this.get("id");
			if (id !== this.id_sync) this.id_sync = id;
			return this.id_sync;
		})();
	}

	/**
	 * Is the client subscribed to user notificationss
	 * @type {Promise<Boolean>}
	 */
	get subscribed_to_updates() {
		return this.get("is_subscribed_to_updates");
	}

	/**
	 * Get the cover image of this user
	 * @type {Promise<Object>}
	 */
	get cover_image() {
		return (async () => {
			return {
				url: await this.get("cover_url"),
				backgroud: await this.get("cover_bg_color"),
			};
		})();
	}

	/**
	 * The user's profile photo
	 * @type {Promise<object>}
	 */
	get profile_photo() {
		return (async () => {
			let photo = await this.get("photo");
			return {
				url: photo.url,
				backgroud: photo.bg_color,
			};
		})();
	}

	/**
	 * Number of subscribers to this user
	 * @type {Promise<Number>}
	 */
	get subscriber_count() {
		return (async () => {
			return await this.get("num").then((num) => num.subscribers);
		})();
	}

	/**
	 * Number of users this user is subscribed to
	 * @type {Promise<Number>}
	 */
	get subscription_count() {
		return (async () => {
			return await this.get("num").then((num) => num.subscriptions);
		})();
	}

	/**
	 * Number of posts in this user's timeline
	 * @type {Promise<Number>}
	 */
	get post_count() {
		return (async () => {
			return await this.get("num").then((num) => num.total_posts);
		})();
	}

	/**
	 * Number of posts that are original in this user's timeline
	 * @type {Promise<Number>}
	 */
	get original_post_count() {
		return (async () => {
			return await this.get("num").then((num) => num.created);
		})();
	}

	/**
	 * Number of posts that are republications in this user's timeline
	 * @type {Promise<Number>}
	 */
	get republication_count() {
		return (async () => {
			return (await this.post_count) - (await this.original_post_count);
		})();
	}

	/**
	 * Number of featured posts in this user's timeline
	 * @type {Promise<Number>}
	 */
	get feature_count() {
		return (async () => {
			return (await this.get("num"))?.featured ?? 0;
		})();
	}

	/**
	 * Total number of smiles accross all comments and posts by this user
	 * @type {Promise<Number>}
	 */
	get smile_count() {
		return (async () => {
			return (await this.get("num")).then((num) => num.total_smiles);
		})();
	}

	/**
	 * Number of achievements obtained by this user
	 * @type {Promise<Number>}
	 */
	get achievement_count() {
		return (async () => {
			return await this.get("num").then((num) => num.achievements);
		})();
	}

	/**
	 * All bans the user has, including shadow bans
	 * @type {Promise<Array>}
	 */
	get bans() {
		return this.get("bans", []);
	}

	/**
	 * User's meme experience calculated by age of the account
	 * @type {Promise<Object>}
	 */
	get meme_experience() {
		return this.get("meme_experience");
	}

	/**
	 * The user's iFunny rank
	 * @type {Promise<string>}
	 */
	get rank() {
		return (async () => {
			return await this.get("meme_experience").then((xp) => xp.rank);
		})();
	}

	/**
	 * The user's iFunny days
	 * @type {Promise<Number>}
	 */
	get days() {
		return (async () => {
			return await this.get("meme_experience").then((xp) => xp.days);
		})();
	}

	/**
	 * The user's iFunny next rank day requirement
	 * @type {Promise<Number|null>}
	 */
	get next_days() {
		return (async () => {
			return (await this.get("meme_experience"))?.next_milestone || null;
		})();
	}

	/**
	 * The user's iFunny badge
	 * @type {Promise<Object>}
	 */
	get rank_badge() {
		return (async () => {
			let xp = await this.meme_experience;
			return {
				url: xp.badge_url,
				size: xp.badge_size,
			};
		})();
	}

	/**
	 * Is the user available for chat
	 * @type {Promise<Boolean>}
	 */
	get can_chat() {
		return this.get("is_available_for_chat");
	}

	/**
	 * Is the user account private
	 * @type {Promise<Boolean>}
	 */
	get is_private() {
		return this.get("is_private");
	}

	/**
	 * The user's iFunny account link, which can be opened in iFunny\
	 * Alias for {@link web_url User.web_url}
	 * @type {Promise<String>}
	 */
	get link() {
		return this.get("web_url");
	}

	/**
	 * The user's iFunny account link, which can be opened in iFunny\
	 * @type {Promise<String>}
	 */
	get web_url() {
		return this.link;
	}

	/**
	 * Did the client block the user
	 * @type {Promise<Boolean>}
	 */
	get is_blocked() {
		return this.get("is_blocked");
	}

	/**
	 * Did the user block the client
	 * @type {Promise<Boolean>}
	 */
	get blocked_me() {
		return this.get("are_you_blocked");
	}

	/**
	 * The user's about (bio)
	 * @type {Promise<string>}
	 */
	get about() {
		return this.get("about", "");
	}

	/**
	 * Alias for this.about
	 * @type {Promise<string>}
	 */
	get bio() {
		return this.get("about", "");
	}

	/**
	 * Is the user verified
	 * @type {Promise<Boolean>}
	 */
	get is_verified() {
		return this.get("is_verified");
	}

	/**
	 * Is the user banned
	 * @type {Promise<Boolean>}
	 */
	get is_banned() {
		return this.get("is_banned");
	}

	/**
	 * Was the user's account deleted
	 * @type {Promise<Boolean>}
	 */
	get is_deleted() {
		return this.get("is_deleted");
	}

	/**
	 * Is the user subscribed to the client
	 * @type {Promise<Boolean>}
	 */
	get is_subscriber() {
		return this.get("is_in_subscribers");
	}

	/**
	 * Is the client subscribed to the user
	 * @type {Promise<Boolean>}
	 */
	get is_subscription() {
		return this.get("is_in_subscriptions");
	}

	/**
	 * The user's nickname when the account was made
	 * @type {Promise<String>}
	 */
	get original_nick() {
		return this.get("original_nick", this.get("nick"));
	}

	/**
	 * The user's nickname color
	 * @type {Promise<string>}
	 */
	get nick_color() {
		return this.get("nick_color", "A3A3A5");
		// I believe that's the default username color, although we could use white instead
	}

	/**
	 * Subscribes to the user
	 * @return {Promise<Object>} - Status of the response
	 */
	async subscribe() {
		let response = await axios({
			method: "PUT",
			url: this.url + "/subscribers",
			headers: await this.headers,
		});
		return response.data;
	}

	/**
	 * Unsubscribes to the user
	 *
	 * @return {Promise<Object>} Status of the response
	 */
	async unsubscribe() {
		let response = await axios({
			method: "DELETE",
			url: this.url + "/subscribers",
			headers: await this.headers,
		});
		return response.data;
	}
}
