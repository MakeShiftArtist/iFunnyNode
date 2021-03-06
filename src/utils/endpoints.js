/**
 * Used for reference until I come up with a better way to use these
 */
export default {
	base: "https://api.ifunny.mobi/v4",
	chatBase: "chat.ifunny.co",
	chat: "/chat",
	account: "/account",
	revoke: "/oauth2/revoke",
	users: "/users/{user_id}",
	posts: "/content/{post_id}",
	comments: "/content/{post_id}/comments/{comment_id}",
	channels: "/channels",
	myActivity: "/news/my",
	myBlockedUsers: "/users/my/blocked",
	myComments: "/users/my/comments",
	userSubscribers: "/users/{user_id}/subscribers",
	userSubscriptions: "/users/{user_id}/subscriptions",
	userPosts: "/timelines/users/{user_id}",
	userFeatures: "/timelines/users/{user_id}/featured",
	userGuests: "/users/{user_id}/guests",
	channelPosts: "/channels/{channel_id}/items",
	searchPosts: "/search/content",
	postComments: "/content/{post_id}/comments",
	postSmilesUsers: "/content/{post_id}/smiles",
	postRepubsUsers: "/content/{post_id}/republished",
	commentReplies: "/content/{post_id}/comments/{comment_id}/replies",
	reads: "/reads/{post_id}",
	featuredFeed: "/feeds/featured",
	collectiveFeed: "/feeds/collective",
	subscriptionsFeed: "/timelines/home",
	popularFeed: "/feeds/popular",
	digestPosts: "/digests/weekly-iFunny-{}{:02d}{:02d}", // year, month, day
	upload: "/content",
	blockUser: "/users/my/blocked/{user_id}",
	reportUser: "/users/{user_id}/abuses",
	reportPost: "/content/{post_id}/abuses",
	reportComment: "/content/{post_id}/comments/{comment_id}/abuses",
	pinPost: "/content/{post_id}/pinned",
	republishPost: "/content/{post_id}/republished",
	smilePost: "/content/{post_id}/smiles",
	unsmilePost: "/content/{post_id}/unsmiles",
	smileComment: "/content/{post_id}/comments/{comment_id}/smiles",
	unsmileComment: "/content/{post_id}/comments/{comment_id}/unsmiles",
	userByNick: "/users/by_nick/{nick}",
	isNickAvailable: "/users/nicks_available",
	isEmailAvailable: "/users/emails_available",
};
