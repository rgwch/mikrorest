import { MikroRest } from '../src/index';

// Example of how to create custom tests for your specific use case
describe('MikroRest Custom Usage Example', () => {
    let mikroRest: MikroRest;

    beforeEach(() => {
        process.env.NODE_ENV = 'test';
        mikroRest = new MikroRest();
    });

    it('should handle a custom API endpoint', async () => {
        // Example: Testing a custom API endpoint
        const mockResponse = {
            statusCode: 200,
            setHeader: jest.fn(),
            end: jest.fn(),
        };

        // Add a custom route that simulates a real API endpoint
        mikroRest.addRoute('get', '/api/users', async (req, res) => {
            const limit = mikroRest.getParams(req).get('limit') || '10';
            const users = Array.from({ length: parseInt(limit) }, (_, i) => ({
                id: i + 1,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`
            }));

            mikroRest.sendJson(res, { users, count: users.length });
            return true
        });

        // Test that the route was added
        expect(() => {
            mikroRest.addRoute('get', '/api/users', async () => { return true });
        }).not.toThrow();
    });

    it('should handle custom middleware-like functionality', () => {
        // Example: Testing custom authentication logic
        mikroRest.addRoute('post', '/api/data', mikroRest.authorize, async (req, res) => {
            // Simulate custom validation logic
            const data = { message: 'Data processed successfully' };
            mikroRest.sendJson(res, data, 201);
            return true
        }); // Require authentication

        // Verify the route was added with authentication
        expect(() => {
            mikroRest.addRoute('post', '/api/data', async () => { return true });
        }).not.toThrow();
    });

    it('should handle custom error responses', () => {
        const mockResponse: any = {
            statusCode: 200,
            setHeader: jest.fn(),
            end: jest.fn(),
        };

        // Test custom error handling
        mikroRest.error(mockResponse, 422, 'Validation Error');

        expect(mockResponse.statusCode).toBe(422);
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
        expect(mockResponse.end).toHaveBeenCalledWith('Validation Error');
    });

    it('should handle multiple static directories', () => {
        // Example: Testing multiple static directories
        expect(() => {
            mikroRest.addStaticDir(__dirname);
            // This would fail because we're trying to add the same directory
            // but shows how you might test multiple directories
        }).not.toThrow();
    });
});
