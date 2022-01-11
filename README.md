# iFunnyNode

This is an iFunny API Wrapper written in ES6 Node JS.\
This is in the early stages so most of the API hasn't been implemented yet.\
Chats have been implemented! I couldn't have done it without the amazing help from my good friend [Tobi/Pain](https://github.com/baiinss)
**VERY EARLY STAGES**

-   I'm writing this wrapper from scratch, taking inspiration from
    [discord.py](https://github.com/Rapptz/discord.py),
    [discord.js](https://github.com/discordjs/discord.js),
    [ifunnyapi](https://github.com/EamonTracey/ifunnyapi),
    and [iFunny.js](https://github.com/gastrodon/iFunny.js)

## Using the module

The module was written in ES6, so you'll need to specify the type as `module` in `package.json` or change the extensions to `.mjs` instead of `.js`
To use the Client, you'll simply use `npm install ifunnynode` in your terminal, and import the client like so:

```js
// import your client
import Client from "ifunnynode";

// initalize client with bearer token
const client = new Client({ token: "bearer_token" });

// Logging in doesn't need any args because we already have the token
client.login();

// Almost every getter is async so you have to await them
client.on("login", (new_bearer) => {
	client.chats.connect();
});

// THANK YOU @TOBI for all the help setting up chats. Couldn't have done it without you.
client.chats.on("message", async (ctx) => {
	if (ctx.message.author.id_sync === client.id_sync) {
		return;
	}
	console.log(`${await ctx.message.author.nick}:`, ctx.message.content); // Logs author and message content
});
```

## Logging in

Logging in isn't as simple as it used to be due to iFunny updating their API\
iFunny will sometimes return a captcha error, so you'll need to solve them

1. Create a try block with your login method being called there
2. Add a catch block and check for `err.captcha_url`
    1. Open the captcha url in a browser and solve it
    2. Attempt to login in again with the same credentials
3. You're done!

### Example

```js
// imports the client and the User and Post Object.
import Client, { User, Post } from "ifunnynode";

// Get your credentials
const IFUNNY_EMAIL = process.env.IFUNNY_NODE_EMAIL;
const IFUNNY_PASSWORD = process.env.IFUNNY_NODE_PASSWORD;

const client = new Client();

client.on("login", async (new_bearer) => {
	// Get a user by nickname
	console.log(client.bearer); // bearer token attatched to client

(async () => {
	try {
		// emits 'login' with `true` if it's a new bearer
		// or `false` if it had one in the config file
		await client.login({
			email: IFUNNY_EMAIL,
			password: IFUNNY_PASSWORD,
		});
	} catch (err) {
		// check if error was CaptchaError
		if (err.captcha_url) {
			console.log(captcha_url);
		} else {
			// NOT a CaptchaError
			throw err;
		}
	}
})();
```
