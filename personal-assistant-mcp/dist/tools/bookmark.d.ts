import { z } from 'zod';
export declare const CreateBookmarkSchema: z.ZodObject<{
    url: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    url: string;
    tags?: string[] | undefined;
    description?: string | undefined;
}, {
    title: string;
    url: string;
    tags?: string[] | undefined;
    description?: string | undefined;
}>;
export declare const UpdateBookmarkSchema: z.ZodObject<{
    id: z.ZodNumber;
    url: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    title?: string | undefined;
    tags?: string[] | undefined;
    description?: string | undefined;
    url?: string | undefined;
}, {
    id: number;
    title?: string | undefined;
    tags?: string[] | undefined;
    description?: string | undefined;
    url?: string | undefined;
}>;
export declare const DeleteBookmarkSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const SearchBookmarkSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    query?: string | undefined;
    tag?: string | undefined;
}, {
    query?: string | undefined;
    tag?: string | undefined;
}>;
export interface Bookmark {
    id: number;
    url: string;
    title: string;
    description: string;
    tags: string[];
    created_at: Date;
}
export declare function createBookmark(url: string, title: string, description?: string, tags?: string[]): Promise<Bookmark>;
export declare function listBookmarks(searchQuery?: string, tag?: string): Promise<Bookmark[]>;
export declare function getBookmark(id: number): Promise<Bookmark | undefined>;
export declare function updateBookmark(id: number, url?: string, title?: string, description?: string, tags?: string[]): Promise<Bookmark | undefined>;
export declare function deleteBookmark(id: number): Promise<boolean>;
export declare function getBookmarkCount(): Promise<number>;
//# sourceMappingURL=bookmark.d.ts.map