import { IsNotEmpty, IsString } from "class-validator";

export class GenerateTokenDto {
    @IsString()
    @IsNotEmpty()
    client_id: string;

    @IsString()
    @IsNotEmpty()
    client_secret: string;
}