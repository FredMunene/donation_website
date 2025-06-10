<script>
  import ProjectCard from '$lib/components/ProjectCard.svelte';
  import { onMount } from 'svelte';
  import { projects } from '$lib/stores/projects.js';

  onMount(async () => {
    await loadProjects();
  });
</script>

<h2>Featured Projects</h2>
<div class="projects-grid">
  {#each $projects as project}
    <ProjectCard {project} />
  {/each}
</div>

<style>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
</style>
