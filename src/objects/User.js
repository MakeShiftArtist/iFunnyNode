// @ts-check
"use strict";

import FreshObject from "./FreshObject.js";
import Client from "./Client.js";
import Ban from "./small/Ban.js";

/**
 * @typedef {Object} UserStats
 * @property {Number} subscriptions Amount of subscriptions the user has
 * @property {Number} subscribers Amount of subcribers the user has
 * @property {Number} total_posts Amount of total posts the user has
 * @property {Number} created Amount of created posts the user has
 * @property {Number} featured Amount of features the user has
 * @property {Number} total_smiles Amount of total smiles the user has
 * @property {Number} achievements Amount of achievements the user has
 */

/**
 * @typedef {Object} ProfilePicture
 * @property {String} bg_color Background color of the profile picture
 * @property {Object} thumb Thumbnail urls of the profile picture
 * @property {String} thumb.small_url small url of the thumbnail 100x
 * @property {String} thumb.medium_url medium url of the thumbnail 200x
 * @property {String} thumb.large_url large url of the thumbnail 400x
 * @property {String} url URL of the profile picture
 */

/**
 * @typedef {Object} CoverImage
 * @property {String} url URL of the cover image
 * @property {String} bg_color Background color of the cover image
 */

/**
 * @typedef {Object} MemeExperience
 * @property {Number} days Amount of days the user has
 * @property {String} rank The rank of the user
 * @property {Badge} badge The badge the user's rank
 * @property {Number} next_milestone Amount of days the user needs to get the next rank
 */

/**
 * @typedef {Object} Badge
 * @property {String} url URL of the badge
 * @property {Object} size Size of the badge
 * @property {Number} size.w Width of the badge
 * @property {Number} size.h Height of the badge
 */

/**
 * @typedef {Object} FreshOpts
 * @property {Object} [data={}] The data received from the server
 * @property {String} [url] The url to make requests to
 */

