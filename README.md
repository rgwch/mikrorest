# MikroRest Server

A minimal, but fully functional REST server in TypeScript for Node.js.
Use for proof-of-concepts, simple private servers, and more.

## Install

`npm i --save @rgwch/mikrorest`

## Use

```typescript
// Make sure environment variables MIKROREST_API_KEYS or MIKROREST_JWT_SECRET are set.

import {MikroRest} from '@rgwch/mikrorest'
import path from 'path'

// Create server
const server=new MikroRest()

// Add open routes
server.addRoute("get", "/api/sayhello",async (req,res)=>{
  server.sendPlain(res,"Hello, world")
  return false
})
// Add protected routes (optional)
server.addRoute("get", "/api/tellme", server.authorize,async (req,res)=>{
  server.sendPlain(res,"it's a secret")
  return false
})
// Add static files directory (optional, directory must exist)
server.addStaticDir(path.join(__dirname, "../../client/dist"));

// Implement login (optional)
server.handleLogin("/api/login",async (username,password)=>{
  // Do some checks to verify
  return {checkeduser: username}
})

// Start server
server.start()
```
See also src/demo.ts. Run with `npm run demo` or `npx ts-node src/demo.ts`

## Built-in authentication

You can use MikroRest's built-in authorization system (of course you can use your own as well). There are two possible ways:

(1) Provide a MIKROREST_API_KEYS environment variable with a comma-separated list of valid API keys. The client must then send an "Authorization: Bearer &lt;key&gt;" header with every request.

(2) Call the handleLogin() method with a route and an authentication function as parameters. If you do so, MikroRest will create a login route at the specified location and call the authentication function if the user POSTs to that login route with username and password in the JSON body. If the authentication function returns an object, a JWT token is created and returned together with that object to the client. Note: You must provide a MIKROREST_JWT_SECRET environment variable which gives the secret key to sign the JWT token.
The client must then include an "Authorization: Token &lt;token&gt;" header with every request.

## SSL

If you need an SSL server, you can pass pathnames for key and certificate to the constructor [options](docs/type-aliases/MikroRestOptions.md).

## API

See [docs](docs/globals.md)

## Tests

Tests were mostly created by GitHub Copilot. See tests/README.md

## Limitations

No path parameters, only query parameters. Things like `http://localhost:3339/user/{name}/any?/load` will not work with MikroRest. Use `http://localhost:3339/user/load?name=name&any=thing` instead. 
Or use a full-featured framework like [Express.js](https://expressjs.com/) or [Koa.js](https://koajs.com/#introduction).
