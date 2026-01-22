import { IsString, IsOptional } from 'class-validator';

export class GeminiTestDto {
  @IsString()
  @IsOptional()
  prompt?: string;
}
