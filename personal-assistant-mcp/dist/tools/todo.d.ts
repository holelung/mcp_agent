import { z } from 'zod';
export declare const CreateTodoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    due_date: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    tags?: string[] | undefined;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    due_date?: string | undefined;
}, {
    title: string;
    tags?: string[] | undefined;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    due_date?: string | undefined;
}>;
export declare const UpdateTodoSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    completed: z.ZodOptional<z.ZodBoolean>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    due_date: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    title?: string | undefined;
    tags?: string[] | undefined;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    due_date?: string | undefined;
    completed?: boolean | undefined;
}, {
    id: number;
    title?: string | undefined;
    tags?: string[] | undefined;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    due_date?: string | undefined;
    completed?: boolean | undefined;
}>;
export declare const DeleteTodoSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const ListTodoSchema: z.ZodObject<{
    completed: z.ZodOptional<z.ZodBoolean>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    tag: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tag?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    completed?: boolean | undefined;
}, {
    tag?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    completed?: boolean | undefined;
}>;
export interface Todo {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: string;
    due_date: string | null;
    tags: string[];
    created_at: Date;
    updated_at: Date;
}
export declare function createTodo(title: string, description?: string, priority?: string, due_date?: string, tags?: string[]): Promise<Todo>;
export declare function listTodos(completed?: boolean, priority?: string, tag?: string): Promise<Todo[]>;
export declare function getTodo(id: number): Promise<Todo | undefined>;
export declare function updateTodo(id: number, title?: string, description?: string, completed?: boolean, priority?: string, due_date?: string, tags?: string[]): Promise<Todo | undefined>;
export declare function deleteTodo(id: number): Promise<boolean>;
export declare function getTodayTodos(): Promise<Todo[]>;
export declare function getIncompleteTodoCount(): Promise<number>;
//# sourceMappingURL=todo.d.ts.map