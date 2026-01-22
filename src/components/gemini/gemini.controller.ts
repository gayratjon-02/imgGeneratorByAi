import { Body, Controller, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiTestDto } from '../../libs/dto/gemini-test.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) { }

  @Post('test')
  async test(@Body() body: GeminiTestDto) {
    const prompt =
      body.prompt?.trim() ||
      'Generate a short creative description for a clothing product.';

    return this.geminiService.generateTest(prompt);
  }
}
