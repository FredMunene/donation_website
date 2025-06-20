import { run } from './database.js';
import crypto from 'crypto';

// Simple UUID v4 generator
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/** @param {string} password */
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Seed data
const sampleProjects = [
    {
        id: uuidv4(),
        title: 'Clean Water Initiative',
        description: 'Providing clean water access to rural communities',
        target_amount: 500000,
        current_amount: 0
    },
    {
        id: uuidv4(),
        title: 'Education Fund',
        description: 'Supporting underprivileged students with school supplies and fees',
        target_amount: 300000,
        current_amount: 0
    },
    {
        id: uuidv4(),
        title: 'Medical Supplies Drive',
        description: 'Collecting essential medical supplies for local clinics',
        target_amount: 200000,
        current_amount: 0
    }
];

const adminUser = {
    id: uuidv4(),
    email: 'admin@test.com',
    password: hashPassword('admin123') // Default password: admin123
};

// Seed database
export async function seedDatabase() {
    try {
        // Insert sample projects
        for (const project of sampleProjects) {
            await run(
                'INSERT INTO projects (id, title, description, target_amount, current_amount) VALUES (?, ?, ?, ?, ?)',
                [project.id, project.title, project.description, project.target_amount, project.current_amount]
            );
        }

        // Insert admin user
        await run(
            'INSERT INTO admin_users (id, email, password) VALUES (?, ?, ?)',
            [adminUser.id, adminUser.email, adminUser.password]
        );

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
} 