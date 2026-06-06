import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ _id: false })
export class CoAuthor {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: false })
  confirmed: boolean;

  @Prop({ default: Date.now })
  invitedAt: Date;

  @Prop()
  confirmedAt?: Date;
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: [CoAuthor], default: [] })
  coAuthors: CoAuthor[];

  @Prop({ type: Types.ObjectId, ref: 'Collection' })
  collection?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, enum: ['work', 'apprentice', 'seeker'] })
  postType: string;

  @Prop({ enum: ['online', 'offline', 'both'] })
  teachingMode: string;

  @Prop()
  style: string;

  @Prop()
  createdAt: Date;

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ tags: 1 });
PostSchema.index({ postType: 1 });
PostSchema.index({ author: 1 });
PostSchema.index({ 'coAuthors.userId': 1 });
PostSchema.index({ collection: 1 });
