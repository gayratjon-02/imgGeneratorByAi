import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard, RolesGuard } from '../auth/guards';
import { GetAuthMember } from '../auth/decorators';
import { ProductsService } from './products.service';
import { CreateProductDto } from '../../libs/dto/create-product.dto';
import { multerConfig } from '../upload/config/multer.config';

type MulterFile = Express.Multer.File;

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 2, multerConfig))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: MulterFile[] | undefined,
    @GetAuthMember() authMember: any,
  ) {
    if (!files || files.length !== 2) {
      throw new BadRequestException('Exactly 2 images required (front and back)');
    }

    // Files are already saved by multer, get their paths
    const frontImageUrl = `uploads/products/${files[0].filename}`;
    const backImageUrl = `uploads/products/${files[1].filename}`;

    const product = await this.productsService.create(
      createProductDto,
      frontImageUrl,
      backImageUrl,
      authMember._id,
    );

    return {
      message: 'Product created successfully',
      product,
    };
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @GetAuthMember() authMember: any,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return this.productsService.findAll(authMember._id, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetAuthMember() authMember: any) {
    return this.productsService.findOne(id, authMember._id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @GetAuthMember() authMember: any,
  ) {
    return this.productsService.update(id, updateProductDto, authMember._id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetAuthMember() authMember: any) {
    return this.productsService.remove(id, authMember._id);
  }
}
