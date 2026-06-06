import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bookmark, BookmarkDocument } from '../../schemas/bookmark.schema';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
  ) {}

  async toggle(userId: string, postId: string) {
    const existing = await this.bookmarkModel.findOne({
      user: userId,
      post: postId,
    });
    if (existing) {
      await this.bookmarkModel.deleteOne({ _id: existing._id });
      return { bookmarked: false };
    } else {
      const bookmark = new this.bookmarkModel({ user: userId, post: postId });
      await bookmark.save();
      return { bookmarked: true };
    }
  }

  async getMyBookmarks(userId: string) {
    return this.bookmarkModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('post');
  }
}
