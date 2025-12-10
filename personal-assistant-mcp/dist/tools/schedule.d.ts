import { z } from 'zod';
export declare const CreateScheduleSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    start_time: z.ZodString;
    end_time: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    start_time: string;
    tags?: string[] | undefined;
    description?: string | undefined;
    end_time?: string | undefined;
    location?: string | undefined;
}, {
    title: string;
    start_time: string;
    tags?: string[] | undefined;
    description?: string | undefined;
    end_time?: string | undefined;
    location?: string | undefined;
}>;
export declare const UpdateScheduleSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    start_time: z.ZodOptional<z.ZodString>;
    end_time: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    title?: string | undefined;
    tags?: string[] | undefined;
    description?: string | undefined;
    start_time?: string | undefined;
    end_time?: string | undefined;
    location?: string | undefined;
}, {
    id: number;
    title?: string | undefined;
    tags?: string[] | undefined;
    description?: string | undefined;
    start_time?: string | undefined;
    end_time?: string | undefined;
    location?: string | undefined;
}>;
export declare const DeleteScheduleSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const ListScheduleSchema: z.ZodObject<{
    date: z.ZodOptional<z.ZodString>;
    from_date: z.ZodOptional<z.ZodString>;
    to_date: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tag?: string | undefined;
    date?: string | undefined;
    from_date?: string | undefined;
    to_date?: string | undefined;
}, {
    tag?: string | undefined;
    date?: string | undefined;
    from_date?: string | undefined;
    to_date?: string | undefined;
}>;
export interface Schedule {
    id: number;
    title: string;
    description: string;
    start_time: Date;
    end_time: Date | null;
    location: string;
    tags: string[];
    created_at: Date;
    updated_at: Date;
}
export declare function createSchedule(title: string, start_time: string, description?: string, end_time?: string, location?: string, tags?: string[]): Promise<Schedule>;
export declare function listSchedules(date?: string, from_date?: string, to_date?: string, tag?: string): Promise<Schedule[]>;
export declare function getSchedule(id: number): Promise<Schedule | undefined>;
export declare function updateSchedule(id: number, title?: string, description?: string, start_time?: string, end_time?: string, location?: string, tags?: string[]): Promise<Schedule | undefined>;
export declare function deleteSchedule(id: number): Promise<boolean>;
export declare function getTodaySchedules(): Promise<Schedule[]>;
export declare function getThisWeekSchedules(): Promise<Schedule[]>;
//# sourceMappingURL=schedule.d.ts.map