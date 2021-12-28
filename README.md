# iFunnyNodeAPI
iFunny API wrapper written in Node.JS
**VERY EARLY STAGES**
- I'm writing this wrapper from scratch, taking inspiration from
[discord.py](https://github.com/Rapptz/discord.py),
[discord.js](https://github.com/discordjs/discord.js),
[ifunnyapi](https://github.com/EamonTracey/ifunnyapi),
and [iFunny.js](https://github.com/gastrodon/iFunny.js)

# Logging in
Have a config.json file that looks like this in your source directory\
`password` is optional if a bearer token is stored
```JSON
{
  "email": "your iFunny email",
  "password": "your iFunny password"
}
```
```js
const Client = require('iFunnyAPI');

const config = require('./config.json');

const client = new Client();

client.on('login', new_bearer => {
  client.user_by_nick('TyrannyChecker').then(user => {
    console.log(user._payload);
  });
});

client.login(config.email, config.password);
```
