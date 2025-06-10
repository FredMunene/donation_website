import { initDatabase } from './database.js';

// Test database initialization
async function testDatabase() {
    try {
        await initDatabase();
        console.log('Database test completed successfully');
    } catch (error) {
        console.error('Database test failed:', error);
    }
}

testDatabase(); 