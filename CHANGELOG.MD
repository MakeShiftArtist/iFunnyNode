### 0.1.0

Initial commit

-   Added `FreshObject` class
-   Added `Client` class

### 0.1.1

-   Added `Client.login` method

### 1.2.0

-   Fixed `Client.login` method
-   Added `CaptchaError` Error class

### 1.3.0

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
