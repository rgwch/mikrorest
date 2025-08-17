# MicroRest Server

A minimal, but fully functional REST server for NodeJS.
Use for proof-of concepts, simple private servers and so on.

## Install

`npm i --save @rgwch/mikrorest`

## Use

see src/demo.ts. Run with `npx ts-node src/demo.ts`

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

 /** Get the URL from the request */
  public getUrl(req: IncomingMessage): URL {
    return new URL(req.url!, `http://${req.headers.host}`);
  }

 /** Get the query parameters from the request */
  public getParams(req: IncomingMessage): URLSearchParams {
    return this.getUrl(req).searchParams;
  }

  /** Send JSON answer */
  public sendJson(res?: ServerResponse, body?: any, code: number = 200)

  /** Send HTML answer */
  public sendHtml(res?: ServerResponse, body?: string, code: number = 200)

  /** Send plaintext asnwer */
  public sendPlain(res?: ServerResponse, text?: string, code: number = 200)

  /** Send binary answer */
   public sendBuffer(res?: ServerResponse, buffer?: Buffer, code: number = 200, contentType: string = "application/octet-stream") 
```
  
## Tests

Tests were created by Github Copilot. See tests/README.md

## Limitations

No path parameters, only query parameters. Things like `http://localhost:3339/user/{name}/any?/load` will not work with mikrorest. Use `http://localhost:3339/user/load?name=name&any=thing` instead. 
Or use a full featured framework like [Express.js](https://expressjs.com/) or [Koa.js](https://koajs.com/#introduction).
