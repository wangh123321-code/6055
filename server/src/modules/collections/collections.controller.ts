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
import { CollectionsService } from './collections.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  AddPostToCollectionDto,
  RemovePostFromCollectionDto,
} from './dto/create-collection.dto';

@ApiTags('合辑')
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: '分页查询合辑列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'owner', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('owner') owner?: string,
  ) {
    return this.collectionsService.findAll({ page, limit, owner });
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的合辑列表' })
  findMyCollections(@Req() req: any) {
    return this.collectionsService.findMyCollections(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取合辑详情' })
  findById(@Param('id') id: string) {
    return this.collectionsService.findById(id);
  }

  @Get(':id/posts')
  @ApiOperation({ summary: '获取合辑内的帖子列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findWithPosts(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.collectionsService.findWithPosts(id, { page, limit });
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建合辑' })
  create(@Body() dto: CreateCollectionDto, @Req() req: any) {
    return this.collectionsService.create(req.user.userId, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新合辑' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @Req() req: any,
  ) {
    return this.collectionsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除合辑' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.collectionsService.delete(id, req.user.userId);
  }

  @Post(':id/posts')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加帖子到合辑' })
  addPost(
    @Param('id') id: string,
    @Body() dto: AddPostToCollectionDto,
    @Req() req: any,
  ) {
    return this.collectionsService.addPost(id, dto.postId, req.user.userId);
  }

  @Delete(':id/posts')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '从合辑移除帖子' })
  removePost(
    @Param('id') id: string,
    @Body() dto: RemovePostFromCollectionDto,
    @Req() req: any,
  ) {
    return this.collectionsService.removePost(id, dto.postId, req.user.userId);
  }
}
