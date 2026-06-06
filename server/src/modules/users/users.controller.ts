import { Controller, Get, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile/me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户资料' })
  getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户信息' })
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户资料' })
  updateProfile(
    @Param('id') id: string,
    @Body() updateData: any,
    @Req() req: any,
  ) {
    if (req.user.userId !== id) {
      throw new Error('无权修改他人资料');
    }
    return this.usersService.updateProfile(id, updateData);
  }
}
