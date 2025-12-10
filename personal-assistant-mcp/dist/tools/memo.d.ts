import { z } from 'zod';
export declare const CreateMemoSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    tags?: string[] | undefined;
}, {
    title: string;
    content: string;
    tags?: string[] | undefined;
}>;
export declare const UpdateMemoSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
}, {
    id: number;
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const DeleteMemoSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const SearchMemoSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    query?: string | undefined;
    tag?: string | undefined;
}, {
    query?: string | undefined;
    tag?: string | undefined;
}>;
export interface Memo {
    id: number;
    title: string;
    content: string;
    tags: string[];
    created_at: Date;
    updated_at: Date;
}
export declare function createMemo(title: string, content: string, tags?: string[]): Promise<Memo>;
export declare function listMemos(searchQuery?: string, tag?: string): Promise<Memo[]>;
export declare function getMemo(id: number): Promise<Memo | undefined>;
export declare function updateMemo(id: number, title?: string, content?: string, tags?: string[]): Promise<Memo | undefined>;
export declare function deleteMemo(id: number): Promise<boolean>;
//# sourceMappingURL=memo.d.ts.map