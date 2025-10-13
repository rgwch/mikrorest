[**@rgwch/mikrorest v0.7.6**](../README.md)

***

[@rgwch/mikrorest](../globals.md) / MikroRest

# Class: MikroRest

Defined in: index.ts:51

## Constructors

### Constructor

> **new MikroRest**(`options?`): `MikroRest`

Defined in: index.ts:84

The constructor creates practical defaults for the MikroRest instance. Modify as needed with options

#### Parameters

##### options?

[`MikroRestOptions`](../type-aliases/MikroRestOptions.md)

Optional configuration for the MikroRest instance.

#### Returns

`MikroRest`

## Methods

### addRoute()

> **addRoute**(`method`, `path`, ...`handlers`): `void`

Defined in: index.ts:110

Adds a new route to the MikroRest instance. 
If the method is called several times with the same method and path, 
handlers are just appended to existing.

#### Parameters

##### method

[`MikroRestMethod`](../type-aliases/MikroRestMethod.md)

The HTTP method for the route (GET, POST, OPTIONS, PUT, DELETE)

##### path

`string`

The path for the route, starting with /

##### handlers

...[`MikroRestHandler`](../type-aliases/MikroRestHandler.md)[]

The handler functions for the route, If more than one handler is supplied,
  handlers are called in the order given.
If a handler returns true, the next handler of the chain is called, else the call is terminated

#### Returns

`void`

#### Throws

Error if parameters are wrong

***

### addStaticDir()

> **addStaticDir**(`dir`): `void`

Defined in: index.ts:143

Add a directory for static files

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

Defined in: index.ts:275

Built-in authorization: Check header for Bearer or Token and a key supplied in the environment variable MIKROREST_API_KEYS,
or check for a valid JWT token if MIKROREST_JWT_SECRET is set.
To use, simply prepend server.authorize to your handler in a route definition.

#### Parameters

##### req

`IncomingMessage`

##### res

`ServerResponse`

#### Returns

`Promise`\<`boolean`\>

true if authorization succeeded.

***

### clearRoutes()

> **clearRoutes**(): `void`

Defined in: index.ts:154

Clears all routes and static directories

#### Returns

`void`

***

### decodeJWT()

> **decodeJWT**(`token`): `any`

Defined in: index.ts:246

#### Parameters

##### token

`string`

#### Returns

`any`

***

### error()

> **error**(`res?`, `code?`, `text?`, `headers?`): `void`

Defined in: index.ts:535

Send an error response

#### Parameters

##### res?

`ServerResponse`\<`IncomingMessage`\>

##### code?

`number`

code (defaults to 500)

##### text?

`string`

text to send, defaults to "internal server error"

##### headers?

optional headers to set (key-value pairs). Content-Type is set automatically to "text/plain" if not provided

#### Returns

`void`

***

### getParams()

> **getParams**(`req`): `URLSearchParams`

Defined in: index.ts:174

Convenience function to get the query parameters from the request

#### Parameters

##### req

`IncomingMessage`

#### Returns

`URLSearchParams`

***

### getRoutes()

> **getRoutes**(): `Map`\<`string`, [`MikroRestRoute`](../interfaces/MikroRestRoute.md)\>

Defined in: index.ts:182

Get all routes as a Map

#### Returns

`Map`\<`string`, [`MikroRestRoute`](../interfaces/MikroRestRoute.md)\>

all routes defined so far

***

### getUrl()

> **getUrl**(`req`): `URL`

Defined in: index.ts:165

Convenience function to get the URL from the request

#### Parameters

##### req

`IncomingMessage`

#### Returns

`URL`

the URL object

***

### handleLogin()

> **handleLogin**(`loginRoute`, `authenticate`): `void`

Defined in: index.ts:323

Let Mikrorest handle Login for you. Supply a function that checks username and password and returns true if they are valid.
it will setup a POST route at loginRoute (e.g. /login) that expects a JSON body with username and password.
If the credentials are valid, it will return a JWT that can be used for authorization in subsequent requests, 
and an (arbitrary) user object as received from the authenticate-function.
The token is valid for MIKROREST_JWT_EXPIRATION minutes. You can use it in the Authorization header as "Token <token>".
The Login route also accepts a JSON body with { extend: true } to extend the token expiration.
The request must then include the existing token in the Authorization header.

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

Defined in: index.ts:432

Read the request body as Buffer

#### Parameters

##### req

`IncomingMessage`

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

a Buffer object

#### Throws

Error if the request body is not valid

***

### readJsonBody()

> **readJsonBody**(`req`, `res?`): `Promise`\<`any`\>

Defined in: index.ts:405

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

Defined in: index.ts:514

Send a binary response. If is not provided, it will send a default response with status "ok".

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

Defined in: index.ts:474

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

Defined in: index.ts:454

Send a JSON response. If body is not provided, it will send a default response with status "ok".

#### Parameters

##### res?

`ServerResponse`\<`IncomingMessage`\>

##### body?

`any`

##### code?

`number` = `200`

response status code, default is 200

##### headers?

optional headers to set (key-value pairs). Content-Type is set automatically to "application/json"

#### Returns

`void`

***

### sendPlain()

> **sendPlain**(`res?`, `text?`, `code?`, `headers?`): `void`

Defined in: index.ts:493

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

Defined in: index.ts:549

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

Defined in: index.ts:190

Launch the server. routes and static directories can be added before ore after calling this method.

#### Returns

`any`

the HTTP server instance

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: index.ts:235

#### Returns

`Promise`\<`void`\>
