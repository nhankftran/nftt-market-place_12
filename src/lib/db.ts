import sql from 'mssql';

if (!process.env.DB_USER) throw new Error('DB_USER is not defined');
if (!process.env.DB_PASSWORD) throw new Error('DB_PASSWORD is not defined');
if (!process.env.DB_SERVER) throw new Error('DB_SERVER is not defined');
if (!process.env.DB_DATABASE) throw new Error('DB_DATABASE is not defined');
if (!process.env.DB_PORT) throw new Error('DB_PORT is not defined');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool: sql.ConnectionPool | null = null;

export async function connectToDb(): Promise<sql.ConnectionPool> {
    if (pool) {
        return pool;
    }

    try {
        pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool;
    } catch (error) {
        console.error('Error connecting to SQL Server:', error);
        throw error;
    }
}

export { sql }; 