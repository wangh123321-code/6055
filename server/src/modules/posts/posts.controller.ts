import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('帖子')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: '分页查询帖子列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'postType', required: false })
  @ApiQuery({ name: 'author', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tag') tag?: string,
    @Query('postType') postType?: string,
    @Query('author') author?: string,
  ) {
    return this.postsService.findAll({ page, limit, tag, postType, author });
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门帖子排行' })
  findHot(@Query('limit') limit?: number) {
    return this.postsService.findHot(limit ? Number(limit) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取帖子详情' })
  findById(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建帖子' })
  create(@Body() dto: CreatePostDto, @Req() req: any) {
    return this.postsService.create(req.user.userId, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新帖子' })
  update(
    @Param('id') id: string,
    @Body() dto: CreatePostDto,
    @Req() req: any,
  ) {
    return this.postsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除帖子' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.postsService.delete(id, req.user.userId);
  }
}
