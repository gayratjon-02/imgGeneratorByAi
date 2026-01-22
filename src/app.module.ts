import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './components/auth/auth.module';
import { DatabaseModule } from './components/database/database.module';
import { UploadModule } from './components/upload/upload.module';
import { ProductsModule } from './components/products/products.module';
import { GeminiModule } from './components/gemini/gemini.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UploadModule,
    ProductsModule,
    GeminiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
