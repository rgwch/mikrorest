import { createServer, IncomingMessage, ServerResponse } from "http";
import { logger } from "./logger";
const pck = require('../package.json')
import { createReadStream } from "fs";
import path from "path";

const serverError = "Internal Server Error"
const badRequest = "Bad Request"
const notFound = "Not Found"
import { existsSync } from "fs";

/**
 * A handler function for a route. It receives the IncomingMessage and ServerResponse objects.
 * It must return a Promise that resolves to true if the next handler should be called, or false to stop processing.
 * The handler must have answered the request, if it returns false. (Otherwise, the users's browser will hang).
 */
export type MikroRestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;
/**
 * The HTTP methods supported by MikroRest
 */
export type MikroRestMethod = "get" | "post" | "put" | "delete" | "options";
/**
 * A route definition for MikroRest
 * The path must begin with /
 * The method is case-insensitive and must be one of: GET, POST, PUT, DELETE, OPTIONS
 * Handlers are called in the order given. If a handler returns true, the next handler of the chain is called, else the call is terminated.
 */
export interface MikroRestRoute {
  method: MikroRestMethod; // The HTTP method for the route
  path: string; // The path for the route
  handlers: Array<MikroRestHandler>; // The handler functions for the route
}

export type MikroRestOptions = {
  /** Port number for the server (default: 3339 or value of environment variable MIKROREST_PORT) */
  port?: number;
  /** CORS settings: Allowed headers headers in development mode (default: ['Content-Type', 'Authorization']) */
  allowedHeadersDevel?: string[];
  /** CORS settings: Allowed methods in development mode (default: ['GET', 'POST', 'OPTIONS'])  */
  allowedMethodsDevel?: string[];
  /** CORS settings: Allowed origins in development mode (default: ['*']) */
  allowedOriginsDevel?: string[];
  /** CORS settings: Allowed headers headers in production mode (default: ['Content-Type', 'Authorization']) */
  allowedHeadersProd?: string[];
  /** CORS settings: Allowed methods in production mode (default: ['GET', 'POST', 'OPTIONS'])  */
  allowedMethodsProd?: string[];
  /** CORS settings: Allowed origins in production mode (default: ['']) */
  allowedOriginsProd?: string[];
};

export class MikroRest {
  private server: any
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
  private allowedOriginsProd: string[] = ['']

  private routes: Map<string, MikroRestRoute> = new Map();

  private staticDirs: string[] = [
    // e.g. path.join(__dirname, "..", "..", 'client', "dist")
  ];
  private loginRoute = ""

