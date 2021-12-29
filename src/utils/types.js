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

/**
 * @typedef {Object} Thumbnail Watermark cropped at different sizes
 * @property {String} small_url Jpeg format, Square, Size 65x, Quality: 90x75
 * @property {String} url Jpeg format, Square, Size 160x, Quality: 90x75
 * @property {String} large_url Jpeg format, Square, Size 320x, Quality: 90x75
 * @property {String} x640_url Jpeg format, Size 640x Quality: 95x75
 * @property {String} webp_url Webp format, Square, Size 160x, Quality: 90
 * @property {String} large_webp_url Webp format, Square, Size 320x, Quality: 90
 * @property {String} proportional_url Jpeg format, Size 320x, Crop x800, Quality: 90x75
 * @property {String} proportional_webp_url Webp format, Size 320x, Crop, Quality: 90
 * @property {Size} proportional_size Proportional Size of the thumbnail
 */

/**
 * @typedef {Object} VideoClip
 * @property {String} screen_url Jpeg format
 * @property {Number} bytes Amount of bytes the video is
 * @property {String} source_type The source type of the content
 * @property {Number} duration How long the video is in seconds
 */
