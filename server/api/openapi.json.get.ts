export default defineEventHandler(() => {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Ecom Example API',
      version: '1.0.0',
      description: 'REST API for the ecom-example portfolio project.',
    },
    servers: [{ url: '/api', description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            imageUrl: { type: 'string', nullable: true },
            children: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            price: { type: 'number' },
            discount: { type: 'integer', nullable: true },
            stock: { type: 'integer' },
            imageUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            category: { $ref: '#/components/schemas/Category' },
          },
        },
        Article: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            excerpt: { type: 'string', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            quantity: { type: 'integer' },
            product: { $ref: '#/components/schemas/Product' },
          },
        },
        PageMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer' },
            message: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
              },
            },
            '400': { description: 'Invalid input' },
            '409': { description: 'Email already in use' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Authenticated',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
              },
            },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          description: 'Requires `refresh_token` httpOnly cookie.',
          responses: {
            '200': {
              description: 'New access token',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { accessToken: { type: 'string' } },
                  },
                },
              },
            },
            '401': { description: 'Invalid or expired refresh token' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout',
          description: 'Revokes the refresh token and clears the cookie.',
          responses: {
            '200': {
              description: 'Logged out',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { success: { type: 'boolean' } },
                  },
                },
              },
            },
          },
        },
      },
      '/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Get category tree',
          responses: {
            '200': {
              description: 'Category tree',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                },
              },
            },
          },
        },
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List products',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
            {
              name: 'sort',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['price', 'createdAt', 'name'],
                default: 'createdAt',
              },
            },
            {
              name: 'order',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'sale', in: 'query', schema: { type: 'boolean' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Paginated products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                      meta: { $ref: '#/components/schemas/PageMeta' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/articles': {
        get: {
          tags: ['Articles'],
          summary: 'List published articles',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
          ],
          responses: {
            '200': {
              description: 'Paginated articles',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Article' } },
                      meta: { $ref: '#/components/schemas/PageMeta' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/articles/{slug}': {
        get: {
          tags: ['Articles'],
          summary: 'Get article by slug',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Article',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Article' } },
              },
            },
            '404': { description: 'Not found' },
          },
        },
      },
      '/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get cart items',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Cart items',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
                },
              },
            },
            '401': { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Cart'],
          summary: 'Add or update cart item',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productId'],
                  properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'integer', minimum: 1, maximum: 100, default: 1 },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Updated cart item',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/CartItem' } },
              },
            },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/cart/{id}': {
        delete: {
          tags: ['Cart'],
          summary: 'Remove cart item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Removed',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { success: { type: 'boolean' } } },
                },
              },
            },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Cart item not found' },
          },
        },
      },
    },
  }
})
