[**@rgwch/mikrorest v0.6.0**](../README.md)

***

[@rgwch/mikrorest](../globals.md) / MikroRest

# Class: MikroRest

Defined in: index.ts:47

## Constructors

### Constructor

> **new MikroRest**(`options?`): `MikroRest`

Defined in: index.ts:78

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

Defined in: index.ts:104

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

Defined in: index.ts:137

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

Defined in: index.ts:235

Built-in authorization: Check header for Bearer or Token and a key supplied in the environment variable MIKROREST_API_KEYS.
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

Defined in: index.ts:148

Clears all routes and static directories

#### Returns

`void`

***

### error()

> **error**(`res?`, `code?`, `text?`, `headers?`): `void`

Defined in: index.ts:398

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

Defined in: index.ts:168

Convenience function to get the query parameters from the request

#### Parameters

##### req

`IncomingMessage`

#### Returns

`URLSearchParams`

***

### getRoutes()

> **getRoutes**(): `Map`\<`string`, [`MikroRestRoute`](../interfaces/MikroRestRoute.md)\>

Defined in: index.ts:176

Get all routes as a Map

#### Returns

`Map`\<`string`, [`MikroRestRoute`](../interfaces/MikroRestRoute.md)\>

all routes defined so far

***

### getUrl()

> **getUrl**(`req`): `URL`

Defined in: index.ts:159

Convenience function to get the URL from the request

#### Parameters

##### req

`IncomingMessage`

#### Returns

`URL`

the URL object

***

### readBodyBuffer()

> **readBodyBuffer**(`req`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: index.ts:295

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

Defined in: index.ts:268

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

Defined in: index.ts:377

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

Defined in: index.ts:337

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

Defined in: index.ts:317

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

Defined in: index.ts:356

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

Defined in: index.ts:412

#### Parameters

##### res

`ServerResponse`

##### maxAge

`number`

#### Returns

`void`

***

### start()

> **start**(): `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>

Defined in: index.ts:184

Launch the server. routes and static directories can be added before ore after calling this method.

#### Returns

`Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>

the HTTP server instance
