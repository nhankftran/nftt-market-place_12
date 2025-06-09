import { Pool } from 'pg';

if (!process.env.DB_USER) throw new Error('DB_USER is not defined');
if (!process.env.DB_PASSWORD) throw new Error('DB_PASSWORD is not defined');
if (!process.env.DB_HOST) throw new Error('DB_HOST is not defined');
if (!process.env.DB_DATABASE) throw new Error('DB_DATABASE is not defined');
if (!process.env.DB_PORT) throw new Error('DB_PORT is not defined');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    }
};

let pool: Pool | null = null;

export async function connectToDb(): Promise<Pool> {
    if (pool) {
        return pool;
    }

    try {
        pool = new Pool(config);
        console.log('Connected to PostgreSQL');
        return pool;
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error);
        throw error;
    }
}

export { pool }; 