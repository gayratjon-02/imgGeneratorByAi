import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface GeminiTextResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly apiKey: string;

  // Hozirgi working modellardan foydalanamiz:
  // - Text/multimodal: gemini-2.5-flash
  // - Image generation: gemini-2.5-flash-image (keyinchalik ishlatasiz)
  private readonly defaultTextModel = 'gemini-2.5-flash';
  private readonly apiBaseUrl = 'https://generativelanguage.googleapis.com/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Env dan key olish – ikkala variantni ham tekshirib qo'yamiz
    this.apiKey =
      process.env.GEMINI_API_KEY ||
      this.configService.get<string>('GEMINI_API_KEY') ||
      '';
  }

  onModuleInit() {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error(
        'GEMINI_API_KEY is required. Please set it in your .env file.',
      );
    }
  }

  /**
   * Oddiy test uchun – text response olamiz
   */
  async generateTest(prompt: string): Promise<any> {
    return this.generateContent(prompt, this.defaultTextModel);
  }

  /**
   * Generic text/multimodal generateContent (text output)
   */
  async generateContent(
    prompt: string,
    modelName: string = this.defaultTextModel,
  ): Promise<{
    success: boolean;
    prompt: string;
    model: string;
    response: string;
    fullResponse: any;
  }> {
    try {
      const url = `${this.apiBaseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };

      const response = await firstValueFrom(
        this.httpService.post<GeminiTextResponse>(url, requestBody, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      const result = response.data;

      const text =
        result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      return {
        success: true,
        prompt,
        model: modelName,
        response: text,
        fullResponse: result,
      };
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Unknown error';

      // Debug qilish uchun log qilib yuborsangiz bo'ladi:
      // console.error('Gemini API Error Details:', error?.response?.data || error);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Gemini API error: ${apiMessage}`,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Keyinroq product image generator uchun ishlatasiz:
   * gemini-2.5-flash-image modeli bilan image generation.
   * Hozircha skeleton qilib qo’yay.
   */
  async generateImageFromPrompt(prompt: string): Promise<any> {
    const imageModel = 'gemini-2.5-flash-image';

    try {
      const url = `${this.apiBaseUrl}/models/${imageModel}:generateContent?key=${this.apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };

      const response = await firstValueFrom(
        this.httpService.post(url, requestBody, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      const result = response.data;

      // Bu yerda odatda base64 image (`inlineData.data`) keladi.
      // Keyinchalik: bufferga aylantirasiz, filega yozasiz, URL qaytarasiz.
      return {
        success: true,
        prompt,
        model: imageModel,
        fullResponse: result,
      };
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Unknown error';

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Gemini Image API error: ${apiMessage}`,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
