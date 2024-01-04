import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AccessTokenResponse } from '../interfaces/accessToken.interface';
import { Blob } from 'buffer';
import { PostType } from '../dtos/createPost.dto';
import { ArticleOrImageShareContent, CreateShare, ShareMediaCategory, TextShareContent } from '../interfaces/share.interface';

@Injectable()
export class LinkedinService {
    constructor(private readonly httpService: HttpService) {}

    generateAccessToken = async (clientId: string, clientSecret: string): Promise<AxiosResponse<AccessTokenResponse>> => {
        const requestConfig: AxiosRequestConfig = {
            url: 'https://www.linkedin.com/oauth/v2/accessToken',
            method: 'POST',
            headers: {
                'X-Restli-Protocol-Version': '2.0.0',
            },
            params: {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            },
        };
        return await this.httpService.axiosRef.request(requestConfig);
    };

    getUserId = async (authToken: string): Promise<string> => {
        const requestConfig: AxiosRequestConfig = {
            url: 'https://api.linkedin.com/v2/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
        };
        return (await this.httpService.axiosRef.request(requestConfig)).data.id;
    };

    registerUpload = async (authToken: string, personUri: string) => {

        const requestConfig: AxiosRequestConfig = {
            url: 'https://api.linkedin.com/v2/assets?action=registerUpload',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
            data: {
                registerUploadRequest: {
                    recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                    owner: `urn:li:person:${personUri}`,
                    serviceRelationships: [
                        {
                            relationshipType: 'OWNER',
                            identifier: 'urn:li:userGeneratedContent',
                        },
                    ],
                },
            },
        };
        const response = (await this.httpService.axiosRef.request(requestConfig)).data;

        return {
            uploadUrl: response.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl as string,
            asset: response.value.asset as string,
        };
    };

    uploadImage = async (authToken: string, uploadUrl: string, file: Buffer) => {
        const formData = new FormData();
        formData.append('file', new Blob([file]));
        const requestConfig: AxiosRequestConfig<typeof formData> = {
            url: uploadUrl,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
            data: formData,
        };
        return await this.httpService.axiosRef.request(requestConfig);
    };

    createPost = async (postType: PostType, authToken: string, text: string, file?:Buffer) => {
        try {
            const requestConfig: AxiosRequestConfig = {
                url: 'https://api.linkedin.com/v2/ugcPosts',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Connection': 'Keep-Alive'
                },
            };

            const authorId = await this.getUserId(authToken);
            let data: CreateShare<TextShareContent | ArticleOrImageShareContent>; 
            if (postType === PostType.TEXT) {
                data = {
                    author: `urn:li:person:${authorId}`,
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareMediaCategory: ShareMediaCategory.NONE,
                            shareCommentary: {
                                text,
                            },
                        },
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                    },
                }
            }else if (postType === PostType.ARTICLE) {
                data = {
                    author: `urn:li:person:${authorId}`,
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareMediaCategory: ShareMediaCategory.ARTICLE,
                            shareCommentary: {
                                text: `${text} ${new Date()}`,
                            },
                            media: [{ status: 'READY', originalUrl: 'https://google.com' }],
                        },
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                    },
                }
            }else if(postType === PostType.IMAGE && file){

                const registerUpload = await this.registerUpload(authToken, authorId);

                const response = await this.uploadImage(authToken, registerUpload.uploadUrl, file);

                if(response.status !== 201){
                    throw new Error('File upload failed')
                }

                data = {
                    author: `urn:li:person:${authorId}`,
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareMediaCategory: ShareMediaCategory.IMAGE,
                            shareCommentary: {
                                text,
                            },
                            media: [{ status: 'READY', media: registerUpload.asset }],
                        },
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
                    },
                }
            }
            const createPostRes = await this.httpService.axiosRef.request({...requestConfig, data});
            if(createPostRes.status === 201){
                return 'Post Created'
            }else{
                throw new Error("Failed to create post");
            }
        } catch (error) {
            throw new HttpException(error.response.data, error.response.status);
        }
    };
}
