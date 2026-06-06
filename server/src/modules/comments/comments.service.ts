import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../schemas/comment.schema';
import { Post, PostDocument } from '../../schemas/post.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async findByPost(postId: string) {
    return this.commentModel
      .find({ post: postId })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar');
  }

  async create(userId: string, postId: string, content: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    const comment = new this.commentModel({
      author: userId,
      post: postId,
      content,
    });
    const saved = await comment.save();
    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });
    return saved;
  }

  async delete(id: string, userId: string) {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }
    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('无权删除他人评论');
    }
    await this.commentModel.deleteOne({ _id: id });
    await this.postModel.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -1 },
    });
    return { message: '删除成功' };
  }
}
