import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../../schemas/post.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const authorObjId = new Types.ObjectId(authorId);
    const coAuthors = [];
    
    if (dto.coAuthorInvites?.length) {
      const uniqueIds = [...new Set(dto.coAuthorInvites)]
        .map((id) => new Types.ObjectId(id))
        .filter((id) => !id.equals(authorObjId));
      
      const existingUsers = await this.userModel.find({ _id: { $in: uniqueIds } });
      if (existingUsers.length !== uniqueIds.length) {
        throw new BadRequestException('部分邀请的用户不存在');
      }

      for (const userId of uniqueIds) {
        coAuthors.push({
          userId,
          confirmed: false,
          invitedAt: new Date(),
        });
      }
    }

    const { coAuthorInvites, ...restDto } = dto;
    const post = new this.postModel({
      ...restDto,
      author: authorId,
      coAuthors,
    });
    return post.save();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    tag?: string;
    postType?: string;
    author?: string;
    coAuthor?: string;
    collection?: string;
  }) {
    const { page = 1, limit = 10, tag, postType, author, coAuthor, collection } = query;
    const filter: any = {};
    if (tag) filter.tags = tag;
    if (postType) filter.postType = postType;
    if (author) filter.author = author;
    if (coAuthor) filter['coAuthors.userId'] = new Types.ObjectId(coAuthor);
    if (collection) filter.collection = new Types.ObjectId(collection);

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username avatar role')
        .populate('coAuthors.userId', 'username avatar'),
      this.postModel.countDocuments(filter),
    ]);
    return { posts, total };
  }

  async findHot(limit: number = 10) {
    return this.postModel
      .find()
      .sort({ likeCount: -1 })
      .limit(limit)
      .populate('author', 'username avatar role')
      .populate('coAuthors.userId', 'username avatar');
  }

  async findById(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('author', 'username avatar role')
      .populate('coAuthors.userId', 'username avatar')
      .populate('collection', 'title cover');
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
    const isAuthor = post.author.toString() === userId;
    const isConfirmedCoAuthor = post.coAuthors.some(
      (co) => co.userId.toString() === userId && co.confirmed
    );
    if (!isAuthor && !isConfirmedCoAuthor) {
      throw new ForbiddenException('无权编辑他人帖子');
    }
    const { coAuthorInvites, ...restDto } = dto;
    Object.assign(post, restDto);
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

  async inviteCoAuthor(postId: string, authorId: string, invitedUserId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    if (post.author.toString() !== authorId) {
      throw new ForbiddenException('只有帖子作者可以邀请共同作者');
    }
    
    const invitedUserObjId = new Types.ObjectId(invitedUserId);
    if (invitedUserObjId.equals(post.author)) {
      throw new BadRequestException('不能邀请自己作为共同作者');
    }

    const existingCoAuthor = post.coAuthors.find((co) => co.userId.equals(invitedUserObjId));
    if (existingCoAuthor) {
      if (existingCoAuthor.confirmed) {
        throw new BadRequestException('该用户已经是共同作者');
      } else {
        throw new BadRequestException('已向该用户发送邀请，等待确认中');
      }
    }

    const user = await this.userModel.findById(invitedUserId);
    if (!user) {
      throw new NotFoundException('被邀请的用户不存在');
    }

    post.coAuthors.push({
      userId: invitedUserObjId,
      confirmed: false,
      invitedAt: new Date(),
    });
    await post.save();
    return { message: '邀请已发送' };
  }

  async confirmCoAuthor(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    
    const coAuthor = post.coAuthors.find((co) => co.userId.toString() === userId);
    if (!coAuthor) {
      throw new BadRequestException('您没有被邀请为该帖子的共同作者');
    }
    if (coAuthor.confirmed) {
      throw new BadRequestException('您已经确认过了');
    }

    coAuthor.confirmed = true;
    coAuthor.confirmedAt = new Date();
    await post.save();
    return { message: '已确认成为共同作者' };
  }

  async removeCoAuthor(postId: string, authorId: string, coAuthorUserId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    if (post.author.toString() !== authorId) {
      throw new ForbiddenException('只有帖子作者可以移除共同作者');
    }

    const coAuthorObjId = new Types.ObjectId(coAuthorUserId);
    post.coAuthors = post.coAuthors.filter((co) => !co.userId.equals(coAuthorObjId));
    await post.save();
    return { message: '已移除共同作者' };
  }

  async getMyInvitations(userId: string) {
    const userObjId = new Types.ObjectId(userId);
    return this.postModel
      .find({
        'coAuthors.userId': userObjId,
        'coAuthors.confirmed': false,
      })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar role');
  }
}
