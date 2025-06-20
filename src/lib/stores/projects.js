import { writable } from 'svelte/store';

// Create a writable store for projects
export const projects = writable([]);

// Function to load projects from the API
export async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to load projects');
        }
        const data = await response.json();
        projects.set(data);
    } catch (error) {
        console.error('Error loading projects:', error);
        projects.set([]); // Set empty array on error
    }
} 