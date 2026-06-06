import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like, LikeDocument } from '../../schemas/like.schema';
import { Post, PostDocument } from '../../schemas/post.schema';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async toggle(userId: string, postId: string) {
    const existing = await this.likeModel.findOne({
      user: userId,
      post: postId,
    });
    if (existing) {
      await this.likeModel.deleteOne({ _id: existing._id });
      await this.postModel.findByIdAndUpdate(postId, {
        $inc: { likeCount: -1 },
      });
      return { liked: false };
    } else {
      const like = new this.likeModel({ user: userId, post: postId });
      await like.save();
      await this.postModel.findByIdAndUpdate(postId, {
        $inc: { likeCount: 1 },
      });
      return { liked: true };
    }
  }

  async getLikeCount(postId: string) {
    const count = await this.likeModel.countDocuments({ post: postId });
    return { count };
  }
}
