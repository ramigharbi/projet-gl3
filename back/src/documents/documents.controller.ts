import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  ParseIntPipe,
  ForbiddenException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { UserPayload } from '../auth/interfaces/auth.interface';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new document',
    description: 'Creates a new document for the authenticated user'
  })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Document created successfully',
    schema: {
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'My Document' },
        content: { type: 'string', example: 'Document content...' },
        ownerId: { type: 'number', example: 123 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@CurrentUser() user: UserPayload, @Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto, user.userId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all user documents',
    description: 'Retrieves all documents owned by the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Documents retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: 'My Document' },
          content: { type: 'string', example: 'Document content...' },
          ownerId: { type: 'number', example: 123 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.documentsService.findAllByOwner(user.userId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific document',
    description: 'Retrieves a specific document by ID if the user owns it'
  })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document retrieved successfully',
    schema: {
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'My Document' },
        content: { type: 'string', example: 'Document content...' },
        ownerId: { type: 'number', example: 123 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - not document owner' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    const document = this.documentsService.findOne(id);
    
    // Check if user has access to this document
    if (document.ownerId !== user.userId) {
      throw new ForbiddenException('You can only access your own documents');
    }
    
    return document;
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a document',
    description: 'Updates a document if the user owns it'
  })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'number' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Document updated successfully',
    schema: {
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Updated Document' },
        content: { type: 'string', example: 'Updated content...' },
        ownerId: { type: 'number', example: 123 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - not document owner' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentUser() user: UserPayload
  ) {
    return this.documentsService.update(id, updateDocumentDto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete a document',
    description: 'Deletes a document if the user owns it'
  })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - not document owner' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    return this.documentsService.remove(id, user.userId);
  }
}
