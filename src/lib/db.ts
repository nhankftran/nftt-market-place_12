import { Pool } from 'pg';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not defined');

const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    },
    connectionTimeoutMillis: 5000, // Timeout sau 5 giây
    idleTimeoutMillis: 30000, // Đóng kết nối idle sau 30 giây
    max: 20, // Số lượng kết nối tối đa trong pool
    min: 4, // Số lượng kết nối tối thiểu trong pool
};

let pool: Pool | null = null;

export async function connectToDb(): Promise<Pool> {
    if (pool) {
        return pool;
    }

    try {
        pool = new Pool(config);
        
        // Test kết nối
        const client = await pool.connect();
        client.release();
        
        console.log('Connected to PostgreSQL successfully');
        return pool;
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        throw error;
    }
}

export { pool }; 