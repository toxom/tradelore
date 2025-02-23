export interface Tag {
    id: number;
    name: string;
    selected: boolean;
    color: string;
}

export type Folders = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    order: number;
    parentId: string | null;

}

// export interface Attachment {
//     id: string;
//     file?: File;
//     // fileName: string;
//     name: string;
//     url: URL;
//     note: string;
//     created: string;
//     updated: string;
    
// }

export interface TextFile {
    type: string;
    name: string;
    content: string;
    lastModified: number;
    size: number;
}

// export interface Attachment {
//     id: string;
//     name: string;

// }