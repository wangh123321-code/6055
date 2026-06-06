import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Match, MatchDocument } from '../../schemas/match.schema';
import { Post, PostDocument } from '../../schemas/post.schema';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class MatchingService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Cron('0 2 * * 1')
  async handleCron() {
    await this.runMatching();
  }

  async runMatching() {
    const apprenticePosts = await this.postModel
      .find({ postType: 'apprentice' })
      .populate('author');
    const seekerPosts = await this.postModel
      .find({ postType: 'seeker' })
      .populate('author');

    const allMatches: any[] = [];

    for (const aPost of apprenticePosts) {
      const artisan = aPost.author as any;
      if (!artisan || !artisan._id) continue;

      for (const sPost of seekerPosts) {
        const learner = sPost.author as any;
        if (!learner || !learner._id) continue;

        const existingNotSuitable = await this.matchModel.findOne({
          artisan: artisan._id,
          learner: learner._id,
          status: 'not_suitable',
        });
        if (existingNotSuitable) continue;

        const tagSimilarity = this.cosineSimilarity(
          artisan.tags || [],
          learner.tags || [],
        );

        let geoBonus = 0;
        if (
          artisan.location &&
          artisan.location.coordinates &&
          artisan.location.coordinates[0] !== 0 &&
          artisan.location.coordinates[1] !== 0 &&
          learner.location &&
          learner.location.coordinates &&
          learner.location.coordinates[0] !== 0 &&
          learner.location.coordinates[1] !== 0
        ) {
          const nearbyUsers = await this.userModel.find({
            _id: learner._id,
            location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: artisan.location.coordinates,
                },
                $maxDistance: 200000,
              },
            },
          });
          if (nearbyUsers.length > 0) {
            geoBonus = 1;
          }
        }

        const score = tagSimilarity * 0.7 + geoBonus * 0.3;

        allMatches.push({
          artisan: artisan._id,
          learner: learner._id,
          score,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    allMatches.sort((a, b) => b.score - a.score);
    const topMatches = allMatches.slice(0, 10);

    for (const matchData of topMatches) {
      await this.matchModel.findOneAndUpdate(
        {
          artisan: matchData.artisan,
          learner: matchData.learner,
          status: { $ne: 'not_suitable' },
        },
        {
          $set: {
            score: matchData.score,
            status: 'pending',
            expiresAt: matchData.expiresAt,
          },
        },
        { upsert: true, new: true },
      );
    }

    return { matched: topMatches.length };
  }

  private cosineSimilarity(tagsA: string[], tagsB: string[]): number {
    const allTags = [...new Set([...tagsA, ...tagsB])];
    if (allTags.length === 0) return 0;

    const vecA = allTags.map((tag) => (tagsA.includes(tag) ? 1 : 0));
    const vecB = allTags.map((tag) => (tagsB.includes(tag) ? 1 : 0));

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < allTags.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;
    return dotProduct / denominator;
  }

  async getRecommendations(userId: string) {
    const now = new Date();
    return this.matchModel
      .find({
        $or: [{ artisan: userId }, { learner: userId }],
        expiresAt: { $gt: now },
      })
      .populate('artisan', 'username avatar bio tags location')
      .populate('learner', 'username avatar bio tags location')
      .sort({ score: -1 });
  }

  async submitFeedback(matchId: string, userId: string, status: string) {
    const match = await this.matchModel.findById(matchId);
    if (!match) {
      throw new NotFoundException('匹配记录不存在');
    }
    if (match.artisan.toString() !== userId && match.learner.toString() !== userId) {
      throw new ForbiddenException('无权操作该匹配记录');
    }
    match.status = status;
    return match.save();
  }
}
