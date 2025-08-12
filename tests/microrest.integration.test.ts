import request from 'supertest';
import { MikroRest } from '../src/index';
import { Server } from 'http';
import fs from 'fs';
import path from 'path';

// Mock the logger to avoid console output during tests
jest.mock('../src/logger', () => ({
    logger: {
        info: jest.fn(),
        debug: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
    }
}));

// Mock dotenv/config
jest.mock('dotenv/config');

// Mock console.log to prevent output during tests
global.console = {
    ...console,
    log: jest.fn(),
};

describe('MikroRest Integration Tests', () => {
    let mikroRest: MikroRest;
    let server: Server;
    let testPort: number;

    beforeAll(() => {
        // Set test environment variables
        process.env.NODE_ENV = 'test';
        process.env.API_KEYS = 'test-key-1,test-key-2';
    });

    beforeEach(() => {
        // Use dynamic port allocation for integration tests to avoid conflicts
        testPort = 4000 + Math.floor(Math.random() * 1000);
        mikroRest = new MikroRest({ port: testPort });

        // Add some test routes
        mikroRest.addRoute('get', '/test', async (req, res) => {
            mikroRest.sendJson(res, { message: 'test successful' }); return true;
        });

        mikroRest.addRoute('post', '/echo', async (req, res) => {
            mikroRest.sendJson(res, {
                path: mikroRest.getUrl(req).pathname,
                query: Object.fromEntries(mikroRest.getParams(req).entries())
            });
            return true
        });

        mikroRest.addRoute('get', '/protected', async (req, res) => {
            if (await mikroRest.authorize(req, res)) {
                mikroRest.sendJson(res, { message: 'protected content' });
            }
            return false;
        });
    });

    afterEach((done) => {
        if (server && server.listening) {
            server.close(done);
        } else {
            done();
        }
    });


    it('should handle custom routes', (done) => {
        server = mikroRest.start();

        setTimeout(() => {
            request(server)
                .get('/test')
                .expect(200)
                .expect('Content-Type', /application\/json/)
                .expect({ message: 'test successful' })
                .end(done);
        }, 100);
    });

    it('should handle POST requests with query parameters', (done) => {
        server = mikroRest.start();

        setTimeout(() => {
            request(server)
                .post('/echo?param1=value1&param2=value2')
                .expect(200)
                .expect('Content-Type', /application\/json/)
                .expect({
                    path: '/echo',
                    query: { param1: 'value1', param2: 'value2' }
                })
                .end(done);
        }, 100);
    });

    it('should handle CORS preflight requests', (done) => {
        server = mikroRest.start();

        setTimeout(() => {
            request(server)
                .options('/any-path')
                .expect(200)
                .expect('Access-Control-Allow-Methods', /GET/)
                .expect('Access-Control-Allow-Headers', /Content-Type/)
                .end(done);
        }, 100);
    });

    it('should return 404 for non-existent routes', (done) => {
        server = mikroRest.start();

        setTimeout(() => {
            request(server)
                .get('/non-existent')
                .expect(404)
                .end(done);
        }, 100);
    });

    it('should handle authentication for protected routes', (done) => {
        server = mikroRest.start();

        setTimeout(() => {
            // Test without auth - should get 401
            request(server)
                .get('/protected')
                .expect(401)
                .end(done);
        }, 100);
    });

    describe('Static File Serving', () => {
        let tempDir: string;

        beforeEach(() => {
            tempDir = path.join(__dirname, 'temp-static-integration');

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Hello, World!');
            fs.writeFileSync(path.join(tempDir, 'index.html'), '<h1>Test Page</h1>');

            mikroRest.addStaticDir(tempDir);
        });

        afterEach(() => {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

        it('should serve static files', (done) => {
            server = mikroRest.start();

            setTimeout(() => {
                request(server)
                    .get('/test.txt')
                    .expect(200)
                    .expect('Content-Type', /text\/plain/)
                    .expect('Hello, World!')
                    .end(done);
            }, 100);
        });

        it('should serve index.html for root path', (done) => {
            server = mikroRest.start();

            setTimeout(() => {
                request(server)
                    .get('/')
                    .expect(200)
                    .expect('Content-Type', /text\/html/)
                    .expect('<h1>Test Page</h1>')
                    .end(done);
            }, 100);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            mikroRest.addRoute('get', '/error', async () => {
                throw new Error('Test error');
            });
        });

        it('should handle route handler errors gracefully', (done) => {
            server = mikroRest.start();

            setTimeout(() => {
                request(server)
                    .get('/error')
                    .expect(500)
                    .expect('Internal Server Error')
                    .end(done);
            }, 100);
        });
    });
});
