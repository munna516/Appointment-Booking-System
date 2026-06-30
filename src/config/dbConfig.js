import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pgPkg from 'pg';
const { Pool } = pgPkg;
import { constants } from './constants.js';


const connectionString = constants.database_url;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);


export const prisma = new PrismaClient({ adapter });

export async function connectDb() {
    await prisma.$connect();
    console.log('Database connected successfully 🔥');
}

export async function disconnectDb() {
    await prisma.$disconnect();
    console.log('Database disconnected');
}