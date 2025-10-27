[**@rgwch/mikrorest v0.8.0**](../README.md)

***

[@rgwch/mikrorest](../globals.md) / MikroRestRoute

# Interface: MikroRestRoute

Defined in: index.ts:29

A route definition for MikroRest
The path must begin with /
The method is case-insensitive and must be one of: GET, POST, PUT, DELETE, OPTIONS
Handlers are called in the order given. If a handler returns true, the next handler of the chain is called, else the call is terminated.

## Properties

### handlers

> **handlers**: [`MikroRestHandler`](../type-aliases/MikroRestHandler.md)[]

Defined in: index.ts:32

***

### method

> **method**: [`MikroRestMethod`](../type-aliases/MikroRestMethod.md)

Defined in: index.ts:30

***

### path

> **path**: `string`

Defined in: index.ts:31
