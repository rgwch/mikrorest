//import "dotenv/config"
import { createServer, IncomingMessage, ServerResponse } from "http";
import { logger } from "./logger";
const pck = require('../package.json')
import { createReadStream } from "fs";
import path from "path";
// logger.warning(JSON.stringify(process.env, null, 2))
const api_keys = process.env.API_KEYS?.split(",") || []

const serverError = "Internal Server Error"
const badRequest = "Bad Request"
const notFound = "Not Found"
import { existsSync } from "fs";
import { log } from "console";

export type MikroRestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;
export type MikroRestMethod = "get" | "post" | "put" | "delete" | "options";
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

export class MikroRest {
  private mode = (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" || process.env.NODE_ENV == "debug") ? "development" : "production";
  private port: number;
  private allowedOrigins: string[] = []
  private allowedHeadersDevel: string[] = [
    'Content-Type',
    'Authorization'
  ]
  private allowedMethodsDevel: string[] = [
    'GET',
    'POST',
    'OPTIONS'
  ]
  private allowedOriginsDevel: string[] = [
    '*' // Allow all origins in development mode 
  ]
  private allowedHeadersProd: string[] = [...this.allowedHeadersDevel, 'X-Requested-With', 'Accept', 'Origin', 'Referer']
  private allowedMethodsProd: string[] = [...this.allowedMethodsDevel]
  private allowedOriginsProd: string[] = [
    ''
  ]
  // private routes: MikroRestRoute[] = [];
  private routes: Map<string, MikroRestRoute> = new Map();

  private staticDirs: string[] = [
    // path.join(__dirname, "..", "..", 'client', "dist")
  ];

  /**
   * The constructor creates usable defaults for the MikroRest instance. Modify as needed with options 
   * @param options Optional configuration for the MikroRest instance.
   * 
   */
  public constructor(options?: MikroRestOptions) {
    this.port = options?.port || parseInt(process.env.PORT || '3339');
    if (options) {
      this.allowedOrigins = options.allowedOrigins || this.allowedOrigins;
      this.allowedHeadersDevel = options.allowedHeadersDevel || this.allowedHeadersDevel;
      this.allowedMethodsDevel = options.allowedMethodsDevel || this.allowedMethodsDevel;
      this.allowedOriginsDevel = options.allowedOriginsDevel || this.allowedOriginsDevel;
      this.allowedHeadersProd = options.allowedHeadersProd || this.allowedHeadersProd;
      this.allowedMethodsProd = options.allowedMethodsProd || this.allowedMethodsProd;
      this.allowedOriginsProd = options.allowedOriginsProd || this.allowedOriginsProd;
    }

    this.allowedOrigins = this.mode === "development" ? this.allowedOriginsDevel : this.allowedOriginsProd;
    logger.debug("Allowed origins:", this.allowedOrigins.join(", "));
  }

  /**
   * Adds a new route to the MikroRest instance.
   * @param method The HTTP method for the route
   * @param path The path for the route
   * @param handler The handler function for the route
   * @param auth Whether the route requires authentication
   * @returns 
   */
  public addRoute(method: MikroRestMethod, path: string, ...handlers: Array<MikroRestHandler>) {
    if (!method || !path || !handlers || handlers.length === 0 || !handlers[0]) {
      throw new Error("Method, path and handler are required for adding a route");
    }
    if (!path.startsWith('/')) {
      throw new Error("Path must start with '/'");
    }
    if (!method.match(/^(get|post|put|delete|options)$/i)) {
      throw new Error("Method must be one of: GET, POST, PUT, DELETE, OPTIONS");
    }
    const existingRoute: MikroRestRoute | undefined = this.routes.get(`${method.toLowerCase()}-${path.toLowerCase()}`);
    if (existingRoute) {
      existingRoute.handlers.push(...handlers); // Add handlers to existing route

    } else {
      // Add the route to the map
      // Use a unique key for the route
      this.routes.set(`${method.toLowerCase()}-${path.toLowerCase()}`, {
        method: method.toLowerCase() as MikroRestMethod,  // Ensure method is in lowercase
        path: path.toLowerCase(),
        handlers

      });
    }
    logger.debug(`Route added: ${method.toUpperCase()} ${path}`);
  
  }

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
   * Convenience function to get the URL from the request
   * @param req 
   * @returns 
   */
  public getUrl(req: IncomingMessage): URL {
    return new URL(req.url!, `http://${req.headers.host}`);
  }

  /**
   * Convenience function to get the query parameters from the request
   * @param req 
   * @returns 
   */
  public getParams(req: IncomingMessage): URLSearchParams {
    return this.getUrl(req).searchParams;
  }

  public getRoutes(): Map<string, MikroRestRoute> {
    return this.routes;
  }
  public start() {

    return createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const method = req.method?.toLowerCase() ?? "get"
      const origin = req.headers.origin ?? "";

      logger.debug('Requesting ' + req.url + ", method: " + method + ", origin: " + origin);
      // logger.debug("Headers: ", JSON.stringify(req.headers));
      if (this.allowedOrigins.includes("*") || this.allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        logger.warning(`Origin not allowed: ${origin}`);
        res.setHeader('Access-Control-Allow-Origin', '/'); // or set to a specific allowed origin
      }

      if (method === "options") {
        res.setHeader('Access-Control-Allow-Methods', process.env.NODE_ENV === "development" ? this.allowedMethodsDevel.join(', ') : this.allowedMethodsProd.join(', '));
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('Access-Control-Allow-Headers', process.env.NODE_ENV === "development" ? this.allowedHeadersDevel.join(', ') : this.allowedHeadersProd.join(', '));
        res.statusCode = 200;
        res.end();
        return;
      } else {
        const route = this.routes.get(`${method}-${this.getUrl(req).pathname.toLowerCase()}`);
        if (route) {
          try {
            for (const handler of route.handlers) {
              if (!await handler(req, res)) {
                return; // If handler returns false, stop further processing
              }
            }
            return; // If all handlers processed successfully, return
          } catch (err) {
            this.error(res, 500, serverError);
            return;
          }
        } // no route found
        this.handleFile(res, new URL(req.url!, `http://${req.headers.host}`));
      }
    }).listen(this.port, () => {
      logger.info(`Server listening on port ${this.port} in ${this.mode} mode`);
    });
  }

  public async authorize(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    function badRequest() {
      if (res) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Unauthorized");
      }
      return false;
    }
    const api_keys = process.env.API_KEYS?.split(",") || []

    const auth = req.headers.authorization
    if (auth && (auth.startsWith("Token ") || auth.startsWith("Bearer "))) {
      let key = auth.split(/\s+/)[1]
      if (api_keys.includes(key)) {
        return true
      } else {
        logger.warning("Unauthorized access with key: " + key);
        return badRequest();
      }
    } else {
      logger.warning("Unauthorized access without key: " + auth);
      return badRequest();
    }
  }
  /**
   * Send a JSON response. If body is not provided, it will send a default response with status "ok".
   * @param res 
   * @param body 
   * @param code response status code, default is 200
   */
  public sendJson(res?: ServerResponse, body?: any, code: number = 200) {
    if (res) {
      res.statusCode = code
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify(body ?? { "status": "ok" }))
    }
  }
  public sendHtml(res?: ServerResponse, body?: string, code: number = 200) {
    if (res) {
      res.statusCode = code
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.end(body ?? "")
    }
  }
  public sendPlain(res?: ServerResponse, text?: string, code: number = 200) {
    if (res) {
      res.statusCode = code
      res.setHeader("content-type", "text/plain")
      res.end(text ?? "")
    }
  }
  public sendBuffer(res?: ServerResponse, buffer?: Buffer, code: number = 200, contentType: string = "application/octet-stream") {
    if (res && buffer) {
      res.statusCode = code
      res.setHeader("Content-Type", contentType)
      res.end(buffer)
    } else {
      this.error(res, 400, badRequest)
    }
  }
  public error(res?: ServerResponse, code?: number, text?: string) {
    logger.error("Error: " + text)
    if (res) {
      res.statusCode = code ?? 500
      res.setHeader('Content-Type', 'text/plain')
      res.end(text ?? serverError);
    }
  }

  /** 
* Send raw file from client/dist/
* */
  private handleFile(res: ServerResponse, url: URL) {
    let file = url.pathname
    if (!file || file === '/' || file === '') {
      file = 'index.html'
    } else {
      if (!file.match(/^[a-z0-9A-Z\-\._\/]+$/)) {
        this.error(res, 404, notFound)
        return
      }
      if (file.indexOf("./") >= 0) {
        this.error(res, 404, notFound)
        return
      }
    }
    const fullpath = this.findFile(file);
    if (fullpath) {
      logger.info("Serving file: " + fullpath)
      this.send(res, fullpath)
    } else {
      this.error(res, 404, notFound)
    }
  }
  private findFile(filename: string): string | null {
    for (const dir of this.staticDirs) {
      const fullPath = path.join(dir, filename);
      if (existsSync(fullPath)) {
        return fullPath;
      }
    }
    return null;
  }
  /**
  * Set correct content-type header and send file.
  * @param filename file to send
  */
  private send(res: ServerResponse, filename: string) {
    try {
      //const st = fs.statSync(filename)
      logger.info("File: ", filename)
      let mime = 'text/html; charset="utf-8"'
      if (filename.endsWith('js')) {
        mime = 'text/javascript'
      } else if (filename.endsWith('css')) {
        mime = 'text/css'
      } else if (filename.endsWith('svg')) {
        mime = 'text/svg+xml'
      } else if (filename.endsWith('jpg')) {
        mime = 'image/jpeg'
      } else if (filename.endsWith('txt')) {
        mime = 'text/plain'
      } else if (filename.endsWith('pdf')) {
        mime = 'application/pdf'
      }
      res.setHeader('Content-Type', mime)
      const read = createReadStream(filename)
      read.on('end', () => {
        res.statusCode = 200
        res.end()
      })
      read.on('error', (err) => {
        logger.error("Error reading file: " + filename + ", " + err)
        this.error(res, 500, serverError)
      })
      read.pipe(res)
    } catch (err) {
      logger.error("Error sending file: " + filename + ", " + err)
      this.error(res, 500, serverError)
    }
  }


}

