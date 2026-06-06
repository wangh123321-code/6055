import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';

@ApiTags('评论')
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('post/:postId')
  @ApiOperation({ summary: '获取帖子的评论列表' })
  findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建评论' })
  create(
    @Body() body: { postId: string; content: string },
    @Req() req: any,
  ) {
    return this.commentsService.create(req.user.userId, body.postId, body.content);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.delete(id, req.user.userId);
  }
}
