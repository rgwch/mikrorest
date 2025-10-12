[**@rgwch/mikrorest v0.7.5**](../README.md)

***

[@rgwch/mikrorest](../globals.md) / MikroRestRoute

# Interface: MikroRestRoute

Defined in: index.ts:28

A route definition for MikroRest
The path must begin with /
The method is case-insensitive and must be one of: GET, POST, PUT, DELETE, OPTIONS
Handlers are called in the order given. If a handler returns true, the next handler of the chain is called, else the call is terminated.

## Properties

### handlers

> **handlers**: [`MikroRestHandler`](../type-aliases/MikroRestHandler.md)[]

Defined in: index.ts:31

***

### method

> **method**: [`MikroRestMethod`](../type-aliases/MikroRestMethod.md)

Defined in: index.ts:29

***

### path

> **path**: `string`

Defined in: index.ts:30
