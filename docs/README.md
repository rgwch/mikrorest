**@rgwch/mikrorest v0.7.7**

***

# MikroRest Server

A minimal, but fully functional REST server in TypeScript for NodeJS.
Use for proof-of concepts, simple private servers and so on.

## Install

`npm i --save @rgwch/mikrorest`

## Use

```typescript
// make sure, environment variables MIKROREST_API_KEYS or MIKROREST_JWT_SECRET are set.

import {MikroRest} from '@rgwch/mikrorest'
import path from 'path'

// create server
const server=new MikroRest()

// add open routes
server.adRoute("get", "/api/sayhello",async (req,res)=>{
  server.sendPlain(res,"Hello, world")
})
// add protected routes (optional)
server.adRoute("get", "/api/tellme", server.authorize,async (req,res)=>{
  server.sendPlain(res,"it's a secret")
})
// add static files directory (optional, directory must exist)
server.addStaticDir(path.join(__dirname, "../../client/dist"));

// implement Login (optional)
server.handleLogin("/api/login",async (username,password)=>{
  // do some checks to verify
  return {checkeduser: username}
})

// start server
server.start()
```
see also src/demo.ts. Run with `npm run demo` or `npx ts-node src/demo.ts`

## Built-in authentication

You can use Mikrorest's built-in authorization system (of course you can use your own as well). There are two possible ways:

(1) provide a MICROREST_API_KEYS environment variable with a comma separated list of valid API-keys. The client must then send an "Authorization: Bearer &lt;key&gt;" header with every request.

(2) call the handleLogin() method with a route and an authentication function as parameters. If you do so, MikroRest will create a login-route at the spezified location and call the authentication function if the user POST that login route with username and passwword in the JSON Body. if the authentication function returns an object, a JWT Token is created and returned together with that object to the client. Note: You must provide a MIKROREST_JWT_SECRET environment variable which gives the secret key to sign the JWT Token.
The client must then include an "Authorization: Token &lt;token&gt;" header with every request.

## API

see [docs](_media/globals.md)

## Tests

Tests were mostly created by Github Copilot. See tests/README.md

## Limitations

No path parameters, only query parameters. Things like `http://localhost:3339/user/{name}/any?/load` will not work with mikrorest. Use `http://localhost:3339/user/load?name=name&any=thing` instead. 
Or use a full featured framework like [Express.js](https://expressjs.com/) or [Koa.js](https://koajs.com/#introduction).
