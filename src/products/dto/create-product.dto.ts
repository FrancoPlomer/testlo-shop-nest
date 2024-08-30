import { 
    IsIn, 
    IsInt, 
    IsArray, 
    IsNumber, 
    IsString, 
    MinLength, 
    IsOptional, 
    IsPositive, 
} from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;
 
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsArray()
    @IsString({ each: true })
    sizes: string[];

    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags: string[];
}
