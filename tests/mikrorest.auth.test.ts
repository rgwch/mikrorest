import { MikroRest } from "../src";

describe('MikroRest Authentication Tests', () => {
    let mikroRest: MikroRest;

    const port = 9999; // Use a fixed port for testing
    beforeEach(async () => {
        process.env.NODE_ENV = 'test';
        process.env.MIKROREST_API_KEYS = 'test-key-1,test-key-2';
        process.env.MIKROREST_JWT_SECRET = 'jwt-secret';
        process.env.MIKROREST_PORT = port.toString();
        mikroRest = new MikroRest();
        mikroRest.addRoute('get', '/protected', mikroRest.authorize, async (req, res) => {
            mikroRest.sendJson(res, { message: 'protected content' });
            return false;
        });
        await mikroRest.start();
        // Small delay to ensure server is fully started
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(async () => {
        if (mikroRest) {
            await mikroRest.stop();
            // Add a small delay to ensure the server is fully stopped
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    });

    it('should return 401 for protected route without API key', async () => {
        const result = await fetch(`http://localhost:${port}/protected`);
        expect(result.status).toBe(401);
    })

    it('should return 200 for protected route with valid API key', async () => {
        const result = await fetch(`http://localhost:${port}/protected`, {
            headers: {
                'Authorization': 'Bearer test-key-1'
            }
        });
        expect(result.status).toBe(200);
        const data = await result.json();
        expect(data).toEqual({ message: 'protected content' });
    })

    it('should return 401 for protected route with invalid API key', async () => {
        const result = await fetch(`http://localhost:${port}/protected`, {
            headers: {
                'x-api-key': 'invalid-key'
            }
        });
        expect(result.status).toBe(401);
    });

    it("should reject invalid login attempts", async () => {
        mikroRest.handleLogin("/login", async (username, password) => {
            return username === 'admin' && password === 'password';
        });
        const result = await fetch(`http://localhost:${port}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: 'wrong', password: 'credentials' })
        });
        expect(result.status).toBe(401);
    })

    it("should accept valid login attempts and return JWT", async () => {
        mikroRest.handleLogin("/login", async (username, password) => {
            return username === 'admin' && password === 'password';
        });
        const result = await fetch(`http://localhost:${port}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: 'admin', password: 'password' })
        });
        expect(result.status).toBe(200);
        const data = await result.json();
        expect(data).toHaveProperty('token');
        const token = data.token;

        // Use the returned JWT to access the protected route
        const protectedResult = await fetch(`http://localhost:${port}/protected`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        expect(protectedResult.status).toBe(200);
        const protectedData = await protectedResult.json();
        expect(protectedData).toEqual({ message: 'protected content' });
    })


    it("should extend tokens", async () => {
        mikroRest.handleLogin("/login", async (username, password) => {
            return username === 'admin' && password === 'password';
        });

        // Add a small delay after adding the login route
        await new Promise(resolve => setTimeout(resolve, 50));

        const result = await fetch(`http://localhost:${port}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: 'admin', password: 'password' })
        });
        expect(result.status).toBe(200);
        const data = await result.json();
        expect(data).toHaveProperty('token');
        const token = data.token;

        // Use the returned JWT to access the protected route
        const protectedResult = await fetch(`http://localhost:${port}/protected`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        expect(protectedResult.status).toBe(200);
        const protectedData = await protectedResult.json();
        expect(protectedData).toEqual({ message: 'protected content' });

        // Extend the token
        const extendResult = await fetch(`http://localhost:${port}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({ extend: true })
        });
        expect(extendResult.status).toBe(200);
        const extendData = await extendResult.json();
        expect(extendData).toHaveProperty('token');
        const extendedToken = extendData.token;
        expect(extendedToken).not.toBe(token);

        // Use the extended JWT to access the protected route
        const protectedResult2 = await fetch(`http://localhost:${port}/protected`, {
            headers: {
                'Authorization': `Token ${extendedToken}`
            }
        });
        expect(protectedResult2.status).toBe(200);
        const protectedData2 = await protectedResult2.json();
        expect(protectedData2).toEqual({ message: 'protected content' });
    });

    it("should check JWT", () => {
        const jwt = require('jwt-simple');
        const testtoken = jwt.encode({ "foo": "bar", exp: new Date(Date.now()+10000) }, process.env.MIKROREST_JWT_SECRET)
        const decoded=MikroRest.decodeJWT(testtoken)
        expect(decoded).not.toBeNull()
        expect(decoded.foo).toEqual("bar")
    })

});
