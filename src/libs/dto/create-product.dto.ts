import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  color: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  material: string;
}
