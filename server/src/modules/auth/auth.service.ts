import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../schemas/user.schema';
import { Post, PostDocument } from '../../schemas/post.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      ...dto,
      password: hashedPassword,
    });
    const saved = await user.save();

    if (dto.role === 'artisan') {
      const post = new this.postModel({
        author: saved._id,
        title: `${saved.username}招纳学徒`,
        content: '本人热爱剪纸艺术，现招纳有志于学习剪纸的学徒。欢迎对剪纸感兴趣的朋友联系我，共同传承传统技艺。',
        tags: saved.tags || [],
        postType: 'apprentice',
        teachingMode: 'both',
      });
      await post.save();
    } else if (dto.role === 'learner') {
      const post = new this.postModel({
        author: saved._id,
        title: '诚心求师学习剪纸',
        content: '本人热爱剪纸艺术，希望能够拜一位剪纸大师为师，系统学习剪纸技艺。有耐心，能吃苦，真心热爱传统文化。',
        tags: saved.tags || [],
        postType: 'seeker',
      });
      await post.save();
    }

    const token = this.jwtService.sign({ userId: saved._id });
    return { token, user: { _id: saved._id, username: saved.username, role: saved.role } };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ username: dto.username });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const token = this.jwtService.sign({ userId: user._id });
    return { token, user: { _id: user._id, username: user.username, role: user.role } };
  }
}
