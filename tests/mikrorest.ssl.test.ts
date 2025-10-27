import { MikroRest } from "../src";
import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Mock the logger to avoid console output during tests
jest.mock('../src/logger', () => ({
    logger: {
        info: jest.fn(),
        debug: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
    }
}));

describe('MikroRest SSL Tests', () => {
    let mikroRest: MikroRest;
    let testPort: number;
    let keyPath: string;
    let certPath: string;

    beforeAll(() => {
        // Set test environment variables
        process.env.NODE_ENV = 'test';
        
        // Create temporary directory for SSL certificates
        const tempDir = path.join(__dirname, 'temp-ssl');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        
        keyPath = path.join(tempDir, 'test-key.pem');
        certPath = path.join(tempDir, 'test-cert.pem');
        
        // Generate self-signed certificate for testing
        try {
            // Generate private key
            execSync(`openssl genrsa -out ${keyPath} 2048`, { stdio: 'ignore' });
            
            // Generate certificate
            execSync(`openssl req -new -x509 -key ${keyPath} -out ${certPath} -days 365 -subj "/C=US/ST=Test/L=Test/O=Test/CN=localhost"`, { stdio: 'ignore' });
        } catch (error) {
            console.warn('OpenSSL not available, SSL tests will be skipped');
        }
    });

    afterAll(() => {
        // Clean up SSL certificates
        const tempDir = path.join(__dirname, 'temp-ssl');
        if (fs.existsSync(tempDir)) {
            try {
                if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
                if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
                fs.rmdirSync(tempDir);
            } catch (error) {
                // Ignore cleanup errors
            }
        }
    });

    beforeEach(() => {
        testPort = 8443 + Math.floor(Math.random() * 1000);
    });

    afterEach(async () => {
        if (mikroRest) {
            await mikroRest.stop();
            // Add delay to ensure server is fully stopped
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    });

    it('should start HTTPS server with SSL configuration', async () => {
        // Skip test if SSL certificates don't exist (OpenSSL not available)
        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            console.warn('SSL certificates not available, skipping SSL test');
            return;
        }

        mikroRest = new MikroRest({
            port: testPort,
            ssl: {
                key: keyPath,
                cert: certPath
            }
        });

        mikroRest.addRoute('get', '/ssl-test', async (req, res) => {
            mikroRest.sendJson(res, { secure: true, message: 'SSL connection successful' });
            return false;
        });

        const server = mikroRest.start();
        expect(server).toBeDefined();

        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 200));

        // Test HTTPS request
        const response = await new Promise<any>((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: testPort,
                path: '/ssl-test',
                method: 'GET',
                rejectUnauthorized: false // Accept self-signed certificate for testing
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        data: JSON.parse(data),
                        headers: res.headers
                    });
                });
            });

            req.on('error', reject);
            req.end();
        });

        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual({
            secure: true,
            message: 'SSL connection successful'
        });
        expect(response.headers['content-type']).toBe('application/json');
    });

    it('should handle SSL configuration errors gracefully', async () => {
        const invalidKeyPath = path.join(__dirname, 'non-existent-key.pem');
        const invalidCertPath = path.join(__dirname, 'non-existent-cert.pem');

        expect(() => {
            mikroRest = new MikroRest({
                port: testPort,
                ssl: {
                    key: invalidKeyPath,
                    cert: invalidCertPath
                }
            });
            mikroRest.start();
        }).toThrow();
    });

    it('should work with both HTTP and HTTPS modes', async () => {
        // Skip test if SSL certificates don't exist
        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            console.warn('SSL certificates not available, skipping SSL test');
            return;
        }

        // Test HTTP mode
        const httpMikroRest = new MikroRest({ port: testPort });
        httpMikroRest.addRoute('get', '/mode-test', async (req, res) => {
            httpMikroRest.sendJson(res, { mode: 'http' });
            return false;
        });

        const httpServer = httpMikroRest.start();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Test HTTP request
        const httpResponse = await fetch(`http://localhost:${testPort}/mode-test`);
        expect(httpResponse.status).toBe(200);
        const httpData = await httpResponse.json();
        expect(httpData).toEqual({ mode: 'http' });

        await httpMikroRest.stop();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Test HTTPS mode
        const httpsPort = testPort + 1;
        mikroRest = new MikroRest({
            port: httpsPort,
            ssl: {
                key: keyPath,
                cert: certPath
            }
        });

        mikroRest.addRoute('get', '/mode-test', async (req, res) => {
            mikroRest.sendJson(res, { mode: 'https' });
            return false;
        });

        const httpsServer = mikroRest.start();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Test HTTPS request
        const httpsResponse = await new Promise<any>((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: httpsPort,
                path: '/mode-test',
                method: 'GET',
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        data: JSON.parse(data)
                    });
                });
            });

            req.on('error', reject);
            req.end();
        });

        expect(httpsResponse.statusCode).toBe(200);
        expect(httpsResponse.data).toEqual({ mode: 'https' });
    });

    it('should handle CORS in HTTPS mode', async () => {
        // Skip test if SSL certificates don't exist
        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            console.warn('SSL certificates not available, skipping SSL test');
            return;
        }

        mikroRest = new MikroRest({
            port: testPort,
            ssl: {
                key: keyPath,
                cert: certPath
            }
        });

        mikroRest.addRoute('get', '/cors-test', async (req, res) => {
            mikroRest.sendJson(res, { cors: 'working' });
            return false;
        });

        mikroRest.start();
        await new Promise(resolve => setTimeout(resolve, 200));

        // Test OPTIONS request (CORS preflight)
        const optionsResponse = await new Promise<any>((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: testPort,
                path: '/cors-test',
                method: 'OPTIONS',
                headers: {
                    'Origin': 'https://example.com',
                    'Access-Control-Request-Method': 'GET'
                },
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers
                });
            });

            req.on('error', reject);
            req.end();
        });

        expect(optionsResponse.statusCode).toBe(200);
        expect(optionsResponse.headers['access-control-allow-origin']).toBeDefined();
        expect(optionsResponse.headers['access-control-allow-methods']).toBeDefined();
    });

    it('should authenticate over HTTPS', async () => {
        // Skip test if SSL certificates don't exist
        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            console.warn('SSL certificates not available, skipping SSL test');
            return;
        }

        process.env.MIKROREST_API_KEYS = 'test-ssl-key';

        mikroRest = new MikroRest({
            port: testPort,
            ssl: {
                key: keyPath,
                cert: certPath
            }
        });

        mikroRest.addRoute('get', '/protected-ssl', mikroRest.authorize, async (req, res) => {
            mikroRest.sendJson(res, { message: 'protected SSL content' });
            return false;
        });

        mikroRest.start();
        await new Promise(resolve => setTimeout(resolve, 200));

        // Test authenticated HTTPS request
        const response = await new Promise<any>((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: testPort,
                path: '/protected-ssl',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer test-ssl-key'
                },
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        data: JSON.parse(data)
                    });
                });
            });

            req.on('error', reject);
            req.end();
        });

        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual({
            message: 'protected SSL content'
        });
    });
});