import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cover: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  posts: string[];
}

export class UpdateCollectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cover: string;
}

export class AddPostToCollectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postId: string;
}

export class RemovePostFromCollectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postId: string;
}
