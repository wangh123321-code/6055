import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';

@ApiTags('收藏')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Post('toggle/:postId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换收藏状态' })
  toggle(@Param('postId') postId: string, @Req() req: any) {
    return this.bookmarksService.toggle(req.user.userId, postId);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的收藏列表' })
  getMyBookmarks(@Req() req: any) {
    return this.bookmarksService.getMyBookmarks(req.user.userId);
  }
}
