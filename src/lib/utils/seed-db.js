import { db, initDatabase } from './database.js';
import crypto from 'crypto';

async function seed() {
    await initDatabase();

    // Sample projects
    const projects = [
        {
            id: crypto.randomUUID(),
            title: 'Clean Water for All',
            description: 'Provide clean water to rural communities.',
            target_amount: 50000,
            current_amount: 0
        },
        {
            id: crypto.randomUUID(),
            title: 'School Supplies Drive',
            description: 'Equip students with essential school supplies.',
            target_amount: 30000,
            current_amount: 0
        },
        {
            id: crypto.randomUUID(),
            title: 'Healthcare Access Fund',
            description: 'Support medical camps in underserved areas.',
            target_amount: 75000,
            current_amount: 0
        }
    ];

    for (const p of projects) {
        await db.run(
            'INSERT INTO projects (id, title, description, target_amount, current_amount) VALUES (?, ?, ?, ?, ?)',
            [p.id, p.title, p.description, p.target_amount, p.current_amount]
        );
    }

    // Admin user (password: admin123, hashed with SHA256 for demo)
    const adminId = crypto.randomUUID();
    const email = 'admin@test.com';
    const password = 'admin123';
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    await db.run(
        'INSERT INTO admin_users (id, email, password) VALUES (?, ?, ?)',
        [adminId, email, passwordHash]
    );

    console.log('Database seeded with sample data.');
}

seed().catch(console.error); 