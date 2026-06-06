import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LikesModule } from './modules/likes/likes.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { MatchingModule } from './modules/matching/matching.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    BookmarksModule,
    MatchingModule,
    CollectionsModule,
    SeedModule,
  ],
})
export class AppModule {}
