import { initDatabase } from './database.js';
import { seedDatabase } from './seed-db.js';

async function initialize() {
    try {
        await initDatabase();
        await seedDatabase();
        console.log('Database initialized and seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initialize(); 