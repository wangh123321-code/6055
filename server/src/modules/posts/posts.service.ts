import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../../schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const post = new this.postModel({ ...dto, author: authorId });
    return post.save();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    tag?: string;
    postType?: string;
    author?: string;
  }) {
    const { page = 1, limit = 10, tag, postType, author } = query;
    const filter: any = {};
    if (tag) filter.tags = tag;
    if (postType) filter.postType = postType;
    if (author) filter.author = author;

    const skip = (page - 1) * limit;
    const posts = await this.postModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar role');
    return posts;
  }

  async findHot(limit: number = 10) {
    return this.postModel
      .find()
      .sort({ likeCount: -1 })
      .limit(limit)
      .populate('author', 'username avatar role');
  }

  async findById(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('author', 'username avatar role');
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    return post;
  }

  async update(id: string, userId: string, dto: Partial<CreatePostDto>) {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('无权编辑他人帖子');
    }
    Object.assign(post, dto);
    return post.save();
  }

  async delete(id: string, userId: string) {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('无权删除他人帖子');
    }
    await this.postModel.deleteOne({ _id: id });
    return { message: '删除成功' };
  }
}
