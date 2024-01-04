export enum MemberNetworkVisibility {
    CONNECTIONS = 'CONNECTIONS',
    PUBLIC = 'PUBLIC',
}

export enum ShareMediaCategory {
    NONE = 'NONE',
    ARTICLE = 'ARTICLE',
    IMAGE = 'IMAGE',
}

export interface CreateShare<T> {
    author: string;
    lifecycleState: string;
    specificContent: {
        'com.linkedin.ugc.ShareContent': T;
    };
    visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': string;
    };
}

export interface TextShareContent {
    shareCommentary: {
        text: string;
    };
    shareMediaCategory: ShareMediaCategory;
}

export interface ArticleOrImageShareContent {
    shareCommentary: {
        text: string;
    };
    shareMediaCategory: ShareMediaCategory;
    media: ShareMedia[];
}

interface ShareMedia {
    status: string;
    description?: {
        text: string;
    };
    media?: string;
    originalUrl?: string;
    title?: {
        text: string;
    };
}
