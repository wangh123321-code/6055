import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async updateProfile(id: string, updateData: Partial<UserDocument>) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password');
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findByTags(tags: string[]) {
    return this.userModel.find({ tags: { $in: tags } }).select('-password');
  }
}
