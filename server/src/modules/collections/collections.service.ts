import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collection, CollectionDocument } from '../../schemas/collection.schema';
import { Post, PostDocument } from '../../schemas/post.schema';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/create-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private collectionModel: Model<CollectionDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(ownerId: string, dto: CreateCollectionDto) {
    const collection = new this.collectionModel({
      ...dto,
      owner: ownerId,
      posts: dto.posts?.map((id) => new Types.ObjectId(id)) || [],
      postCount: dto.posts?.length || 0,
    });
    await collection.save();

    if (dto.posts?.length) {
      await this.postModel.updateMany(
        { _id: { $in: dto.posts.map((id) => new Types.ObjectId(id)) } },
        { collection: collection._id },
      );
    }

    return collection.populate('owner', 'username avatar');
  }

  async findAll(query: { page?: number; limit?: number; owner?: string }) {
    const { page = 1, limit = 10, owner } = query;
    const filter: any = {};
    if (owner) filter.owner = owner;

    const skip = (page - 1) * limit;
    const [collections, total] = await Promise.all([
      this.collectionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'username avatar'),
      this.collectionModel.countDocuments(filter),
    ]);
    return { collections, total };
  }

  async findById(id: string) {
    const collection = await this.collectionModel
      .findById(id)
      .populate('owner', 'username avatar')
      .populate('posts');
    if (!collection) {
      throw new NotFoundException('合辑不存在');
    }
    return collection;
  }

  async findWithPosts(id: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const collection = await this.collectionModel
      .findById(id)
      .populate('owner', 'username avatar');
    if (!collection) {
      throw new NotFoundException('合辑不存在');
    }

    const skip = (page - 1) * limit;
    const posts = await this.postModel
      .find({ collection: new Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar role')
      .populate('coAuthors.userId', 'username avatar');

    const total = await this.postModel.countDocuments({ collection: new Types.ObjectId(id) });

    return { collection, posts, total };
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto) {
    const collection = await this.collectionModel.findById(id);
    if (!collection) {
      throw new NotFoundException('合辑不存在');
    }
    if (collection.owner.toString() !== userId) {
      throw new ForbiddenException('无权编辑他人合辑');
    }
    Object.assign(collection, dto);
    return collection.save();
  }

  async delete(id: string, userId: string) {
    const collection = await this.collectionModel.findById(id);
    if (!collection) {
      throw new NotFoundException('合辑不存在');
    }
    if (collection.owner.toString() !== userId) {
      throw new ForbiddenException('无权删除他人合辑');
    }

    await this.postModel.updateMany(
      { collection: new Types.ObjectId(id) },
      { $unset: { collection: '' } },
    );

    await this.collectionModel.deleteOne({ _id: id });
    return { message: '删除成功' };
  }

  async addPost(collectionId: string, postId: string, userId: string) {
    const collection = await this.collectionModel.findById(collectionId);
    if (!collection) {
      throw new NotFoundException('合辑不存在');
    }
    if (collection.owner.toString() !== userId) {
      throw new ForbiddenException('无权编辑他人合辑');
    }

    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    if (post.author.toString() !== userId) {
      throw new ForbiddenException('只能添加自己的帖子到合辑');
    }

    const postObjId = new Types.ObjectId(postId);
    if (!collection.posts.some((p) => p.equals(postObjId))) {
      collection.posts.push(postObjId);
      collection.postCount = collection.posts.length;
      await collection.save();
    }

    if (!post.collection || !post.collection.equals(collection._id)) {
      (post.collection as any) = collection._id;
      await post.save();
    }

    return collection;
  }

  async removePost(collectionId: string, postId: string, userId: string) {
    const collection = await this.collectionModel.findById(collectionId);
    if (!collection) {
      throw new NotFoundException('合辑不存在');
    }
    if (collection.owner.toString() !== userId) {
      throw new ForbiddenException('无权编辑他人合辑');
    }

    const postObjId = new Types.ObjectId(postId);
    collection.posts = collection.posts.filter((p) => !p.equals(postObjId));
    collection.postCount = collection.posts.length;
    await collection.save();

    await this.postModel.updateOne(
      { _id: postObjId, collection: new Types.ObjectId(collectionId) },
      { $unset: { collection: '' } },
    );

    return collection;
  }

  async findMyCollections(userId: string) {
    return this.collectionModel
      .find({ owner: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('owner', 'username avatar');
  }
}
