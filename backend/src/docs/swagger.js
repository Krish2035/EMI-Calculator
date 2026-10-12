const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Smart EMI Calculator & Financial Engine API',
    version: '2.0.0',
    description: `
**Top 1% Tier Enterprise Architecture Backend**
- 🛡️ **Security**: bcrypt password hashing (12 rounds) & JWT tokens
- ⚖️ **Load Balancer**: Multi-worker cluster orchestration & round-robin routing
- ⚡ **Cache Layer**: Redis caching with automated TTL and invalidation
- 🗄️ **Database**: Drizzle ORM with Primary (Write) + Read Replica routing
- 🔍 **Search**: GIN full-text indexer and in-memory inverted token search
- 📬 **Queues**: BullMQ asynchronous background job workers
- 🚦 **Rate Limiting**: Dual-layer (IP-based and normalized Email-based)
    `,
    contact: {
      name: 'Smart EMI Architecture Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local / Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'user@example.com' },
          name: { type: 'string', example: 'Jane Doe' },
          avatarUrl: { type: 'string', example: 'https://lh3.googleusercontent.com/...' },
          authProvider: { type: 'string', example: 'local' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Signed in successfully!' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      CalculationInput: {
        type: 'object',
        required: ['principal', 'annualInterestRate', 'tenureMonths'],
        properties: {
          principal: { type: 'number', example: 2500000 },
          annualInterestRate: { type: 'number', example: 8.5 },
          tenureMonths: { type: 'integer', example: 240 },
          extraMonthly: { type: 'number', example: 5000 },
          lumpSumAmount: { type: 'number', example: 100000 },
          lumpSumMonth: { type: 'integer', example: 12 },
        },
      },
      SavedCalculation: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Home Loan 2026' },
          loan_type: { type: 'string', example: 'home' },
          principal: { type: 'number', example: 2500000 },
          annual_interest_rate: { type: 'number', example: 8.5 },
          tenure_months: { type: 'integer', example: 240 },
          monthly_emi: { type: 'number', example: 21696.53 },
          total_interest: { type: 'number', example: 2707167.2 },
          total_payment: { type: 'number', example: 5207167.2 },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register new user with hashed password (bcrypt)',
        tags: ['Authentication'],
        description: 'Rate-limited on both Client IP and Email. Password is automatically hashed with bcrypt (salt 12).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'investor@example.com' },
                  password: { type: 'string', minLength: 6, example: 'SuperSecure123!' },
                  name: { type: 'string', example: 'Jane Doe' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          429: { description: 'Rate limit exceeded for IP or email' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate with email & password',
        tags: ['Authentication'],
        description: 'Verifies bcrypt password hash against stored hash. Protected by dual IP & Email rate limiting.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'investor@example.com' },
                  password: { type: 'string', example: 'SuperSecure123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          401: { description: 'Invalid credentials' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/api/auth/google': {
      post: {
        summary: 'Authenticate with Firebase Google OAuth',
        tags: ['Authentication'],
        description: 'Exchanges verified Firebase Google credentials for JWT session.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', example: 'googleuser@gmail.com' },
                  name: { type: 'string', example: 'Google User' },
                  avatarUrl: { type: 'string', example: 'https://lh3.googleusercontent.com/...' },
                  googleId: { type: 'string', example: 'google-uid-12345' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Google authentication successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/calculate': {
      post: {
        summary: 'Calculate loan EMI, amortization table, and prepayment impact',
        tags: ['Calculations'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CalculationInput' } } },
        },
        responses: {
          200: { description: 'EMI computation successful' },
        },
      },
    },
    '/api/calculations': {
      get: {
        summary: 'List saved calculations (Served via Redis Cache & Read Replicas)',
        tags: ['Calculations'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Calculations list',
            headers: {
              'X-Cache': { schema: { type: 'string', example: 'HIT' } },
            },
          },
        },
      },
      post: {
        summary: 'Save loan calculation (Writes to Primary Master DB & BullMQ report queue)',
        tags: ['Calculations'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SavedCalculation' } } },
        },
        responses: {
          201: { description: 'Saved successfully' },
        },
      },
    },
    '/api/search': {
      get: {
        summary: 'Full-text GIN search & in-memory indexer',
        tags: ['Search'],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search keywords' },
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Loan type filter' },
          { name: 'min', in: 'query', schema: { type: 'number' }, description: 'Min principal' },
          { name: 'max', in: 'query', schema: { type: 'number' }, description: 'Max principal' },
        ],
        responses: {
          200: { description: 'Search results sorted by relevance' },
        },
      },
    },
    '/api/health': {
      get: {
        summary: 'System & Architecture Health Check',
        tags: ['System'],
        description: 'Returns health and status of Load Balancer, Primary DB, Read Replicas, Redis Cache, and BullMQ queues.',
        responses: {
          200: { description: 'Architecture health metrics' },
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/swagger', (req, res) => res.redirect('/api/docs'));
};

module.exports = {
  setupSwagger,
  swaggerDocument,
};
