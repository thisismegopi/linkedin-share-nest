import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GenerateTokenDto } from 'src/dtos/token.dto';
import { LinkedinService } from './linkedin.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('linkedin')
export class LinkedinController {
    constructor(private readonly linkedInService: LinkedinService) {}

    @Post('accessToken')
    generateAccessToken(@Body() clientData: GenerateTokenDto) {
        return this.linkedInService.generateAccessToken(clientData.client_id, clientData.client_secret);
    }

    @Post('create-post')
    @UseInterceptors(FileInterceptor('file'))
    createLinkedInPost(@Body() createPostBody: any, @UploadedFile() file: Express.Multer.File){ // for test purpose
        // console.log(file)
        return this.linkedInService.createPost(createPostBody.postType, createPostBody.authToken, createPostBody.text, file.buffer)
    }
}
