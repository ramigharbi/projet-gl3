import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'API Information',
    description: 'Get basic information about the Google Docs Clone API'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API information retrieved successfully',
    schema: {
      properties: {
        name: { type: 'string', example: 'Google Docs Clone API' },
        version: { type: 'string', example: '1.0.0' },
        description: { type: 'string', example: 'A collaborative document editing platform' },
        documentation: { type: 'string', example: '/api-docs' },
        endpoints: { 
          type: 'object',
          properties: {
            auth: { type: 'string', example: '/auth' },
            documents: { type: 'string', example: '/documents' },
            health: { type: 'string', example: '/health' }
          }
        }
      }
    }
  })
  getHello(): object {
    return this.appService.getApiInfo();
  }
}