  /**
   * The constructor creates practical defaults for the MikroRest instance. Modify as needed with options 
   * @param options Optional configuration for the MikroRest instance.
   * 
   */
  public constructor(options?: MikroRestOptions) {
    this.port = options?.port || parseInt(process.env.MIKROREST_PORT || '3339');
    if (options) {
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
   * If the method is called several times with the same method and path, 
   * handlers are just appended to existing.
   * @param method The HTTP method for the route (GET, POST, OPTIONS, PUT, DELETE)
   * @param path The path for the route, starting with /
   * @param handlers The handler functions for the route, If more than one handler is supplied,
     handlers are called in the order given.
   * If a handler returns true, the next handler of the chain is called, else the call is terminated
   * @throws Error if parameters are wrong
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
   * Add a directory for static files. If the method is called several times,
   * directories are searched in the sequence, they were added.
   * @param dir absolute path to the directory, e.g. path.join(__dirname, "..", "client", "dist")
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
   * @returns the URL object
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

  /**
   * Get all routes as a Map
   * @returns all routes defined so far
   */
  public getRoutes(): Map<string, MikroRestRoute> {
    return this.routes;
  }

  /**
   * Launch the server. routes and static directories can be added before or after calling this method.
   * @returns the HTTP server instance
   */
  public start() {

    this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const method = req.method?.toLowerCase() ?? "get"
      const origin = req.headers.origin ?? "";

      logger.debug('Requesting ' + req.url + ", method: " + method + ", origin: " + origin);
      // logger.debug("Headers: ", JSON.stringify(req.headers));
      if (this.allowedOrigins.includes("*") || this.allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        // logger.warning(`Origin not allowed: ${origin} serving ${req.url}`);
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
    return this.server;
  }

  /**
   * Stop the server. No requests are accepted after this method is called.
   * @returns 
   */
  public async stop() {
    if (this.server) {
      return new Promise<void>((resolve) => {
        this.server.close(() => {
          logger.info("Server stopped");
          resolve();
        });
      });
    }
  }

  /**
   * Static helper method to decode an existing JWT Token
   * @param token 
   * @returns the decoded token or null if it could not be decoded or was not valid
   */
  public static decodeJWT(token: string, jwt_secret?: string, checkExpire= true): any | null {
    try {
      const jwt = require('jwt-simple');
      if (jwt_secret) {
        const decoded = jwt.decode(token, jwt_secret);
        if (decoded && (!checkExpire || (decoded.exp && new Date(decoded.exp) > new Date()))) {
          return decoded;
        } else {
          logger.warning("JWT token expired or invalid: " + token);
          return null;
        }
      } else {
        logger.error("jwt_secret not set");
        return null;
      }
    } catch (err) {
      logger.warning("Error decoding JWT: " + err);
      return null;
    }
  }
  /**
   * Built-in authorization: Check header for Bearer or Token and a key supplied in the environment variable MIKROREST_API_KEYS,
   * or check for a valid JWT token if MIKROREST_JWT_SECRET is set.
   * To use, simply prepend server.authorize to your handler in a route definition.
   * @param req 
   * @param res 
   * @returns true if authorization succeeded.
   */
  public async authorize(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    function badRequest() {
      if (res) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'text/plain');
        res.end("Unauthorized");
      }
      return false;
    }
    const api_keys = process.env.MIKROREST_API_KEYS?.split(",") || process.env.API_KEYS?.split(",") || []

    const auth = req.headers.authorization
    if (auth && (auth.startsWith("Token ") || auth.startsWith("Bearer "))) {
      let key = auth.split(/\s+/)[1]
      if (api_keys.includes(key)) {
        return true
      } else {
        try {
          const decoded = MikroRest.decodeJWT(key, process.env.MIKROREST_JWT_SECRET);
          if (decoded) {
            (req as any).user = decoded; // attach decoded token to request object
            return true;
          } else {
            logger.warning("JWT token expired or invalid: " + key);
            return badRequest();
          }
        } catch (err) {
          logger.warning("Unauthorized access with key: " + key);
          return badRequest();
        }
      }
    } else {
      logger.warning("Unauthorized access without key: " + auth);
      return badRequest();
    }
  }

  /**
   * Let Mikrorest handle Login for you. Supply a route and function that checks username and password and returns an (arbitrary) object 
   * if they are valid or null if not.
   * it will setup a POST route at loginRoute (e.g. /login) that expects a JSON body with username and password.
   * If the credentials are valid, it will return a JWT that can be used for authorization in subsequent requests, 
   * and a user object as received from the authenticate-function.
   * The token is valid for MIKROREST_JWT_EXPIRATION minutes. You can use it in the Authorization header as "Token <token>".
   * The Login route also accepts a JSON body with { extend: true } to extend the token expiration.
   * The request must then include the existing token in the Authorization header and will receive the updated JWT as response.
   * @param loginRoute the path for the login route, e.g. /login
   * @param authenticate  an async function that checks username and password and resolves to a (User-) Object if they are valid
   */
  public handleLogin(loginRoute: string, authenticate: (username: string, password: string) => Promise<any>) {
    this.addRoute("post", loginRoute, async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const body = await this.readJsonBody(req, res);
        if (body && body.username && body.password) {
          const user = await authenticate(body.username, body.password);
          if (user) {
            const jwt = require('jwt-simple');
            const secret = process.env.MIKROREST_JWT_SECRET
            if (!secret) {
              logger.error("MIKROREST_JWT_SECRET environment variable not set");
              throw new Error("MIKROREST_JWT_SECRET environment variable not set");
            }
            // Create a token with username and expiration (e.g. 1 hour)
            const expiration = parseInt(process.env.MIKROREST_JWT_EXPIRATION || '60'); // in minutes
            const validUntil = new Date(Date.now() + expiration * 60000);
            const payload = { username: body.username, exp: validUntil };
            const token = jwt.encode(payload, secret);
            // Print the token to the console
            logger.debug(`User ${body.username} logged in, token: ${token}`);
            this.sendJson(res, { token: token, expires: validUntil, user: user });
            return false; // Stop further processing
          } else {
            this.error(res, 401, "Invalid username or password");
            return false; // Stop further processing
          }
        } else if (body.extend) {
          // Extend token
          const auth = req.headers.authorization
          if (auth && (auth.startsWith("Token ") || auth.startsWith("Bearer "))) {
            let key = auth.split(/\s+/)[1]
            try {
              const jwt = require('jwt-simple');
              const secret = process.env.MIKROREST_JWT_SECRET
              if (secret) {
                const decoded = jwt.decode(key, secret);
                if (decoded && decoded.exp && new Date(decoded.exp) > new Date()) {
                  // Create a new token with extended expiration
                  const expiration = parseInt(process.env.MIKROREST_JWT_EXPIRATION || '60'); // in minutes
                  const validUntil = new Date(Date.now() + expiration * 60000);
                  const payload = { username: decoded.username, exp: validUntil };
                  const token = jwt.encode(payload, secret);
                  logger.info(`Token for user ${decoded.username} extended, new token: ${token}`);
                  this.sendJson(res, { token: token, expires: validUntil }); // expiration in minutes
                  return false; // Stop further processing
                } else {
                  this.error(res, 401, "Token expired or invalid");
                  return false; // Stop further processing
                }
              } else {
                this.error(res, 500, "Server not configured for JWT");
                return false; // Stop further processing  
              }

            } catch (err) {
              this.error(res, 400, "Invalid JWT");
              return false; // Stop further processing
            }
          } else {
            this.error(res, 401, "Authorization header missing");
            return false; // Stop further processing  
          }
        } else {
          this.error(res, 400, "Invalid JSON body");
          return false; // Stop further processing
        }
      } catch (err) {
        this.error(res, 400, "Invalid JSON body");
        return false; // Stop further processing
      }
    });
    logger.info(`Login route added at ${loginRoute}`);

  }

  /**
   * Read the request body as JSON
   * @param req 
   * @param res 
   * @returns a JSON object
   * @throws Error if the request body is not valid JSON
   */
  public readJsonBody(req: IncomingMessage, res?: ServerResponse): Promise<any> {
    return new Promise((resolve, reject) => {
      if (req) {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        });
      } else {
        reject(new Error("No IncomingMessage object provided"));
      }
    });
  }

  /**
  * Read the request body as Buffer
  * @param req 
  * @returns a Buffer object
  * @throws Error if the request body is not valid
  */
  public readBodyBuffer(req: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (req) {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => {
          chunks.push(chunk);
        });
        req.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
      } else {
        reject(new Error("No IncomingMessage object provided"));
      }
    });
  }
  /**
   * Send a JSON response. If body is not provided, it will send a default response with {"status": "ok"}.
   * @param res 
   * @param body
   * @param headers optional headers to set (key-value pairs). Content-Type is set automatically to "application/json"
   * @param code response status code, default is 200
   */
  public sendJson(res?: ServerResponse, body?: any, code: number = 200, headers?: { [key: string]: string }) {
    if (res) {
      res.statusCode = code
      res.setHeader("Content-Type", "application/json")
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          res.setHeader(key, value)
        }
      }
      res.end(JSON.stringify(body ?? { "status": "ok" }))
    }
  }

  /**
   * Send a HTML response. If body is not provided, it will send an empty response with status 200,ok.
   * @param res 
   * @param body A html document
   * @param headers optional headers to set (key-value pairs). Content-Type is set automatically to "text/html; charset=utf-8"
   * @param code response status code, default is 200
   */
  public sendHtml(res?: ServerResponse, body?: string, code: number = 200, headers?: { [key: string]: string }) {
    if (res) {
      res.statusCode = code
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          res.setHeader(key, value)
        }
      }
      res.end(body ?? "")
    }
  }
  /**
   * Send a plaintext response. If text is not provided, it will send a an empty string with status 200,ok.
   * @param res 
   * @param text some plaintext
   * @param headers optional headers to set (key-value pairs). Content-Type is set automatically to "text/plain"
   * @param code response status code, default is 200
   */
  public sendPlain(res?: ServerResponse, text?: string, code: number = 200, headers?: { [key: string]: string }) {
    if (res) {
      res.statusCode = code
      res.setHeader("Content-Type", "text/plain")
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          res.setHeader(key, value)
        }
      }
      res.end(text ?? "")
    }
  }

  /**
    * Send a binary response. If buffer is not provided, it will send a default response with status "ok".
    * @param res 
    * @param buffer contents to send
    * @param code response status code, default is 200
    * @param headers optional headers to set (key-value pairs). Content-Type is set automatically to "application/octet-stream" if not provided
    * @throws Error if res or buffer is not provided
    */
  public sendBuffer(res?: ServerResponse, buffer?: Buffer, code: number = 200, headers?: { [key: string]: string }) {
    if (res && buffer) {
      res.statusCode = code
      res.setHeader("Content-Type", "application/octet-stream")
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          res.setHeader(key, value)
        }
      }
      res.end(buffer)
    } else {
      this.error(res, 400, badRequest)
    }
  }
  /**
   * Send an error response
   * @param res 
   * @param code code (defaults to 500)
   * @param headers optional headers to set (key-value pairs). Content-Type is set automatically to "text/plain" if not provided
   * @param text text to send, defaults to "internal server error"
   */
  public error(res?: ServerResponse, code?: number, text?: string, headers?: { [key: string]: string }) {
    logger.error("Error: " + text)
    if (res) {
      res.statusCode = code ?? 500
      res.setHeader('Content-Type', 'text/plain')
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          res.setHeader(key, value)
        }
      }
      res.end(text ?? serverError);
    }
  }

  public setMaxAge(res: ServerResponse, maxAge: number) {
    if (res) {
      res.setHeader('Cache-Control', `max-age=${maxAge}`)
    }
  }

  /** 
  * Send raw file from static dir. If more than one static dir was added, they are searched in the sequence, they were added.
  * Some sanitizing is performed: Directory traversal ands special characters are not allowed. If the file is not found,
  * 404 "not found" is sent. If a file is found, it is sent with the correct content-type header according to the file extension.
  * (known types are: js, css, svg, jpg, txt, pdf. All other files are sent as "text/html; charset=utf-8")
  **/
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
      this.setMaxAge(res, 3600)
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

