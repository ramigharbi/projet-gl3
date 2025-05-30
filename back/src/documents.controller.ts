import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

interface Document {
  id: number;
  title: string;
  content: string;
  ownerId: number;
}

let documents: Document[] = [];
let docId = 1;

@Controller('documents')
export class DocumentsController {
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() body: { title: string; content: string }) {
    const doc: Document = {
      id: docId++,
      title: body.title,
      content: body.content,
      ownerId: req.user.userId,
    };
    documents.push(doc);
    return doc;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return documents.filter(doc => doc.ownerId === req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    const doc = documents.find(d => d.id === +id);
    if (!doc || doc.ownerId !== req.user.userId) {
      throw new ForbiddenException('Not allowed');
    }
    documents = documents.filter(d => d.id !== +id);
    return { success: true };
  }
}
