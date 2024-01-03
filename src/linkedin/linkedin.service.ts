import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { AccessTokenResponse } from 'src/interfaces/accessToken.interface';

@Injectable()
export class LinkedinService {
    constructor(private readonly httpService: HttpService){}

    generateAccessToken = async (clientId: string, clientSecret: string): Promise<AxiosResponse<AccessTokenResponse>> => {
        try {
            return await this.httpService.axiosRef.post(`https://www.linkedin.com/oauth/v2/accessToken`, undefined,{params: {grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret}})
        } catch (error) {
            throw new InternalServerErrorException(error.response.data.error_description)
        }
    };

    getUser = async (authToken:string) => {
        try {
            return await this.httpService.axiosRef.get('https://api.linkedin.com/v2/me',{headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Restli-Protocol-Version':'2.0.0'
            }})
        } catch (error) {
            throw new InternalServerErrorException(error.response.data.error_description)
        }
    }

    registerUpload = async (authToken: string, personUri: string) => {
        try {
            return this.httpService.axiosRef.post('https://api.linkedin.com/v2/assets?action=registerUpload',{body: JSON.stringify({"registerUploadRequest": {
                "owner": `urn:li:person:${personUri}`,
                "recipes": [
                    "urn:li:digitalmediaRecipe:feedshare-image"
                ],
                "serviceRelationships": [{
                    "identifier": "urn:li:userGeneratedContent",
                    "relationshipType": "OWNER"
                }],
                "supportedUploadMechanism": [
                    "SYNCHRONOUS_UPLOAD"
                ]
            }}),headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Connection': 'Keep-Alive'
            }})
        } catch (error) {
            throw new InternalServerErrorException(error.response.data.error_description)
        }
    }

    uploadImage = (authToken:string,uploadUrl:string, file: Buffer) => {
        try {
            return this.httpService.axiosRef.post(uploadUrl, {headers: {
                'Authorization': `Bearer ${authToken}`,
            }, file})
        } catch (error) {
            
        }
    }
}
