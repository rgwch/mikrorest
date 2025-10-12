[**@rgwch/mikrorest v0.7.5**](../README.md)

***

[@rgwch/mikrorest](../globals.md) / MikroRestOptions

# Type Alias: MikroRestOptions

> **MikroRestOptions** = `object`

Defined in: index.ts:34

## Properties

### allowedHeadersDevel?

> `optional` **allowedHeadersDevel**: `string`[]

Defined in: index.ts:38

CORS settings: Allowed headers headers in development mode (default: ['Content-Type', 'Authorization'])

***

### allowedHeadersProd?

> `optional` **allowedHeadersProd**: `string`[]

Defined in: index.ts:44

CORS settings: Allowed headers headers in production mode (default: ['Content-Type', 'Authorization'])

***

### allowedMethodsDevel?

> `optional` **allowedMethodsDevel**: `string`[]

Defined in: index.ts:40

CORS settings: Allowed methods in development mode (default: ['GET', 'POST', 'OPTIONS'])

***

### allowedMethodsProd?

> `optional` **allowedMethodsProd**: `string`[]

Defined in: index.ts:46

CORS settings: Allowed methods in production mode (default: ['GET', 'POST', 'OPTIONS'])

***

### allowedOriginsDevel?

> `optional` **allowedOriginsDevel**: `string`[]

Defined in: index.ts:42

CORS settings: Allowed origins in development mode (default: ['*'])

***

### allowedOriginsProd?

> `optional` **allowedOriginsProd**: `string`[]

Defined in: index.ts:48

CORS settings: Allowed origins in production mode (default: [''])

***

### port?

> `optional` **port**: `number`

Defined in: index.ts:36

Port number for the server (default: 3339 or value of environment variable MIKROREST_PORT)
