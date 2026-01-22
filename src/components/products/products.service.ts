import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from '../../libs/dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private productModel: Model<any>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    frontImageUrl: string,
    backImageUrl: string,
    userId: string,
  ) {
    const newProduct = new this.productModel({
      ...createProductDto,
      userId,
      frontImageUrl,
      backImageUrl,
    });

    return newProduct.save();
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments({ userId }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const product = await this.productModel.findOne({
      _id: id,
      userId,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateData: Partial<CreateProductDto>, userId: string) {
    const product = await this.productModel.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async remove(id: string, userId: string) {
    const product = await this.productModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }
}
