import Client from "./objects/Client.js";
import User from "./objects/User.js";
import Post from "./objects/Post.js";
import ImagePost from "./objects/Image.js";
import VideoPost from "./objects/Video.js";
import ImagePost from "./objects/Image.js";
import Ban from "./objects/small/Ban.js";
import FreshObject from "./objects/FreshObject.js";

import Channel from "./objects/ChatObjects/Channel.js";
import ChatFile from './objects/ChatObjects/ChatFile.js';
import ChatPaginator from "./objects/ChatObjects/ChatPaginator.js";
import ChatUser from "./objects/ChatObjects/ChatUser.js";
import Context from "./objects/ChatObjects/Context.js";
import Message from "./objects/ChatObjects/Message.js";
import Socket from "./objects/ChatObjects/SocketInstance.js";

const ChatObjects = {
	Channel,
	ChatFile,
	ChatPaginator,
	ChatUser,
	Context,
	Message,
	Socket
}

export default Client;

export {Client as default, Client, User, Post, ImagePost, VideoPost, FreshObject, Ban, ChatObjects };