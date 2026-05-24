[**@rgwch/mikrorest v1.2.0**](../README.md)

***

[@rgwch/mikrorest](../globals.md) / MikroRestOptions

# Type Alias: MikroRestOptions

> **MikroRestOptions** = `object`

Defined in: index.ts:35

## Properties

### allowedHeadersDevel?

> `optional` **allowedHeadersDevel?**: `string`[]

Defined in: index.ts:48

CORS settings: Allowed headers in development mode (default: ['Content-Type', 'Authorization'])

***

### allowedHeadersProd?

> `optional` **allowedHeadersProd?**: `string`[]

Defined in: index.ts:54

CORS settings: Allowed headers in production mode (default: ['Content-Type', 'Authorization'])

***

### allowedMethodsDevel?

> `optional` **allowedMethodsDevel?**: `string`[]

Defined in: index.ts:50

CORS settings: Allowed methods in development mode (default: ['GET', 'POST', 'OPTIONS'])

***

### allowedMethodsProd?

> `optional` **allowedMethodsProd?**: `string`[]

Defined in: index.ts:56

CORS settings: Allowed methods in production mode (default: ['GET', 'POST', 'OPTIONS'])

***

### allowedOriginsDevel?

> `optional` **allowedOriginsDevel?**: `string`[]

Defined in: index.ts:52

CORS settings: Allowed origins in development mode (default: ['*'])

***

### allowedOriginsProd?

> `optional` **allowedOriginsProd?**: `string`[]

Defined in: index.ts:58

CORS settings: Allowed origins in production mode (default: [''])

***

### jwtRefreshHeaderName?

> `optional` **jwtRefreshHeaderName?**: `string`

Defined in: index.ts:64

Response header carrying renewed token (default: X-Auth-Token)

***

### jwtSlidingExpiration?

> `optional` **jwtSlidingExpiration?**: `boolean`

Defined in: index.ts:60

Enable sliding JWT expiration (default: false)

***

### jwtSlidingThresholdMinutes?

> `optional` **jwtSlidingThresholdMinutes?**: `number`

Defined in: index.ts:62

Refresh token when remaining lifetime is below this threshold (minutes, default: 10)

***

### port?

> `optional` **port?**: `number`

Defined in: index.ts:37

Port number for the server (default: 3339 or value of environment variable MIKROREST_PORT)

***

### ssl?

> `optional` **ssl?**: `object`

Defined in: index.ts:39

SSL settings: If provided, an HTTPS server is created

#### cert

> **cert**: `string`

path to SSL certificate file

#### key

> **key**: `string`

path to SSL key file

***

### useBlocklist?

> `optional` **useBlocklist?**: `boolean`

Defined in: index.ts:46

Whether to use the built-in blocklist feature for IPs with repeated offenses (default: false)
