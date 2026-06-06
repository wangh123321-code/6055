import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Post, PostSchema } from '../schemas/post.schema';
import { Comment, CommentSchema } from '../schemas/comment.schema';
import { Like, LikeSchema } from '../schemas/like.schema';
import { Match, MatchSchema } from '../schemas/match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
