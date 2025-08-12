# MicroRest Server

A minimal, but fully functional REST server for NodeJS.
Use for proof-of concepts, simple private servers and so on.

## Install

`npm i --save @rgwch/mikrorest`

## Use

```typescript
import {MikroRest} from '@rgwch/mikrorest'
const server=new MikroRest()
server.addStaticDir(path.join(__dirname, "..", "..", "client", "dist"));
// Sample route. Call with: http://localhost:3339/temperature?date=2025/08/12
server.addRoute("get", "/temperature", async (req, res) => {
  const params=server.getParams(req)
  if(params.get("date")=="2025/08/12"){
    server.sendJson(res, {
      "temperature": "hot"
    })
  }else{
    server.sendJson(res, {
      "temperature": "don't know"
    })
  }
  return false
  });
server.start();


```

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
  allowedOrigins?: string[]; // Allowed origins for CORS
  allowedHeadersDevel?: string[]; // Allowed headers in development mode
  allowedMethodsDevel?: string[]; // Allowed methods in development mode
  allowedOriginsDevel?: string[]; // Allowed origins in development mode
  allowedHeadersProd?: string[]; // Allowed headers in production mode
  allowedMethodsProd?: string[]; // Allowed methods in production mode
  allowedOriginsProd?: string[]; // Allowed origins in production mode
};

/**
 * Create a new MikroRest Server. Options can be empty or contain any of the above parameters. Default port is 3339, if none is given.
 */
public constructor(options?:MoktoRestOptions)

  /**
   * Adds a new route to the MikroRest instance. If the method is called several times with the same methoid and path, handlers are just appended to existing
   * @param method The HTTP method for the route (GET, POST, OPTIONBS, PUT, DELETE)
   * @param path The path for the route, starting with /
   * @param handlers The handler functions for the route, If more than one handler is supplied, handlers are called in the order given.
   * If a handler returns true, the next handler of tze chain is called, else the call is terminated
   * @throws Error if parameters are wrong
   */
  public addRoute(method: MikroRestMethod, path: string, ...handlers: Array<MikroRestHandler>)

   /**
   * Add a directory for static files
   * @param dir 
   * @throws Error if the directory does not exist
   */
  public addStaticDir(dir: string) {
    if (!dir || !existsSync(dir)) {
      throw new Error("Directory does not exist: " + dir);
    }
    this.staticDirs.push(dir);
    logger.info(`Static directory added: ${dir}`);
  }

/**
   * Clears all routes and static directories
   */
  public clearRoutes() {
    this.routes = new Map<string, MikroRestRoute>();
    this.staticDirs = [];
    logger.info("All routes and static dirs cleared");
  }

  
 
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