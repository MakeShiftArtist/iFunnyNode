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
