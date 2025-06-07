import { NextResponse } from 'next/server';
import { connectToDb, sql } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { walletAddress, name, dob, gender, maritalStatus } = body;

        // Validate required fields
        if (!walletAddress || !name || !dob || !gender || !maritalStatus) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate date format
        const dateOfBirth = new Date(dob);
        if (isNaN(dateOfBirth.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format for date of birth' },
                { status: 400 }
            );
        }

        // Convert marital status to boolean
        const isMarried = maritalStatus.toLowerCase() === 'married';

        const pool = await connectToDb();

        // Check if wallet address already exists
        const existingUser = await pool.request()
            .input('walletAddress', sql.NVarChar, walletAddress)
            .query('SELECT COUNT(*) as count FROM Users WHERE WalletAddress = @walletAddress');

        if (existingUser.recordset[0].count > 0) {
            return NextResponse.json(
                { error: 'Wallet address already registered' },
                { status: 409 }
            );
        }

        // Insert new user
        await pool.request()
            .input('walletAddress', sql.NVarChar, walletAddress)
            .input('name', sql.NVarChar, name)
            .input('dateOfBirth', sql.Date, dateOfBirth)
            .input('gender', sql.NVarChar, gender)
            .input('maritalStatus', sql.Bit, isMarried)
            .query(`
                INSERT INTO Users (WalletAddress, Name, DateOfBirth, Gender, MaritalStatus)
                VALUES (@walletAddress, @name, @dateOfBirth, @gender, @maritalStatus)
            `);

        return NextResponse.json(
            { message: 'User registered successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 