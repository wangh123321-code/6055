import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackDto {
  @ApiProperty({ enum: ['interested', 'not_suitable'] })
  @IsIn(['interested', 'not_suitable'], { message: 'status必须为interested或not_suitable' })
  status: string;
}
