import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getApiInfo(): object {
    return {
      name: 'Google Docs Clone API',
      version: '1.0.0',
      description: 'A collaborative document editing platform with real-time features',
      documentation: '/api-docs',
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          register: 'POST /auth/register'
        },
        documents: {
          list: 'GET /documents',
          create: 'POST /documents',
          get: 'GET /documents/:id',
          update: 'PATCH /documents/:id',
          delete: 'DELETE /documents/:id'
        },
        health: 'GET /health'
      },
      features: [
        'JWT Authentication',
        'Document CRUD Operations',
        'User Permissions',
        'API Documentation',
        'Health Monitoring',
        'Rate Limiting',
        'Error Handling'
      ]
    };
  }
}
