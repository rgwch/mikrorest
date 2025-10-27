[**@rgwch/mikrorest v0.8.0**](../README.md)

***

[@rgwch/mikrorest](../globals.md) / MikroRestHandler

# Type Alias: MikroRestHandler()

> **MikroRestHandler** = (`req`, `res`) => `Promise`\<`boolean`\>

Defined in: index.ts:18

A handler function for a route. It receives the IncomingMessage and ServerResponse objects.
It must return a Promise that resolves to true if the next handler should be called, or false to stop processing.
The handler must have answered the request, if it returns false. (Otherwise, the users's browser will hang).

## Parameters

### req

`IncomingMessage`

### res

`ServerResponse`

## Returns

`Promise`\<`boolean`\>
