# 1.0.0 Initial commit

-   Added `FreshObject` class
-   Added `Client` class

## 1.1.0

-   Added `Client.login` method

## 1.2.0

-   Fixed `Client.login` method
-   Added `CaptchaError` Error class

## 1.3.0

-   Added `Post` class
-   Added `ImagePost` class
-   Added `VideoPost` class
-   Added `Ban` class

### 1.3.1

-   Fixed Documentation
-   BREAKING: Changed `Client.login` to one take one argument `opts` with `opts.email`, `opts.password`, and `opts.force`.\
    If you initalized the Client with `js new Client({token: 'bearer'})` you can now just login with `Client.login()`

### 1.3.2

-   Fixed `npm test`
-   Fixed `Client.login`
-   Added `create_basic_token` test
-   Fixed Documentation for README.md
-   Added `AuthError` class

### 1.3.3

-   Refactored User and Client classes
-   Timestamps return dates instead of the time in UNIX
-   `User.subscribe` and `User.unsubscribe` now return the same instance of the User
-   Fixed config getting reset or broken when runnning tests

### 1.3.4

-   `create_basic_token` now uses UUIDv4 instead of random bytes
-   Fixed `Client.fresh.basic_token` not updating the config
-   Added `User.me` getter
-   Added `is freshable` to `test_basic_token.js`

# 2.0.0

**Co-authored-by: pain (AKA Tobi) <baiinss@users.noreply.github.com>**\
**<u>MAJOR UPDATE! Added Chat functionality!</u>**

-   Added `ChatObjects` folder
-   Added `Chats.js` Chat Client for websockets
-   Added `Channel.js` An ifunny Chat
-   Added `ChatFile.js` A file sent in chats
-   Added `ChatPaginator.js` for paginating chat websocket data
-   Added `ChatUser.js` A user from chats with extra information
-   Added `Context.js` Context of a websocket event
-   Added `Message.js` A message sent in chats
-   Added `MessageQueue.js` send message handler
-   Added `SocketInstance.js` Modified wampy client to work with iFunny
-   Added `calls.js` Webosocket calls that the chat Client needs
-   Added `chatBase` and `chat` to `endpoints.js`
-   Added `Client.chats` property

### 2.0.1

-   Fixed `sleep` test failing if it resolves slightly too quickly
-   `ClientOpts.token` checks arg type
-   Updated Client.user_agent to `7.18.1`
-   `Ban.request_url` now uses `id_sync` instead of the Promise `id`
-   **BREAKING!** `User.me` changed to `User.is_me` to be more clear
-   Change: `User.nick_color` default to white instead of gray
-   **BREAKING!** `ChatFile.thumbnail` replaces all 3 thumbnail getters
-   Refactored `ChatFile.js`
-   Updated documentation for `Post.status`
-   Refactored how `Client.basic_token` generates tokens
-   **BREAKING!** `Client._user_agent` now `Client.user_agent` since it doesn't need to be private.
-   `Client.user_agent` is updated to latest iFunny Version
-   Updated Documentation and notes for `MessageQueue.js`
-   Update: Added `ChatUser.online`, `async ChatUser.fetch()` and `ChatUser.in_chat` methods
-   Updated `ChatUser.last_seen_at` to work consistently.

## 2.1.0

-   Added `Channel.me` which returns the Client's ChatUser object for that channel
-   Fixed: `Channel.listen()` and `Channel.stop_listening()` now work properly
-   Temporary Fix: `Channel.send()` now works, but isn't using the built in message handler
-   Improved documentation for `Channel.js`
-   Change: `Channel` methods now return `Channel.fresh` instead of their websocket call

### 2.1.1

-   Updated `ApiError` class to show correct error message
-   Added `response timeout` interceptor on `Client`
-   Changed `Client._payload = new_payload` to `Object.assign(Client._payload, new_payload)` to preserve non new data
-   Updated imports and documentation for `Ban.js`, `FreshObject.js`, `Image.js`, `index.js`, `User.js`, `Video.js`
-   Fixed Channel Listeners comparing `Channel.name` to `Channel.name_sync`
-   `Chats.socket` callback is now async.
-   Added proper documentation for `Client.on`

### 2.1.2

