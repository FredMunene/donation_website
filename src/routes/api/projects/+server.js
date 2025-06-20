import { query } from '$lib/utils/database.js';

// GET /api/projects - List all projects
export async function GET() {
    try {
        const projects = await query('SELECT * FROM projects ORDER BY created_at DESC');
        return new Response(JSON.stringify(projects), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch projects' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
} 