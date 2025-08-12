import { MikroRest } from '../src/index';
import { IncomingMessage, ServerResponse } from 'http';
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

describe('MikroRest Unit Tests', () => {
    let mikroRest: MikroRest;

    beforeAll(() => {
        // Set test environment variables
        process.env.NODE_ENV = 'test';
        process.env.API_KEYS = 'test-key-1,test-key-2';
    });

    beforeEach(() => {
        mikroRest = new MikroRest();
    });

    describe('Constructor', () => {
        it('should initialize with default routes', () => {
            expect(mikroRest).toBeInstanceOf(MikroRest);
        });
    });

    describe('addRoute', () => {
        it('should add a new route successfully', () => {
            const handler = jest.fn();
            expect(() => {
                mikroRest.addRoute('get', '/test', handler);
            }).not.toThrow();
        });

        it('should add multiple routes successfully', () => {
            const handler = jest.fn();
            expect(() => {
                mikroRest.addRoute('get', '/test1', handler);
                mikroRest.addRoute('post', '/test2', handler);
                mikroRest.addRoute('put', '/test3', handler);
                mikroRest.addRoute('delete', '/test4', handler);
            }).not.toThrow();
        });

        it('should throw error for invalid method', () => {
            const handler = jest.fn();
            expect(() => {
                mikroRest.addRoute('invalid' as any, '/test', handler);
            }).toThrow('Method must be one of: GET, POST, PUT, DELETE, OPTIONS');
        });

        it('should throw error for path not starting with /', () => {
            const handler = jest.fn();
            expect(() => {
                mikroRest.addRoute('get', 'test', handler);
            }).toThrow("Path must start with '/'");
        });

        it('should throw error for missing parameters', () => {
            expect(() => {
                mikroRest.addRoute(null as any, '/test', jest.fn());
            }).toThrow('Method, path and handler are required for adding a route');

            expect(() => {
                mikroRest.addRoute('get', null as any, jest.fn());
            }).toThrow('Method, path and handler are required for adding a route');

            expect(() => {
                mikroRest.addRoute('get', '/test', null as any);
            }).toThrow('Method, path and handler are required for adding a route');
        });


        it('should handle case insensitive methods and paths', () => {
            const handler = jest.fn();
            expect(() => {
                mikroRest.addRoute('GET' as any, '/TEST', handler);
                mikroRest.addRoute('Post' as any, '/Another', handler);
            }).not.toThrow();
        });
    });

    describe('Response Methods', () => {
        let mockRes: any;

        beforeEach(() => {
            mockRes = {
                statusCode: 200,
                setHeader: jest.fn(),
                end: jest.fn(),
            };
        });

        describe('sendJson', () => {
            it('should send JSON response with default status', () => {
                const body = { test: 'data' };
                mikroRest.sendJson(mockRes, body);

                expect(mockRes.statusCode).toBe(200);
                expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
                expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify(body));
            });

            it('should send JSON response with custom status', () => {
                const body = { error: 'Not found' };
                mikroRest.sendJson(mockRes, body, 404);

                expect(mockRes.statusCode).toBe(404);
                expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify(body));
            });

            it('should send default JSON when body is undefined', () => {
                mikroRest.sendJson(mockRes);

                expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify({ status: 'ok' }));
            });

            it('should handle null body', () => {
                mikroRest.sendJson(mockRes, null);

                expect(mockRes.end).toHaveBeenCalledWith(JSON.stringify({ status: 'ok' }));
            });

            it('should not send anything if response is undefined', () => {
                mikroRest.sendJson(undefined, { test: 'data' });

                // Should not throw and not call any methods
                expect(mockRes.setHeader).not.toHaveBeenCalled();
                expect(mockRes.end).not.toHaveBeenCalled();
            });
        });

        describe('sendHtml', () => {
            it('should send HTML response with default status', () => {
                const html = '<h1>Test</h1>';
                mikroRest.sendHtml(mockRes, html);

                expect(mockRes.statusCode).toBe(200);
                expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
                expect(mockRes.end).toHaveBeenCalledWith(html);
            });

            it('should send HTML response with custom status', () => {
                const html = '<h1>Test</h1>';
                mikroRest.sendHtml(mockRes, html, 201);

                expect(mockRes.statusCode).toBe(201);
                expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
                expect(mockRes.end).toHaveBeenCalledWith(html);
            });

            it('should send empty string when body is undefined', () => {
                mikroRest.sendHtml(mockRes);

                expect(mockRes.end).toHaveBeenCalledWith('');
            });
        });

        describe('sendPlain', () => {
            it('should send plain text response', () => {
                const text = 'Plain text';
                mikroRest.sendPlain(mockRes, text, 202);

                expect(mockRes.statusCode).toBe(202);
                expect(mockRes.setHeader).toHaveBeenCalledWith('content-type', 'text/plain');
                expect(mockRes.end).toHaveBeenCalledWith(text);
            });

            it('should send empty string when text is undefined', () => {
                mikroRest.sendPlain(mockRes);

                expect(mockRes.statusCode).toBe(200);
                expect(mockRes.end).toHaveBeenCalledWith('');
            });
        });

        describe('sendBuffer', () => {
            it('should send buffer response with default content type', () => {
                const buffer = Buffer.from('test buffer');
                mikroRest.sendBuffer(mockRes, buffer);

                expect(mockRes.statusCode).toBe(200);
                expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
                expect(mockRes.end).toHaveBeenCalledWith(buffer);
            });

            it('should send buffer response with custom content type', () => {
                const buffer = Buffer.from('test buffer');
                mikroRest.sendBuffer(mockRes, buffer, 203, 'application/pdf');

                expect(mockRes.statusCode).toBe(203);
                expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
                expect(mockRes.end).toHaveBeenCalledWith(buffer);
            });

            it('should send error when buffer is undefined', () => {
                mikroRest.sendBuffer(mockRes, undefined);

                expect(mockRes.statusCode).toBe(400);
                expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
                expect(mockRes.end).toHaveBeenCalledWith('Bad Request');
            });

            it('should send error when response is undefined', () => {
                const buffer = Buffer.from('test');

                // When response is undefined, the method should handle it gracefully
                // and not throw an error, but also not modify mockRes
                expect(() => {
                    mikroRest.sendBuffer(undefined, buffer);
                }).not.toThrow();

                // mockRes should not be modified when response is undefined
                expect(mockRes.statusCode).toBe(200); // Original value
            });
        });

        describe('error', () => {
            it('should send error response with custom code and message', () => {
                mikroRest.error(mockRes, 404, 'Not Found');

                expect(mockRes.statusCode).toBe(404);
                expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
                expect(mockRes.end).toHaveBeenCalledWith('Not Found');
            });

            it('should send default error response', () => {
                mikroRest.error(mockRes);

                expect(mockRes.statusCode).toBe(500);
                expect(mockRes.end).toHaveBeenCalledWith('Internal Server Error');
            });

            it('should handle undefined response object', () => {
                expect(() => {
                    mikroRest.error(undefined, 500, 'Test error');
                }).not.toThrow();
            });
        });
    });

    describe('Static File Handling', () => {
        let tempDir: string;

        beforeEach(() => {
            tempDir = path.join(__dirname, 'temp-static');

            // Create temporary directory and files for testing
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Hello, World!');
            fs.writeFileSync(path.join(tempDir, 'test.html'), '<h1>Test HTML</h1>');
        });

        afterEach(() => {
            // Clean up temporary files
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

        describe('addStaticDir', () => {
            it('should add existing directory successfully', () => {
                expect(() => {
                    mikroRest.addStaticDir(tempDir);
                }).not.toThrow();
            });

            it('should throw error for non-existent directory', () => {
                expect(() => {
                    mikroRest.addStaticDir('/non/existent/path');
                }).toThrow('Directory does not exist: /non/existent/path');
            });

            it('should throw error for empty directory path', () => {
                expect(() => {
                    mikroRest.addStaticDir('');
                }).toThrow('Directory does not exist: ');
            });

            it('should throw error for null directory path', () => {
                expect(() => {
                    mikroRest.addStaticDir(null as any);
                }).toThrow('Directory does not exist: null');
            });
        });
    });

    describe('clearRoutes', () => {
        it('should clear all routes and static directories', () => {
            const handler = jest.fn();
            mikroRest.addRoute('get', '/test', handler);

            // Add a static directory (using __dirname which should exist)
            mikroRest.addStaticDir(__dirname);

            // Clear should not throw
            expect(() => {
                mikroRest.clearRoutes();
            }).not.toThrow();

            // After clearing, we can add the same route again without warning
            expect(() => {
                mikroRest.addRoute('get', '/test', handler);
            }).not.toThrow();
        });
    });

    describe('Environment Configuration', () => {
        it('should handle development environment', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const devMikroRest = new MikroRest();
            expect(devMikroRest).toBeInstanceOf(MikroRest);

            process.env.NODE_ENV = originalEnv;
        });

        it('should handle production environment', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const prodMikroRest = new MikroRest();
            expect(prodMikroRest).toBeInstanceOf(MikroRest);

            process.env.NODE_ENV = originalEnv;
        });

        it('should handle missing NODE_ENV', () => {
            const originalEnv = process.env.NODE_ENV;
            delete process.env.NODE_ENV;

            const defaultMikroRest = new MikroRest();
            expect(defaultMikroRest).toBeInstanceOf(MikroRest);

            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('Route Authentication Configuration', () => {
        it('should add route with authentication required', () => {
            const handler = jest.fn();
            expect(() => {
                mikroRest.addRoute('get', '/protected', mikroRest.authorize, handler);
            }).not.toThrow();
        });

        it('should add route without authentication (default)', () => {
            const handler = jest.fn();
            expect(() => {
                mikroRest.addRoute('get', '/public', handler);
            }).not.toThrow();
        });

    });

    describe('Route Handler Types', () => {
        it('should accept async handlers', () => {
            const asyncHandler = async (req: IncomingMessage, res: ServerResponse) => {
                // Async handler implementation
                return true;
            };

            expect(() => {
                mikroRest.addRoute('get', '/async', asyncHandler);
            }).not.toThrow();
        });

        it('should accept sync handlers that return Promise', () => {
            const syncHandler = (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
                return Promise.resolve(true);
            };

            expect(() => {
                mikroRest.addRoute('get', '/sync-promise', syncHandler);
            }).not.toThrow();
        });
    });
});