export default class User extends FreshObject {
	/**
	 * User Object
	 * @param {string} id Id of the user
	 * @param {Client} client Client the user is attached to
	 * @param {FreshOpts} [opts={}] Optional data
	 */
	constructor(id, client, opts = {}) {
		super(id, client, opts);
		this.request_url = opts.url || `${this.api}/users/${id}`;
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

		if (id === this.id_sync) {
			if (this._update) {
				return new User(this.id_sync, this.client, {
					url: this.request_url,
				});
			} else return this;
		}

		try {
			let { data } = await this.instance.request({
				method: "GET",
				url: `/users/${id}`,
			});

			return new User(data.data.id, this.client, {
				data: data.data,
			});
		} catch (err) {
			let error = err?.response?.data;
			if (
				["not_found", "user_is_unavailable"].includes(error.error) ||
				error.error_description === "Invalid user id"
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

		if (nick.toLowerCase() === (await this.nick).toLowerCase()) {
			return new User(this.id_sync, this.client, {
				url: this.request_url,
			});
		}
		try {
			let response = await this.instance.request({
				method: "GET",
				url: `/users/by_nick/${nick}`,
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
	 * Is the user the same as the client user?
	 * @type {Boolean}
	 */
	get is_me() {
		return this.id_sync === this.client.id_sync;
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
			let new_id = await this.get("id");
			if (this.id_sync !== new_id) {
				this.id_sync = new_id;
			}
			return this.id_sync;
		})();
	}

	/**
	 * Is the client subscribed to user notifications?
	 * @type {Promise<Boolean>}
	 */
	get subscribed_to_updates() {
		return this.get("is_subscribed_to_updates");
	}

	/**
	 * Get the cover image of this user
	 * @type {Promise<CoverImage>}
	 */
	get cover_image() {
		return (async () => {
			return {
				url: await this.get("cover_url"),
				bg_color: await this.get("cover_bg_color", "FFFFFF"),
			};
		})();
	}

	/**
	 * The user's profile photo
	 * @type {Promise<ProfilePicture>}
	 */
	get profile_photo() {
		return this.get("photo");
	}

	/**
	 * The user's account stats
	 * @type {Promise<UserStats>}
	 */
	get stats() {
		return this.get("num");
	}

	/**
	 * Number of subscribers to this user
	 * @type {Promise<Number>}
	 */
	get subscriber_count() {
		return (async () => {
			return (await this.stats)?.subscribers ?? 0;
		})();
	}

	/**
	 * Number of users this user is subscribed to
	 * @type {Promise<Number>}
	 */
	get subscription_count() {
		return (async () => {
			return (await this.stats)?.subscriptions;
		})();
	}

	/**
	 * Number of posts in this user's timeline
	 * @type {Promise<Number>}
	 */
	get post_count() {
		return (async () => {
			return (await this.stats)?.total_posts;
		})();
	}

	/**
	 * Number of posts that are original in this user's timeline
	 * @type {Promise<Number>}
	 */
	get original_post_count() {
		return (async () => {
			return (await this.stats)?.created;
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
			return (await this.stats)?.featured ?? 0;
		})();
	}

	/**
	 * Total number of smiles accross all comments and posts by this user
	 * @type {Promise<Number>}
	 */
	get smile_count() {
		return (async () => {
			return (await this.stats)?.total_smiles;
		})();
	}

	/**
	 * Number of achievements obtained by this user
	 * @type {Promise<Number>}
	 */
	get achievement_count() {
		return (async () => {
			return (await this.stats)?.achievements;
		})();
	}

	/**
	 * All bans the user has, including shadow bans
	 * @type {Promise<Ban[]>}
	 */
	get bans() {
		return (async () => {
			/** @type {Object[]} */
			let bans = await this.get("bans", []);
			return bans.map((data) => new Ban(data.id, this.client, { data }));
		})();
	}

	/**
	 * User's meme experience calculated by age of the account
	 * @type {Promise<MemeExperience>}
	 */
	get meme_experience() {
		return (async () => {
			let xp = await this.get("meme_experience", {});
			return {
				days: xp?.days ?? 0,
				next_milestone: xp?.next_milestone ?? null,
				rank: xp?.rank ?? "Meme Explorer",
				badge: {
					url: xp?.badge_url ?? "https://img.ifunny.co/meme_experience/0.png",
					size: xp?.badge_size ?? {
						w: 0,
						h: 0,
					},
				},
			};
		})();
	}

	/**
	 * The user's iFunny rank
	 * @type {Promise<String>}
	 */
	get rank() {
		return (async () => {
			return (await this.meme_experience).rank;
		})();
	}

	/**
	 * The user's iFunny days
	 * @type {Promise<Number>}
	 */
	get days() {
		return (async () => {
			return (await this.meme_experience).days;
		})();
	}

	/**
	 * How many days the user needs to get the next rank
	 * @type {Promise<Number|null>}
	 */
	get next_milestone() {
		return (async () => {
			return (await this.meme_experience).next_milestone;
		})();
	}

	/**
	 * The user's iFunny badge
	 * @type {Promise<Badge>}
	 */
	get badge() {
		return (async () => {
			return (await this.meme_experience).badge;
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
		return this.web_url;
	}

	/**
	 * The user's iFunny account link, which can be opened in iFunny\
	 * Alias for {@link web_url User.link}
	 * @type {Promise<String>}
	 */
	get web_url() {
		return (async () => {
			return await this.get("web_url", `https://ifunny.co/user/${await this.nick}`);
		})();
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
	 * @type {Promise<String>}
	 */
	get about() {
		return this.get("about", "");
	}

	/**
	 * Alias for this.about
	 * @type {Promise<String>}
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
		return this.get("original_nick", this.nick);
	}

	/**
	 * The user's nickname color
	 * @type {Promise<String>}
	 */
	get nick_color() {
		return this.get("nick_color", "FFFFFF");
	}

	/**
	 * Subscribes to the user
	 * @return {Promise<User>} This instance
	 */
	async subscribe() {
		await this.instance.request({
			method: "PUT",
			url: "/subscribers",
		});

		return this.fresh;
	}

	/**
	 * Unsubscribes to the user
	 * @return {Promise<User>} This instance
	 */
	async unsubscribe() {
		await this.instance.request({
			method: "DELETE",
			url: "/subscribers",
		});
		return this.fresh;
	}
}
