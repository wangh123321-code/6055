import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ enum: ['work', 'apprentice', 'seeker'] })
  @IsEnum(['work', 'apprentice', 'seeker'])
  postType: string;

  @ApiPropertyOptional({ enum: ['online', 'offline', 'both'] })
  @IsOptional()
  @IsEnum(['online', 'offline', 'both'])
  teachingMode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  style: string;
}
