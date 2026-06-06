import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackDto {
  @ApiProperty({ enum: ['interested', 'not_suitable'] })
  @IsEnum(['interested', 'not_suitable'])
  status: string;
}
