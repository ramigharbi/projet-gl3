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
  HttpStatus,
  BadRequestException,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { UserPayload } from '../auth/interfaces/auth.interface';
import { UsersService } from 'src/auth/users.service';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService,
    private readonly usersService: UsersService
  ) { }

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
    }})
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@CurrentUser() user: UserPayload, @Body() createDocumentDto: CreateDocumentDto) {
    try {
      return this.documentsService.create(createDocumentDto, user.userId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          message: 'Invalid input data',
          details: error.getResponse(),
        });
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all documents for the authenticated user',
    description: 'Retrieves all documents where the user is an owner, viewer, or editor',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.documentsService.findByUser(user.userId);
  }

  @Get('user')
  @ApiOperation({
    summary: 'Get documents for the current user',
    description: 'Retrieves all documents where the user is an owner, viewer, or editor',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDocumentsForUser(@CurrentUser() user: UserPayload) {
    return this.documentsService.findByUser(user.userId);
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
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    const document = await this.documentsService.findOne(id);
    if (document.ownerId !== user.userId) {
      throw new ForbiddenException('You can only update your own documents');
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
        updatedAt: { type: 'string', format: 'date-time' },
      },
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
    }})
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied - not document owner' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    return this.documentsService.remove(id, user.userId);
  }

  @Post('invite')
  @ApiOperation({
    summary: 'Send an invite to a user for collaboration',
    description: 'Sends an invitation to a user to collaborate on a document'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'number', example: 1 },
        userId: { type: 'number', example: 456 },
        accessLevel: { type: 'string', enum: ['editor', 'viewer'], example: 'editor' }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Invite sent successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Invite sent successfully' },
      },
    },
  })
  async inviteUser(@Body() inviteDto: { documentId: number; userId: number; accessLevel: 'editor' | 'viewer' }) {
    const { documentId, userId, accessLevel } = inviteDto;
    await this.documentsService.sendInvite(documentId, userId, accessLevel);
    return { message: 'Invite sent successfully' };
  }

  @Post('users')
  @ApiOperation({
    summary: 'Get users with access to a document',
    description: 'Returns the list of users (owner, editors, viewers) for a given documentId.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'number', example: 1 }
      },
      required: ['documentId']
    },
  })
  @ApiResponse({
    status: 200,
    description: 'List of users with access to the document',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          access: { type: 'string', enum: ['owner', 'editor', 'viewer'], example: 'editor' },
          isOwner: { type: 'boolean', example: false }
        }
      }
    }
  })
  async getSharedUsers(@Body('documentId') documentId: number) {
    return this.documentsService.getSharedUsers(documentId);
  }
}
//