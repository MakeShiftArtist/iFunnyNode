/**
 * Default API error for unknown errors
 * @extends Error
 */
export class ApiError extends Error {
	/**
	 * @constructor
	 * @param {Error} error Error thrown by axios
	 * @param {String} message Message of the error
	 */
	constructor(error, message = null) {
		super();
		/**
		 * Request that led to the error
		 * @type {Object}
		 */
		this.request = error.config;

		/**
		 * Response from the server
		 * @type {Object}
		 */
		this.response = error.response;

		/**
		 * Error data for handling the error
		 * @type {Object}
		 */
		this.data = error.response.data;

		/**
		 * Status code from the server response
		 * @type {Number}
		 */
		this.status_code = this.data.status;

		/**
		 * Message of the api error
		 * @type {String}
		 */
		this.message = message;

		/**
		 * Descript of the error given
		 * @type {String}
		 */
		this.description = this.data.error_description;
	}
}

/**
 * Captcha error thrown when attempting to create new bearer tokens\
 * To bypass the captcha, simply open the captcha url in the browser and login again with the same request
 * @extends ApiError
 */
export class CaptchaError extends ApiError {
	/**
	 * @param {Error} error
	 */
	constructor(error) {
		super(error, "captcha_required");
		/**
		 * Captcha url that needs to be solved by the user
		 * @type {String}
		 */
		this.captcha_url = this.data.data.captcha_url;
	}
}

/**
 * Auth error when the client creates too many bearers using the same basic too quickly
 * Construct a new basic token to bypass
 * @extends ApiError
 */
export class AuthError extends ApiError {
	/**
	 * @param {Error} error Error throw by Axios
	 */
	constructor(error) {
		super(error, "too_many_user_auths");
	}
}

export default {
	ApiError,
	CaptchaError,
	AuthError,
};
