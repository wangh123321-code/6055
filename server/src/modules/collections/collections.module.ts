import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { Collection, CollectionSchema } from '../../schemas/collection.schema';
import { Post, PostSchema } from '../../schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    AuthModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
