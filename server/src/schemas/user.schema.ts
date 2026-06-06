import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['artisan', 'learner', 'lover', 'admin'], default: 'lover' })
  role: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  location: {
    type: string;
    coordinates: number[];
  };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ location: '2dsphere' });
