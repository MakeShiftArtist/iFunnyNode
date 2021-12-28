/**
 * @typedef {Object} UserStats
 * @property {Number=} subscriptions Amount of subscriptions the user has
 * @property {Number=} subcribers Amount of subcribers the user has
 * @property {Number=} total_posts Amount of total posts the user has
 * @property {Number=} created Amount of created posts the user has
 * @property {Number=} featured Amount of features the user has
 * @property {Number=} total_smiles Amount of total smiles the user has
 * @property {Number=} achievements Amount of achievements the user has
 */

/**
 * @typedef {Object} PostStats
 * @property {Number=} smiles Amount of smiles the post has
 * @property {Number=} unsmiles Amount of unsmiles the post has
 * @property {Number=} guest_smiles Amount of guest smiles the post has
 * @property {Number=} comments Amount of comments the post has
 * @property {Number=} views Amount of views the post has
 * @property {Number=} republished Amount of republishes the user has
 * @property {Number=} shares Amount of shares the post has
 */

/**
 * @typedef {Object} ClientOpts
 * @property {string=} user_agent User agent to make requests with
 * @property {string=} prefix Prefix for the bot commands
 * @property {string=} token Bearer token for the bot to use if you have one stored
 */

/**
 * @typedef {Object} FreshOpts
 * @property {Object} [data={}] The data received from the server
 * @property {String} [url='/account'] The url to make requests to
 */

/**
 * @typedef {Object} Size
 * @property {Number} w Width
 * @property {Number} h Height
 */
