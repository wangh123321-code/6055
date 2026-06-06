import { IsIn, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
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
  @IsIn(['work', 'apprentice', 'seeker'], { message: 'postType必须为work、apprentice或seeker' })
  postType: string;

  @ApiPropertyOptional({ enum: ['online', 'offline', 'both'] })
  @IsOptional()
  @IsIn(['online', 'offline', 'both'], { message: 'teachingMode必须为online、offline或both' })
  teachingMode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  style: string;
}