-   `FreshObject.get()` now updates the payload with `Object.assign()`
-   `FreshObject.get` uses nullish coalescing instead of `||` operator for the fallback

## 2.2.0

-   Added `paginator` to `methods.js` for paginating data
-   Added `Client.guests()` generator
-   Added `Guest` object for `Client.guests()`
-   Added `Client.timeline()` generator
-   Added `User.timeline()` generator
-   Added `Client.get_post()` function
-   Added `smile()`, `unsmile()`, `remove_smile()`, `remove_unsmile()`, `republish()`, `unrepublish()`, `pin()`, and `unpin()` functions to `Post.js`
-   Renamed `Image.js` and `Video.js` to `ImagePost.js` and `VideoPost.js` respectively
-   Moved `ImagePost.js` and `VideoPost.js` to `src/objects/small` since they're smaller objects
-   Added `CaptionPost` class

## 2.3.0

-   Added `get_post_type()` function
-   Added `post_body_paginator` generator function for collective
-   Consolidated `CaptionPost` with `ImagePost`
-   Added `Comment.js`
-   Added `Client.features` and `Client.collective` generators

### 2.3.1

-   Fixed `get_post_type` not using the Client

## 2.4.0

-   **BREAKING!** Removed bearer and basic storing so that the library works without the 'os' module

## 2.5.0

-   Added `comics` case to `get_post_type`
-   Added `comments()` generator to `Post`
-   Added `Comment.js` and `Reply.js`
-   Added `comments()` generator to `Client`
-   Added `get_comment` function to `Client`
-   Added `Chats.on` documentation

### 2.5.1

-   Changed `Client.get_post()` to accept post data or post id
-   Removed `get_post_type` function from `methods.js`, use `Client.get_post()` instead
-   Improved Documentation for `ImagePost.js`
-   Fixed getters for `VideoPost` so that they work with Gifs and vines
-   Fixed timestamp for `Guest.visited_at`
-   Fixed timestamps for `Ban.date_until` and `Ban.time_left`
-   Fixed the ID not automatically being added to the payload in `FreshObject.js`
-   Improved Documentation for `Post.js` and added `is_mine` getter and `fetch()` method
-   `User.timeline()` yields a post from `Client.get_post()` instead of the deprecated method
-   `Comment.post` and `Comment.attachment` use `Client.get_post()` instead of the deprecated method

## 2.6.0

-   Fixed `Client.instance.interceptors` not throwing errors
-   `Client.get_post()` returns `null` if the request returned 'not_found'
-   Added support for `FormData` in `Client.instance` requests
-   Added `Client.request_password_reset()` function
-   `Client._update_payload()` uses optional chaining to improve error handling
-   Moved `ImagePost.caption` to `Post.js` since gif's can have captions too
-   Fixed `Post.comments()` not using the `comments` path
-   Added documentation for `Post.comments()`
-   Added `Post.smiles()` generator and `Post.repubs()` generator
-   Added `from` parameter documentation for `Post` and `User` methods
-   Updated README.md

### 2.6.1

-   Added `meme_xp()` to `methods.js`
-   Added `types.ts` for Type Declaration
-   Cleaned documentation for `User`, `Post`, `VideoPost`, and `Client`
-   Added getters that were missing from client. IDK why I removed them.

### 2.6.2

-   Updated `Client.user_agent`
-   Improve speed of `Client.get_comment`
-   Fixed `Comment.mentions` using the wrong ID for the User object
-   Fixed `Comment.reply_count` returning the smile_count
-   Fixed `Comment.author` not passing the author into the payload on construct
-   Added `Comment.replies()` generator
-   Removed `CaptionPost` from `src/index.js`

### 2.6.3

-   Fixed `Client.chats` initializing in the constructor, raising an error if a bearer is not passed
-   Fixed chats initalizing socket with `Client.id` instead of `Client.id_sync`

### 2.6.4

-   Changed package.json['main'] to `src/index`

### 2.6.5

-   Changed how `Client.user` works due to it making requests to the '/account' endpoint instead of the user endpoint
-   `create_basic_token` now takes in `client_id` and `client_secret` params instead of hard coded credentials
-   `Client.basic_token` getter now uses `create_basic_token` function
