# iFunnyNode 3.0.6

This is an iFunny API Wrapper written in ES6 Node JS.\
This project is nearly complete, with only a few features not implemented.\
**Chats have been implemented!**\
I couldn't have done it without the amazing help from my good friend [Tobi/Pain](https://github.com/baiinss) so big thanks to him for everything having to do with Chats.\

-   This wrapper was written from scratch, taking inspiration from
    [discord.py](https://github.com/Rapptz/discord.py),
    [discord.js](https://github.com/discordjs/discord.js),
    [ifunnyapi](https://github.com/EamonTracey/ifunnyapi),
    and [iFunny.js](https://github.com/gastrodon/iFunny.js). iFunny.js played a huge role in developing this client, so the author of that was listed as a contributer.

## Using the module

The module was written in ES6, so you'll need to specify the type as `module` in `package.json` or change the extensions to `.mjs` instead of `.js`\
To use the Client, you'll simply use `npm install ifunnynode` in your terminal

## Logging in

Logging in for the first time isn't as simple as it used to be due to iFunny updating their API\
iFunny will sometimes return a captcha error, so you'll need to solve them

1. Create a try block with your login method being called there
2. Add a catch block and check for `err.captcha_url`
    1. Open the captcha url in a browser and solve it
    2. Attempt to login in again with the same credentials
3. You're done!

### Example

```js
import Client from "ifunnynode";

// Get your credentials
const EMAIL = process.env.IFUNNY_NODE_EMAIL;
const PASSWORD = process.env.IFUNNY_NODE_PASSWORD;
const BASIC_TOKEN = process.env.IFUNNY_BASIC_TOKEN ?? new Client().basic_token; // If you don't have a basic token stored, generate one like so

/**
 * The wrapper doesn't store the basic token,
 * which needs to be reused to login,
 * so you'll wanna store this before attempting a login
 */
process.env.IFUNNY_BASIC_TOKEN = BASIC_TOKEN;

// It's a good idea to use the same basic token unless you need to switch, for captcha requests
const client = new Client({
	basic: BASIC_TOKEN,
});

// Login event emits a boolean if it had to generate a new bearer token.
client.on("login", async (new_bearer) => {
	console.log(`new bearer ${new_bearer}`);
});

(async () => {
	try {
		// Since we don't have a bearer token stored, we need to pass an email and a password
		await client.login({
			email: EMAIL,
			password: PASSWORD,
		});
	} catch (err) {
		// check if error was CaptchaError
		if (err.captcha_url) {
			// Open this url in the browser and solve it, then make the request again, using the same basic token
			console.log(err.captcha_url);
		} else {
			// NOT a CaptchaError
			throw err;
		}
	}
})();
```

## Basic command example

```js
// Import the Client from npm
import Client from "ifunnynode";

// Construct the client
const client = new Client({
	token: "bearer",
	basic: "basic_token",
});

// Since we already have a bearer, we don't need to pass any arguments
client.login();

// On Client.login, execute a callback so that we know the client is valid
client.on("login", async () => {
	// Log info to the console (optional)
	console.log(`Client logged in as ${await client.nick} (${client.id_sync})`);

	// Connect to chats
	client.chats.connect();
});

/**
 * Gets the stats of the user and returns them as a string
 * @param {User} user
 */
async function stats(user) {
	let str = "";
	str += `Total Posts: ${await user.post_count}\n`;
	str += `Features: ${await user.feature_count}\n`;
	str += `Total Smiles: ${await user.smile_count}\n`;
	str += `Total Subscribers: ${await user.subscriber_count}\n`;
	str += `Total Subscriptions: ${await user.subscription_count}`;
	return str;
}

client.chats.on(
	"message",
	/** @param {Context} ctx */
	async (ctx) => {
		// Ignore self
		if (ctx.message.author.is_me) return; // Bot will not respond to itself

		//if (!ctx.message.author.is_me) return; // Bot will ONLY respond to itself

		// This isn't how you *should* handle it, but how you *can* handle it.
		// Command with name "mystats" that sends the users profile stats
		if (ctx.message.content === "!mystats") {
			await ctx.channel.send(await stats(ctx.message.author)); // Send the user their stats
		}
	}
);
```
