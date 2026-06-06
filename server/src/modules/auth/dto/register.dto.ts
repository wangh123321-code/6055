import { IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['artisan', 'learner', 'lover', 'admin'] })
  @IsIn(['artisan', 'learner', 'lover', 'admin'], { message: 'role必须为artisan、learner、lover或admin' })
  role: string;
}
