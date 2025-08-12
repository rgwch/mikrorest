# MicroRest Test Suite

This directory contains comprehensive tests for the MicroRest class, covering both unit and integration testing scenarios.

## Test Structure

### Unit Tests (`microrest.unit.test.ts`)
Comprehensive unit tests that test individual methods and functionality in isolation:

- **Constructor**: Tests initialization and default routes
- **Route Management**: Tests for `addRoute()`, route validation, and error handling
- **Response Methods**: Tests for all response methods (`sendJson`, `sendHtml`, `sendPlain`, `sendBuffer`, `error`)
- **Static File Handling**: Tests for `addStaticDir()` and directory validation
- **Route Management**: Tests for `clearRoutes()`
- **Environment Configuration**: Tests for different NODE_ENV settings
- **Authentication Configuration**: Tests for protected and public routes
- **Handler Types**: Tests for async and sync route handlers

### Integration Tests (`microrest.integration.test.ts`)
End-to-end tests that test the HTTP server functionality:

- **Basic Server Operations**: Server start, basic request handling
- **HTTP Methods**: GET, POST, OPTIONS (CORS) handling
- **Route Handling**: Custom routes, query parameters
- **Authentication**: Protected route access (basic validation)
- **Static File Serving**: File serving with correct content types
- **Error Handling**: Route handler error management

## Coverage

Current test coverage:
- **Overall**: 73.07% statement coverage
- **MicroRest class**: 86.36% statement coverage
- **Functions**: 94.73% function coverage

Areas not covered include some error handling edge cases and the logger module (which is mocked in tests).

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest tests/microrest.unit.test.ts
npx jest tests/microrest.integration.test.ts
```

## Test Configuration

- **Jest**: Test runner with TypeScript support
- **Supertest**: HTTP assertion library for integration tests
- **Mocked Dependencies**: Logger and dotenv to isolate tests
- **Environment**: Tests run with `NODE_ENV=test`

## Test Environment Variables

The tests use these environment variables:
- `NODE_ENV=test`
- `API_KEYS=test-key-1,test-key-2`
- `PORT=3340` (for integration tests)

## Key Testing Patterns

1. **Mocking**: External dependencies (logger, dotenv) are mocked
2. **Isolation**: Each test is isolated with proper setup/teardown
3. **Error Cases**: Both success and failure scenarios are tested
4. **Edge Cases**: Null/undefined inputs, invalid parameters
5. **Integration**: Real HTTP requests test the complete flow

## File Structure

```
tests/
├── microrest.unit.test.ts      # Unit tests for individual methods
├── microrest.integration.test.ts  # End-to-end HTTP server tests
└── temp-static-integration/    # Temporary directory for file serving tests
```

## Notable Test Features

- **Authentication Testing**: Validates Bearer and Token authentication
- **CORS Testing**: Validates CORS headers and preflight requests
- **File Serving**: Tests static file serving with various content types
- **Error Handling**: Tests graceful error handling and appropriate HTTP status codes
- **Route Validation**: Tests input validation for route parameters
- **Response Methods**: Comprehensive testing of all response utilities
