import { Body, Controller, Post } from '@nestjs/common';
import { GenerateTokenDto } from 'src/dtos/token.dto';
import { LinkedinService } from './linkedin.service';

@Controller('linkedin')
export class LinkedinController {
    constructor(private readonly linkedInService: LinkedinService) {}

    @Post('accessToken')
    generateAccessToken(@Body() clientData: GenerateTokenDto) {
        return this.linkedInService.generateAccessToken(clientData.client_id, clientData.client_secret);
    }

    @Post('create-post')
    createLinkedInPost(@Body() createPostBody: any){ // for test purpose
        return this.linkedInService.createPost(createPostBody.postType, createPostBody.authToken, createPostBody.text)
    }
}
