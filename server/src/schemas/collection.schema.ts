import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CollectionDocument = Collection & Document;

@Schema({ timestamps: true })
export class Collection {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  cover: string;

  @Prop({ type: [Types.ObjectId], ref: 'Post', default: [] })
  posts: Types.ObjectId[];

  @Prop({ default: 0 })
  postCount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

CollectionSchema.index({ owner: 1 });
