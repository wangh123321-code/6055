import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { Post, PostDocument } from '../schemas/post.schema';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { Like, LikeDocument } from '../schemas/like.schema';
import { Match, MatchDocument } from '../schemas/match.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userModel.countDocuments();
    if (userCount === 0) {
      console.log('数据库为空，开始初始化假数据...');
      await this.seedAll();
      console.log('假数据初始化完成！');
    } else {
      console.log('数据库已有数据，跳过初始化。');
    }
  }

  private async seedAll() {
    const users = await this.seedUsers();
    const posts = await this.seedPosts(users);
    await this.seedComments(users, posts);
    await this.seedLikes(users, posts);
    await this.seedMatches(users);
  }

  private async seedUsers(): Promise<UserDocument[]> {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = [
      { username: 'admin', password: hashedPassword, role: 'admin', bio: '系统管理员', tags: [], avatar: '' },
      { username: '剪纸大师张', password: hashedPassword, role: 'artisan', bio: '从事剪纸艺术30年，国家级非遗传承人', tags: ['蔚县剪纸', '染色剪纸', '套色剪纸'], avatar: '' },
      { username: '艺人李师傅', password: hashedPassword, role: 'artisan', bio: '陕北剪纸代表人物，擅长粗犷豪放的风格', tags: ['陕北剪纸', '单色剪纸', '剪纸刻纸'], avatar: '' },
      { username: '扬州王氏', password: hashedPassword, role: 'artisan', bio: '扬州剪纸世家传人，作品细腻精美', tags: ['扬州剪纸', '单色剪纸', '套色剪纸'], avatar: '' },
      { username: '佛山陈老师', password: hashedPassword, role: 'artisan', bio: '佛山剪纸传承人，擅长铜箔剪纸', tags: ['佛山剪纸', '套色剪纸', '染色剪纸'], avatar: '' },
      { username: '满族剪纸传人', password: hashedPassword, role: 'artisan', bio: '满族剪纸文化继承者', tags: ['满族剪纸', '单色剪纸', '剪纸刻纸'], avatar: '' },
      { username: '学徒小王', password: hashedPassword, role: 'learner', bio: '热爱剪纸艺术，希望能够拜师学艺', tags: ['蔚县剪纸', '染色剪纸'], avatar: '' },
      { username: '剪纸爱好者小李', password: hashedPassword, role: 'learner', bio: '自学剪纸两年，希望得到名师指点', tags: ['陕北剪纸', '单色剪纸'], avatar: '' },
      { username: '传统文化爱好者', password: hashedPassword, role: 'lover', bio: '热爱中国传统文化，收藏剪纸作品', tags: ['扬州剪纸', '套色剪纸'], avatar: '' },
      { username: '剪纸收藏家', password: hashedPassword, role: 'lover', bio: '收藏各地剪纸作品20余年', tags: ['佛山剪纸', '满族剪纸'], avatar: '' },
    ];

    const userDocs = await this.userModel.insertMany(users);
    console.log(`创建了 ${userDocs.length} 个用户`);
    return userDocs;
  }

  private async seedPosts(users: UserDocument[]): Promise<any[]> {
    const artisans = users.filter(u => u.role === 'artisan');
    const learners = users.filter(u => u.role === 'learner');

    const workPosts = [
      { title: '百鸟朝凤', content: '历时半年完成的大型剪纸作品，融合了多种剪纸技法。作品以凤凰为中心，环绕百鸟，寓意吉祥如意。', tags: ['蔚县剪纸', '套色剪纸', '染色剪纸'], images: [], postType: 'work' as const, style: '传统吉祥图案' },
      { title: '十二生肖系列', content: '十二生肖剪纸作品，每幅都融入了地方特色。采用阴阳刻结合的手法，形象生动。', tags: ['陕北剪纸', '单色剪纸', '剪纸刻纸'], images: [], postType: 'work' as const, style: '民俗系列' },
      { title: '江南水乡', content: '以扬州剪纸技法表现江南水乡的秀美风光。小桥流水，粉墙黛瓦，尽在一纸之间。', tags: ['扬州剪纸', '单色剪纸', '套色剪纸'], images: [], postType: 'work' as const, style: '风景题材' },
      { title: '龙凤呈祥', content: '传统婚庆主题剪纸作品，铜箔衬底，金碧辉煌。', tags: ['佛山剪纸', '套色剪纸'], images: [], postType: 'work' as const, style: '婚庆主题' },
      { title: '萨满神像', content: '满族传统祭祀剪纸，表现萨满文化中的神灵形象。', tags: ['满族剪纸', '单色剪纸', '剪纸刻纸'], images: [], postType: 'work' as const, style: '宗教文化' },
      { title: '花开富贵', content: '牡丹主题剪纸，层层叠染，色彩斑斓。', tags: ['蔚县剪纸', '染色剪纸'], images: [], postType: 'work' as const, style: '花卉题材' },
      { title: '连年有余', content: '鱼与莲花的组合，寓意年年有余，生活富足。', tags: ['陕北剪纸', '单色剪纸'], images: [], postType: 'work' as const, style: '吉祥图案' },
      { title: '四君子图', content: '梅兰竹菊四君子，扬州剪纸的代表作品。', tags: ['扬州剪纸', '套色剪纸'], images: [], postType: 'work' as const, style: '文人题材' },
    ];

    const apprenticePosts = [
      { title: '招纳剪纸学徒', content: '本人从事剪纸艺术30年，现招纳有志于学习剪纸的青年学徒。要求：热爱传统文化，有耐心，能吃苦。学习内容：蔚县剪纸全套技法，包括染色、套色等核心技艺。学期三年，包教包会。', tags: ['蔚县剪纸', '染色剪纸', '套色剪纸'], images: [], postType: 'apprentice' as const, teachingMode: 'both' as const, style: '' },
      { title: '陕北剪纸传承班', content: '开设陕北剪纸传承班，传授粗犷豪放的北方剪纸风格。每月一期，每期8人，名额有限。', tags: ['陕北剪纸', '单色剪纸', '剪纸刻纸'], images: [], postType: 'apprentice' as const, teachingMode: 'offline' as const, style: '' },
      { title: '扬州剪纸线上课程', content: '为满足全国各地爱好者的需求，开设扬州剪纸线上课程。每周两节课，课后一对一辅导。', tags: ['扬州剪纸', '单色剪纸', '套色剪纸'], images: [], postType: 'apprentice' as const, teachingMode: 'online' as const, style: '' },
      { title: '佛山铜箔剪纸技艺传习', content: '佛山剪纸独特的铜箔衬底技艺传习，零基础可学。线下实操为主，为期两个月。', tags: ['佛山剪纸', '套色剪纸', '染色剪纸'], images: [], postType: 'apprentice' as const, teachingMode: 'offline' as const, style: '' },
      { title: '满族剪纸文化传承', content: '满族剪纸文化及技艺传承，了解萨满文化背景，学习传统剪刻技法。', tags: ['满族剪纸', '单色剪纸', '剪纸刻纸'], images: [], postType: 'apprentice' as const, teachingMode: 'both' as const, style: '' },
    ];

    const seekerPosts = [
      { title: '诚心求师学习蔚县剪纸', content: '本人25岁，从小热爱剪纸艺术，尤其对蔚县剪纸的染色技艺情有独钟。希望能够拜一位蔚县剪纸大师为师，系统学习。有一定美术基础，能吃苦。', tags: ['蔚县剪纸', '染色剪纸'], images: [], postType: 'seeker' as const, style: '' },
      { title: '寻找陕北剪纸老师', content: '退休教师，希望在晚年学习陕北剪纸，丰富退休生活。对陕北的民俗文化很感兴趣。', tags: ['陕北剪纸', '单色剪纸'], images: [], postType: 'seeker' as const, style: '' },
      { title: '求师学习扬州剪纸', content: '大学设计专业毕业，希望将传统剪纸技艺与现代设计结合。寻求扬州剪纸老师的指导。', tags: ['扬州剪纸', '套色剪纸'], images: [], postType: 'seeker' as const, style: '' },
      { title: '想学习佛山剪纸', content: '佛山本地人，希望传承本地文化。想学习佛山独特的铜箔剪纸技艺。', tags: ['佛山剪纸', '套色剪纸'], images: [], postType: 'seeker' as const, style: '' },
      { title: '对满族剪纸感兴趣', content: '满族人，希望了解和学习本民族的剪纸文化，传承家族记忆。', tags: ['满族剪纸', '剪纸刻纸'], images: [], postType: 'seeker' as const, style: '' },
    ];

    const allPosts: any[] = [];

    workPosts.forEach((post, idx) => {
      allPosts.push({
        ...post,
        author: artisans[idx % artisans.length]._id,
        likeCount: Math.floor(Math.random() * 100) + 10,
        commentCount: Math.floor(Math.random() * 20) + 1,
      });
    });

    apprenticePosts.forEach((post, idx) => {
      allPosts.push({
        ...post,
        author: artisans[idx % artisans.length]._id,
        likeCount: Math.floor(Math.random() * 50) + 5,
        commentCount: Math.floor(Math.random() * 10),
      });
    });

    seekerPosts.forEach((post, idx) => {
      allPosts.push({
        ...post,
        author: learners[idx % learners.length]._id,
        likeCount: Math.floor(Math.random() * 30) + 2,
        commentCount: Math.floor(Math.random() * 5),
      });
    });

    const postDocs = await this.postModel.insertMany(allPosts);
    console.log(`创建了 ${postDocs.length} 篇帖子`);
    return postDocs;
  }

  private async seedComments(users: UserDocument[], posts: PostDocument[]) {
    const comments: any[] = [];
    const commentContents = [
      '作品太精美了，大师技艺高超！',
      '传统技艺需要这样的传承人，点赞！',
      '我也想学，请问还收学徒吗？',
      '色彩搭配得真好，栩栩如生。',
      '这种技艺应该让更多人知道！',
      '从小就看奶奶剪纸，看到这些作品倍感亲切。',
      '老师收我为徒吧，真心想学！',
      '这刀工，太厉害了！',
      '希望传统艺术能够代代相传。',
      '每一幅都是艺术品，收藏了。',
    ];

    posts.forEach(post => {
      const commentCount = post.commentCount || Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < commentCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        comments.push({
          post: post._id,
          author: randomUser._id,
          content: commentContents[Math.floor(Math.random() * commentContents.length)],
        });
      }
    });

    const commentDocs = await this.commentModel.insertMany(comments);
    console.log(`创建了 ${commentDocs.length} 条评论`);
  }

  private async seedLikes(users: UserDocument[], posts: PostDocument[]) {
    const likes: any[] = [];

    posts.forEach(post => {
      const likeCount = post.likeCount || Math.floor(Math.random() * 20) + 1;
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      const likedUsers = shuffledUsers.slice(0, Math.min(likeCount, users.length));
      
      likedUsers.forEach(user => {
        likes.push({
          post: post._id,
          user: user._id,
        });
      });
    });

    const likeDocs = await this.likeModel.insertMany(likes);
    console.log(`创建了 ${likeDocs.length} 个点赞`);
  }

  private async seedMatches(users: UserDocument[]) {
    const artisans = users.filter(u => u.role === 'artisan');
    const learners = users.filter(u => u.role === 'learner');
    const matches: any[] = [];

    const statuses: Array<'pending' | 'interested' | 'not_suitable'> = ['pending', 'interested', 'not_suitable'];

    artisans.forEach(artisan => {
      learners.forEach(learner => {
        if (Math.random() > 0.5) {
          matches.push({
            artisan: artisan._id,
            learner: learner._id,
            score: Math.random() * 0.5 + 0.5,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
        }
      });
    });

    const matchDocs = await this.matchModel.insertMany(matches);
    console.log(`创建了 ${matchDocs.length} 条匹配记录`);
  }
}
