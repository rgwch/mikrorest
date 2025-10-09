# MikroRest Server

A minimal, but fully functional REST server for NodeJS.
Use for proof-of concepts, simple private servers and so on.

## Install

`npm i --save @rgwch/mikrorest`

## Use

see src/demo.ts. Run with `npm run demo` or `npx ts-node src/demo.ts`

## Built-in authentication

You can use Mikrorest's built-in authorization system (of course you can use your own as well). There are two possible ways:

(1) provide a MICROREST_API_KEYS environment variable with a comma separated list of valid API-keys. The client must then send an "autorization: bearer &lt;key&gt;" header with every request.

(2) call the handleLogin() method with a route and authentication function as parameters. If you do so, MikroRest will create a login-route at the spezified location and call the authentication function if the user POST that login route with username and passwword in the JSON Body. if the authentication function returns true, a JWT Token is created and returned to the client.
The client must then include an "authorization: token &lt;token&gt;" header with every request.

## API

see [docs](docs/globals.md)

## Tests

Tests were created by Github Copilot. See tests/README.md

## Limitations

No path parameters, only query parameters. Things like `http://localhost:3339/user/{name}/any?/load` will not work with mikrorest. Use `http://localhost:3339/user/load?name=name&any=thing` instead. 
Or use a full featured framework like [Express.js](https://expressjs.com/) or [Koa.js](https://koajs.com/#introduction).
