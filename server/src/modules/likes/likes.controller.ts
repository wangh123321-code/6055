import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';

@ApiTags('点赞')
@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post('toggle/:postId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换点赞状态' })
  toggle(@Param('postId') postId: string, @Req() req: any) {
    return this.likesService.toggle(req.user.userId, postId);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: '获取帖子点赞数' })
  getLikeCount(@Param('postId') postId: string) {
    return this.likesService.getLikeCount(postId);
  }
}
