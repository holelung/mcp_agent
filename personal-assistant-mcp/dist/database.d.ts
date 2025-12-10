declare const pool: import("pg").Pool;
export declare function initializeDatabase(): Promise<void>;
export declare function query<T = any>(text: string, params?: any[]): Promise<T[]>;
export declare function queryOne<T = any>(text: string, params?: any[]): Promise<T | undefined>;
export declare function queryInsert<T = any>(text: string, params?: any[]): Promise<T>;
export declare function closeDatabase(): Promise<void>;
export default pool;
//# sourceMappingURL=database.d.ts.map