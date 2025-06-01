import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Title of the document',
    example: 'My Important Document',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Initial content of the document',
    example: 'This is the content of my document...',
  })
  @IsString()
  @IsOptional()
  content?: string;
}
