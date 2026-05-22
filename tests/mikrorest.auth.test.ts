import { MikroRest } from "../src";

describe('MikroRest Authentication Tests', () => {
    let mikroRest: MikroRest;

    const port = 9999; // Use a fixed port for testing
    beforeEach(async () => {
        process.env.NODE_ENV = 'test';
        process.env.MIKROREST_API_KEYS = 'test-key-1,test-key-2';
        process.env.MIKROREST_JWT_SECRET = 'jwt-secret';
        process.env.MIKROREST_PORT = port.toString();
        mikroRest = new MikroRest({ useBlocklist: true });
        mikroRest.addRoute('get', '/protected', mikroRest.authorize, async (req, res) => {
            mikroRest.sendJson(res, { message: 'protected content' });
            return false;
        });
        await mikroRest.start();
        // Small delay to ensure server is fully started
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(async () => {
        jest.useRealTimers();
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

    it("should check JWT with expiry check", () => {
        const jwt = require('jwt-simple');
        const testtoken = jwt.encode({ "foo": "bar", exp: new Date(Date.now() + 10000) }, process.env.MIKROREST_JWT_SECRET)
        const decoded = MikroRest.decodeJWT(testtoken)
        expect(decoded).not.toBeNull()
        expect(decoded.foo).toEqual("bar")
        const testtoken2 = jwt.encode({ "foo": "bar", exp: new Date(Date.now() - 10) }, process.env.MIKROREST_JWT_SECRET)
        const decoded2 = MikroRest.decodeJWT(testtoken2)
        expect(decoded2).toBeNull()

    })
    it("should check JWT without expiry check", () => {
        const jwt = require('jwt-simple');
        const testtoken = jwt.encode({ "foo": "bar", exp: new Date(Date.now() - 10000) }, process.env.MIKROREST_JWT_SECRET)
        const decoded = MikroRest.decodeJWT(testtoken, false)
        expect(decoded).not.toBeNull()
        expect(decoded.foo).toEqual("bar")
    })

    describe("blocklist behavior", () => {
        const blockedIp = "203.0.113.10";

        it("should block an IP after more than 5 invalid page requests", async () => {
            for (let i = 0; i < 6; i++) {
                const res = await fetch(`http://localhost:${port}/does-not-exist-${i}`, {
                    headers: {
                        "x-real-ip": blockedIp,
                    },
                });
                expect(res.status).toBe(404);
            }

            const blocked = await fetch(`http://localhost:${port}/does-not-exist-blocked`, {
                headers: {
                    "x-real-ip": blockedIp,
                },
            });
            expect(blocked.status).toBe(403);
            expect(await blocked.text()).toBe("Forbidden");
        });

        it("should block an IP after more than 5 invalid login attempts", async () => {
            mikroRest.handleLogin("/login", async () => null);

            for (let i = 0; i < 6; i++) {
                const res = await fetch(`http://localhost:${port}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-real-ip": blockedIp,
                    },
                    body: JSON.stringify({ username: "wrong", password: "credentials" }),
                });
                expect(res.status).toBe(401);
            }

            const blocked = await fetch(`http://localhost:${port}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-real-ip": blockedIp,
                },
                body: JSON.stringify({ username: "wrong", password: "credentials" }),
            });
            expect(blocked.status).toBe(403);
            expect(await blocked.text()).toBe("Forbidden");
        });

        it("should clear the blocklist entry after 10 minutes without new failures", async () => {
            jest.useFakeTimers();
            try {
                jest.setSystemTime(new Date("2026-04-29T12:00:00.000Z"));

                for (let i = 0; i < 6; i++) {
                    const res = await fetch(`http://localhost:${port}/expired-block-check-${i}`, {
                        headers: {
                            "x-real-ip": blockedIp,
                        },
                    });
                    expect(res.status).toBe(404);
                }

                const blocked = await fetch(`http://localhost:${port}/expired-block-check-blocked`, {
                    headers: {
                        "x-real-ip": blockedIp,
                    },
                });
                expect(blocked.status).toBe(403);

                jest.setSystemTime(new Date("2026-04-29T12:10:01.000Z"));

                const afterExpiry = await fetch(`http://localhost:${port}/expired-block-check-after-expiry`, {
                    headers: {
                        "x-real-ip": blockedIp,
                    },
                });
                expect(afterExpiry.status).toBe(404);
            } finally {
                jest.useRealTimers();
            }
        });
    });

    it("should return refreshed JWT header when sliding expiration is enabled", async () => {
        const slidingPort = port + 1;
        const slidingServer = new MikroRest({
            port: slidingPort,
            jwtSlidingExpiration: true,
            jwtSlidingThresholdMinutes: 60,
            jwtRefreshHeaderName: "X-Auth-Token"
        });

        slidingServer.addRoute('get', '/protected', slidingServer.authorize, async (req, res) => {
            slidingServer.sendJson(res, { ok: true, user: (req as any).user });
            return false;
        });

        slidingServer.handleLogin("/login", async (username, password) => {
            return username === 'admin' && password === 'password' ? { username } : null;
        });

        await slidingServer.start();
        await new Promise(resolve => setTimeout(resolve, 100));

        const loginRes = await fetch(`http://localhost:${slidingPort}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "password" })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;

        await new Promise(resolve => setTimeout(resolve, 20));

        const protectedRes = await fetch(`http://localhost:${slidingPort}/protected`, {
            headers: { Authorization: "Token " + token }
        });

        expect(protectedRes.status).toBe(200);
        const refreshed = protectedRes.headers.get("x-auth-token");
        expect(refreshed).toBeTruthy();

        const protectedRes2 = await fetch(`http://localhost:${slidingPort}/protected`, {
            headers: { Authorization: "Token " + refreshed }
        });
        expect(protectedRes2.status).toBe(200);

        await slidingServer.stop();
    });

    it("should not return refreshed JWT header when sliding expiration is disabled", async () => {
        mikroRest.handleLogin("/login", async (username, password) => {
            return username === 'admin' && password === 'password' ? { username } : null;
        });

        const loginRes = await fetch("http://localhost:9999/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "password" })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;

        const protectedRes = await fetch("http://localhost:9999/protected", {
            headers: { Authorization: "Token " + token }
        });

        expect(protectedRes.status).toBe(200);
        expect(protectedRes.headers.get("x-auth-token")).toBeNull();
    });
});
