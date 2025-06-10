import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file will be created in the project root
const dbPath = join(__dirname, '../../../donations.db');

// Create and export the database connection
export const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
});

// Initialize database with tables
export async function initDatabase() {
    try {
        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');

        // Drop existing tables if they exist
        await db.run('DROP TABLE IF EXISTS donations');
        await db.run('DROP TABLE IF EXISTS projects');
        await db.run('DROP TABLE IF EXISTS admin_users');

        // Create projects table
        await db.run(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                target_amount INTEGER NOT NULL,
                current_amount INTEGER DEFAULT 0
            )
        `);

        // Create donations table with Mpesa-specific fields
        await db.run(`
            CREATE TABLE IF NOT EXISTS donations (
                id TEXT PRIMARY KEY,
                project_id TEXT REFERENCES projects(id),
                amount INTEGER NOT NULL,
                donor_name TEXT,
                donor_phone TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT false,
                status TEXT DEFAULT 'pending',
                mpesa_code TEXT,
                checkout_request_id TEXT UNIQUE,
                transaction_timestamp TEXT,
                transaction_description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create admin users table
        await db.run(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        // Create indexes for better query performance
        await db.run('CREATE INDEX IF NOT EXISTS idx_donations_project_id ON donations(project_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_donations_checkout_request_id ON donations(checkout_request_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_projects_current_amount ON projects(current_amount)');

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Helper function to run queries with better error handling
export async function query(sql, params = []) {
    try {
        return await db.all(sql, params);
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Helper function to run a single query with better error handling
export async function run(sql, params = []) {
    try {
        return await db.run(sql, params);
    } catch (error) {
        console.error('Database run error:', error);
        throw error;
    }
} 