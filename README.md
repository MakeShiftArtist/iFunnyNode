# iFunnyNode

This is an iFunny API Wrapper written in ES6 Node JS.\
This is in the early stages so most of the API hasn't been implemented yet.\
Chats will eventually be added, but I'm currently focusing on the rest of the API.
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

// Almost every getter is async so you have to await them
(async () => {
	console.log(await client.feature_count);
})();
```

## Logging in

Logging in isn't as simple as it used to be due to iFunny updating their API\
iFunny will sometimes return a captcha error, so you'll need to solve them

1. Create a try block with your login method being called there
2. Add a catch block and check for `err.captcha_url`
    1. Open the captcha url in a browser and solve it
    2. Attempt to login in again with the same credentials
3. You're done!

**EXAMPLE**

```js
// imports the client and the User and Post Object.
import Client, { User, Post } from "ifunnynode";

// Get your credentials
const IFUNNY_EMAIL = process.env.IFUNNY_NODE_EMAIL;
const IFUNNY_PASSWORD = process.env.IFUNNY_NODE_PASSWORD;

const client = new Client();

client.on("login", async (new_bearer) => {
	// Get a user by nickname
	let user = await client.user_by_nick("iFunnyChef");
	// or
	// let user = (await client.user).by_nick("iFunnyChef");

	// Subscribe to the user
	let response = await user.subscribe();

	// Check status code of response
	if (response.status === 200) {
		console.log(`Subscribed to: ${await user.nick}`);
	} else {
		console.log("Failed to subscribe");
	}

	let taz = new User();
});

(async () => {
	try {
		// emits 'login' with `true` if it's a new bearer
		// or `false` if it had one in the config file
		await client.login(IFUNNY_EMAIL, IFUNNY_PASSWORD);
	} catch (err) {
		// check if error was CaptchaError
		if (err.captcha_url) {
			// Log the captcha url so you can open it
			console.log(captcha_url.blue);
			// You could use the npm package `open` to open the url as well
		} else {
			// NOT a CaptchaError
			throw err;
		}
	}
})();
```
