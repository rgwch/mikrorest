**@rgwch/mikrorest v0.6.0**

***

# MikroRest Server

A minimal, but fully functional REST server for NodeJS.
Use for proof-of concepts, simple private servers and so on.

## Install

`npm i --save @rgwch/mikrorest`

## Use

if built-in authorization should be used, set the environment variable MIKROREST_API_KEYS (comma delimited list)

see src/demo.ts. Run with `npm run demo` or `npx ts-node src/demo.ts`

## API

see [docs](docs/globals.md)

## Tests

Tests were created by Github Copilot. See tests/README.md

## Limitations

No path parameters, only query parameters. Things like `http://localhost:3339/user/{name}/any?/load` will not work with mikrorest. Use `http://localhost:3339/user/load?name=name&any=thing` instead. 
Or use a full featured framework like [Express.js](https://expressjs.com/) or [Koa.js](https://koajs.com/#introduction).
