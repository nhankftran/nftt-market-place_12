import { NextResponse } from 'next/server';
import { connectToDb, sql } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('walletAddress');

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        const pool = await connectToDb();
        
        const result = await pool.request()
            .input('walletAddress', sql.NVarChar, walletAddress)
            .query('SELECT COUNT(*) as count FROM Users WHERE WalletAddress = @walletAddress');

        const isRegistered = result.recordset[0].count > 0;

        return NextResponse.json({ isRegistered });
    } catch (error) {
        console.error('Error checking user status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 