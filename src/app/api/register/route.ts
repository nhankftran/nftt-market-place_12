import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/db';

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

        try {
            // Insert new user
            await pool.query(
                `INSERT INTO users (
                    wallet_address, 
                    name, 
                    date_of_birth, 
                    gender, 
                    marital_status,
                    registration_date
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
                [walletAddress, name, dateOfBirth, gender, isMarried]
            );

            return NextResponse.json(
                { message: 'User registered successfully' },
                { status: 201 }
            );
        } catch (error: any) {
            // Check for duplicate wallet address error
            if (error.code === '23505') { // PostgreSQL unique violation error code
                return NextResponse.json(
                    { error: 'Wallet address already registered' },
                    { status: 409 }
                );
            }
            throw error; // Re-throw other errors
        }
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 