import { MikroRest } from "../src";

describe('MikroRest Authentication Tests', () => {
    let mikroRest: MikroRest;
    const port=9999; // Use a fixed port for testing
    beforeEach(async () => {
        process.env.NODE_ENV = 'test';
        process.env.MIKROREST_API_KEYS = 'test-key-1,test-key-2';
        process.env.MIKROREST_JWT_SECRET = 'jwt-secret';
        process.env.MIKROREST_PORT = port.toString(); // Use dynamic port allocation
        mikroRest = new MikroRest();
        mikroRest.addRoute('get', '/protected', mikroRest.authorize, async (req, res) => {
            mikroRest.sendJson(res, { message: 'protected content' });
            return false;
        });
        const server = await mikroRest.start();
      });

    it('should return 401 for protected route without API key', async () => {
        const result = await fetch(`http://localhost:${port}/protected`);
        expect(result.status).toBe(401);
    })
})
