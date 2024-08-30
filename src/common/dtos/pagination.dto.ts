import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    
    @IsOptional()
    @IsPositive()
    //Esto lo transforma en numero
    @Type( () => Number )
    limit?: number;

    @Min(0)
    @IsOptional()
    //Esto lo transforma en numero
    @Type( () => Number )
    offset?: number;
}