[**@rgwch/mikrorest v0.9.1**](../README.md)

***

[@rgwch/mikrorest](../globals.md) / MikroRest

# Class: MikroRest

Defined in: index.ts:59

## Constructors

### Constructor

> **new MikroRest**(`options?`): `MikroRest`

Defined in: index.ts:92

The constructor creates practical defaults for the MikroRest instance. Modify as needed with options.

#### Parameters

##### options?

[`MikroRestOptions`](../type-aliases/MikroRestOptions.md)

Optional configuration for the MikroRest instance.

#### Returns

`MikroRest`

## Methods

### addRoute()

> **addRoute**(`method`, `path`, ...`handlers`): `void`

Defined in: index.ts:118

Adds a new route to the MikroRest instance. 
If the method is called several times with the same method and path, 
handlers are appended to existing ones.

#### Parameters

##### method

[`MikroRestMethod`](../type-aliases/MikroRestMethod.md)

The HTTP method for the route (GET, POST, OPTIONS, PUT, DELETE)

##### path

`string`

The path for the route, starting with /

##### handlers

...[`MikroRestHandler`](../type-aliases/MikroRestHandler.md)[]

The handler functions for the route. If more than one handler is supplied,
  handlers are called in the order given.
If a handler returns true, the next handler in the chain is called, else the call is terminated

#### Returns

`void`

#### Throws

Error if parameters are wrong

***

### addStaticDir()

> **addStaticDir**(`dir`): `void`

Defined in: index.ts:152

Add a directory for static files. If the method is called several times,
directories are searched in the sequence they were added.

#### Parameters

##### dir

`string`

absolute path to the directory, e.g. path.join(__dirname, "..", "client", "dist")

#### Returns

`void`

#### Throws

Error if the directory does not exist

***

### authorize()

> **authorize**(`req`, `res`): `Promise`\<`boolean`\>

Defined in: index.ts:327

Built-in authorization: Check header for Bearer or Token and a key supplied in the environment variable MIKROREST_API_KEYS,
or check for a valid JWT token if MIKROREST_JWT_SECRET is set.
To use, simply prepend server.authorize to your handler in a route definition.

#### Parameters

##### req

`IncomingMessage`

The incoming request

##### res

`ServerResponse`

The server response

#### Returns

`Promise`\<`boolean`\>

true if authorization succeeded.
Note: later handlers in the chain can access the decoded token via req.user

***

### clearRoutes()

> **clearRoutes**(): `void`

Defined in: index.ts:163

Clears all routes and static directories

#### Returns

`void`

***

### error()

> **error**(`res?`, `code?`, `text?`, `headers?`): `void`

Defined in: index.ts:584

Send an error response

#### Parameters

##### res?

`ServerResponse`\<`IncomingMessage`\>

The server response

##### code?

`number`

Status code (defaults to 500)

##### text?

`string`

Text to send, defaults to "Internal Server Error"

##### headers?

Optional headers to set (key-value pairs). Content-Type is set automatically to "text/plain" if not provided

#### Returns

`void`

***

### getParams()

> **getParams**(`req`): `URLSearchParams`

Defined in: index.ts:183

Convenience function to get the query parameters from the request

#### Parameters

##### req

`IncomingMessage`

The incoming request

#### Returns

`URLSearchParams`

The URL search parameters

***

### getRoutes()

> **getRoutes**(): `Map`\<`string`, [`MikroRestRoute`](../interfaces/MikroRestRoute.md)\>

Defined in: index.ts:191

Get all routes as a Map

#### Returns

`Map`\<`string`, [`MikroRestRoute`](../interfaces/MikroRestRoute.md)\>

all routes defined so far

***

### getUrl()

> **getUrl**(`req`): `URL`

Defined in: index.ts:174

Convenience function to get the URL from the request

#### Parameters

##### req

`IncomingMessage`

The incoming request

#### Returns

`URL`

the URL object

***

### handleLogin()

> **handleLogin**(`loginRoute`, `authenticate`): `void`

Defined in: index.ts:376

Let MikroRest handle login for you. Supply a route and function that checks username and password and returns an (arbitrary) object 
if they are valid or null if not.
It will set up a POST route at loginRoute (e.g. /login) that expects a JSON body with username and password.
If the credentials are valid, it will return a JWT that can be used for authorization in subsequent requests, 
and a user object as received from the authenticate function.
The token is valid for MIKROREST_JWT_EXPIRATION minutes. You can use it in the Authorization header as "Token <token>".
The login route also accepts a JSON body with { extend: true } to extend the token expiration.
The request must then include the existing token in the Authorization header and will receive the updated JWT as response.

