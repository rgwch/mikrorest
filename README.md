# MicroRest Server

A minimal, but fully functional REST server for NodeJS.
Use for proof-of concepts, simple private servers and so on.

## Install

`npm i --save @rgwch/mikrorest`

## Use

see src/demo.ts. Run with `npm run demo` or `npx ts-node src/demo.ts`

## API

``` typescript
export type MikroRestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;

export interface MikroRestRoute {
  method: MikroRestMethod; // The HTTP method for the route
  path: string; // The path for the route
  handlers: Array<MikroRestHandler>; // The handler functions for the route
}

export type MikroRestOptions = {
  port?: number; // Port number for the server
  allowedHeadersDevel?: string[]; // Allowed headers in development mode
  allowedMethodsDevel?: string[]; // Allowed methods in development mode
  allowedOriginsDevel?: string[]; // Allowed origins in development mode
  allowedHeadersProd?: string[]; // Allowed headers in production mode
  allowedMethodsProd?: string[]; // Allowed methods in production mode
  allowedOriginsProd?: string[]; // Allowed origins in production mode
};

/**
 * Create a new MikroRest Server. Options can be empty or contain any of the above parameters.
   Default port is 3339, if none is given.
 */
public constructor(options?:MoktoRestOptions)

  /**
   * Adds a new route to the MikroRest instance. 
   * If the method is called several times with the same method and path, 
   * handlers are just appended to existing.
   * @param method The HTTP method for the route (GET, POST, OPTIONS, PUT, DELETE)
   * @param path The path for the route, starting with /
   * @param handlers The handler functions for the route, If more than one handler is supplied,
     handlers are called in the order given.
   * If a handler returns true, the next handler of the chain is called, else the call is terminated
   * @throws Error if parameters are wrong
   */
  public addRoute(method: MikroRestMethod, path: string, ...handlers: Array<MikroRestHandler>)

   /**
   * Add a directory for static files
   * @param dir 
   * @throws Error if the directory does not exist
   */
  public addStaticDir(dir: string) 
/**
   * Clears all routes and static directories
   */
  public clearRoutes() 

   
  /**
   * Launch the server
   */
  public start()

  /** Some convenience methods */

/**
   * Read a POST request body as JSON
   * @param req 
   * @param res 
   * @returns a JSON object
   * @throws Error if the request body is not valid JSON
   */
  public readJsonBody(req: IncomingMessage, res?: ServerResponse): Promise<any> 

 /** Get the URL from the request */
  public getUrl(req: IncomingMessage): URL {
    return new URL(req.url!, `http://${req.headers.host}`);
  }

 /** Get the query parameters from the request */
  public getParams(req: IncomingMessage): URLSearchParams {
    return this.getUrl(req).searchParams;
  }

  /**
   * Send a JSON response. If body is not provided, it will 
   * send  a default response with status "ok".
   * @param res 
   * @param body
   * @param headers optional headers to set (key-value pairs). 
   *        Content-Type is set automatically to "application/json"
   * @param code response status code, default is 200
   */
  public sendJson(res?: ServerResponse, body?: any, code: number = 200, headers?: { [key: string]: string })
   
  /**
 * Send a HTML response. If body is not provided, it will 
 * send an empty response with status 200,ok.
 * @param res 
 * @param body A html document
 * @param headers optional headers to set (key-value pairs). 
 *                Content-Type is set automatically to "text/html; charset=utf-8"
 * @param code response status code, default is 200
 */
  public sendHtml(res?: ServerResponse, body?: string, code: number = 200, headers?: { [key: string]: string }) 

/**
 * Send a plaintext response. If body is not provided, it will 
 * send a an empty string with status 200,ok.
 * @param res 
 * @param body some plaintext
 * @param headers optional headers to set (key-value pairs). 
 *        Content-Type is set automatically to "text/plain"
 * @param code response status code, default is 200
 */
  public sendPlain(res?: ServerResponse, text?: string, code: number = 200, headers?: { [key: string]: string }) 


/**
 * Send a binary response. If is not provided, it will send 
 * a default response with status "ok".
  * @param res 
  * @param buffer: contents to send
  * @param code response status code, default is 200
  * @param headers optional headers to set (key-value pairs). 
  *        Content-Type is set automatically to "application/octet-stream" if not provided
  * @throws Error if res or buffer is not provided
*/
  public sendBuffer(res?: ServerResponse, buffer?: Buffer, code: number = 200, headers?: { [key: string]: string }) 
   
```
  
## Tests

Tests were created by Github Copilot. See tests/README.md

## Limitations

No path parameters, only query parameters. Things like `http://localhost:3339/user/{name}/any?/load` will not work with mikrorest. Use `http://localhost:3339/user/load?name=name&any=thing` instead. 
Or use a full featured framework like [Express.js](https://expressjs.com/) or [Koa.js](https://koajs.com/#introduction).
