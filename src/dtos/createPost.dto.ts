import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum PostType {
    TEXT = 'TEXT',
    ARTICLE = 'ARTICLE',
    IMAGE = 'IMAGE',
}
export class CreatePostDto {
    @IsEnum(PostType)
    @IsNotEmpty()
    postType: PostType;

    @IsString()
    @IsNotEmpty()
    authToken: string;

    @IsString()
    @IsNotEmpty()
    text: string;
}
