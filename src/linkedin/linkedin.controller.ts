import { Body, Controller, Post } from '@nestjs/common';
import { GenerateTokenDto } from 'src/dtos/token.dto';
import { LinkedinService } from './linkedin.service';

@Controller('linkedin')
export class LinkedinController {

    constructor(private readonly linkedInService: LinkedinService){}

    @Post('accessToken')
    generateAccessToken(@Body() clientData: GenerateTokenDto){
        return this.linkedInService.generateAccessToken(clientData.client_id, clientData.client_secret);
    }
}
