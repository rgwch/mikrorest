/**
 * Demo micro-app for mikrorest. Launch with `npx ts-node src/demo.ts`
 * 
 */
import { MikroRest } from '.'
import path from 'path'
// for later authentication
process.env.API_KEYS = "123,topsecret"

const server = new MikroRest()

// Add a static directory. Call with: `http://localhost:3339/demo.html`
server.addStaticDir(path.join(__dirname, "..", "tests"));


// A simple route. call with: http://localhost:3339/temperature?date=2025/08/12
server.addRoute("get", "/temperature", async (req, res) => {
  const params = server.getParams(req)
  if (params.get("date") == "2025/08/12") {
    server.sendJson(res, {
      "temperature": "hot"
    })
  } else {
    server.sendJson(res, {
      "temperature": "don't know"
    })
  }
  return false
});

// A route with api-key-based authentication. Call with `curl -H "authorization: Bearer 123" http://localhost:3339/temperature-auth?date=2025/08/13`
server.addRoute("get", "/temperature-auth", server.authorize, async (req, res) => {
  const params = server.getParams(req)
  if (params.get("date") == "2025/08/13") {
    server.sendJson(res, {
      "temperature": "still hot"
    })
  } else {
    server.sendJson(res, {
      "temperature": "still don't know"
    })
  }
  return false
})

// A route with custom authentication. Call with `http://localhost:3339/temperature-auth-custom?key=topsecret&date=2025/08/14`
server.addRoute("get", "/temperature-auth-custom",
  async (req, res) => {
    const params = server.getParams(req)
    if (params.get("key") == "topsecret") {
      return true;
    } else {
      server.sendJson(res, { "Status": "Unauthorized" })
      return false
    }
  },
  async (req, res) => {
    const params = server.getParams(req)
    if (params.get("date") == "2025/08/14") {
      server.sendJson(res, {
        "temperature": "still hot"
      })
    } else {
      server.sendJson(res, {
        "temperature": "still don't know"
      })
    }

    return false
  })

// A login route. Call with `curl -X POST -d '{"username":"user","password":"password"}' http://localhost:3339/auth/login`
process.env.MIKROREST_JWT_SECRET = "supersecret"
server.handleLogin("/auth/login", async (username, password) => {
  if (username == "user" && password == "password") {
    return { "myuser": "abc123" }
  } else {
    return null
  }
})



server.start()
