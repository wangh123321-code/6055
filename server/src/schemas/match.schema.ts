import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchDocument = Match & Document;

@Schema({ timestamps: true })
export class Match {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  artisan: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  learner: Types.ObjectId;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true, enum: ['pending', 'interested', 'not_suitable'], default: 'pending' })
  status: string;

  @Prop()
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

MatchSchema.index({ artisan: 1, learner: 1 });
MatchSchema.index({ expiresAt: 1 });
