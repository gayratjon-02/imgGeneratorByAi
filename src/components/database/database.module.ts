import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import MemberSchema from '../../schemas/Member.model';
import ProductSchema from '../../schemas/Product.Model';
import AIGenerationSchema from '../../schemas/AIGeneration.model';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? process.env.MONGO_PROD || process.env.MONGO_DEV
        : process.env.MONGO_DEV || 'mongodb://localhost:27017/img-generator',
      {
        retryAttempts: 3,
        retryDelay: 3000,
        serverSelectionTimeoutMS: 5000,
      },
    ),
    MongooseModule.forFeature([
      { name: 'Member', schema: MemberSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'AIGeneration', schema: AIGenerationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