#### Parameters

##### loginRoute

`string`

the path for the login route, e.g. /login

##### authenticate

(`username`, `password`) => `Promise`\<`any`\>

an async function that checks username and password and resolves to a (User-) Object if they are valid

#### Returns

`void`

***

### readBodyBuffer()

> **readBodyBuffer**(`req`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: index.ts:481

Read the request body as Buffer

#### Parameters

##### req

`IncomingMessage`

The incoming request

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

a Buffer object

#### Throws

Error if the request body is not valid

***

### readJsonBody()

> **readJsonBody**(`req`, `res?`): `Promise`\<`any`\>

Defined in: index.ts:454

Read the request body as JSON

#### Parameters

##### req

`IncomingMessage`

##### res?

`ServerResponse`\<`IncomingMessage`\>

#### Returns

`Promise`\<`any`\>

a JSON object

#### Throws

Error if the request body is not valid JSON

***

### sendBuffer()

> **sendBuffer**(`res?`, `buffer?`, `code?`, `headers?`): `void`

Defined in: index.ts:563

Send a binary response. If buffer is not provided, it will send a default response with status "ok".

#### Parameters

##### res?

`ServerResponse`\<`IncomingMessage`\>

##### buffer?

`Buffer`\<`ArrayBufferLike`\>

contents to send

##### code?

`number` = `200`

response status code, default is 200

##### headers?

optional headers to set (key-value pairs). Content-Type is set automatically to "application/octet-stream" if not provided

#### Returns

`void`

#### Throws

Error if res or buffer is not provided

***

### sendHtml()

> **sendHtml**(`res?`, `body?`, `code?`, `headers?`): `void`

Defined in: index.ts:523

Send a HTML response. If body is not provided, it will send an empty response with status 200,ok.

#### Parameters

##### res?

`ServerResponse`\<`IncomingMessage`\>

##### body?

`string`

A html document

##### code?

`number` = `200`

response status code, default is 200

##### headers?

optional headers to set (key-value pairs). Content-Type is set automatically to "text/html; charset=utf-8"

#### Returns

`void`

***

### sendJson()

> **sendJson**(`res?`, `body?`, `code?`, `headers?`): `void`

Defined in: index.ts:503

Send a JSON response. If body is not provided, it will send a default response with {"status": "ok"}.

#### Parameters

##### res?

`ServerResponse`\<`IncomingMessage`\>

The server response

##### body?

`any`

The response body

##### code?

`number` = `200`

Response status code, default is 200

##### headers?

Optional headers to set (key-value pairs). Content-Type is set automatically to "application/json"

#### Returns

`void`

***

### sendPlain()

> **sendPlain**(`res?`, `text?`, `code?`, `headers?`): `void`

Defined in: index.ts:542

Send a plaintext response. If text is not provided, it will send a an empty string with status 200,ok.

#### Parameters

##### res?

`ServerResponse`\<`IncomingMessage`\>

##### text?

`string`

some plaintext

##### code?

`number` = `200`

response status code, default is 200

##### headers?

optional headers to set (key-value pairs). Content-Type is set automatically to "text/plain"

#### Returns

`void`

***

### setMaxAge()

> **setMaxAge**(`res`, `maxAge`): `void`

Defined in: index.ts:598

#### Parameters

##### res

`ServerResponse`

##### maxAge

`number`

#### Returns

`void`

***

### start()

> **start**(): `any`

Defined in: index.ts:238

Launch the server. routes and static directories can be added before or after calling this method.

#### Returns

`any`

the HTTP server instance

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: index.ts:264

Stop the server. No requests are accepted after this method is called.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the server has stopped

***

### createJWT()

> `static` **createJWT**(`secret`, `user`): `object`

Defined in: index.ts:310

Static helper method to create a JWT token

#### Parameters

##### secret

`string`

The secret used to sign the token

##### user

`any`

The user object to include in the token payload

#### Returns

`object`

An object containing the token and its expiration date

##### token

> **token**: `string`

##### validUntil

> **validUntil**: `Date`

***

### decodeJWT()

> `static` **decodeJWT**(`token`, `jwt_secret?`, `checkExpire?`): `any`

Defined in: index.ts:283

Static helper method to decode an existing JWT token

#### Parameters

##### token

`string`

The JWT token to decode

##### jwt\_secret?

`string`

The secret used to verify the token

##### checkExpire?

`boolean` = `true`

Whether to check if the token has expired

#### Returns

`any`

the decoded token or null if it could not be decoded or was not valid
