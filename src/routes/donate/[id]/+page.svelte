<script>
  import { onMount } from 'svelte';
  import DonationForm from '$lib/components/DonationForm.svelte';
  import PaymentStatus from '$lib/components/PaymentStatus.svelte';
  import { page } from '$app/stores';
  import { projects, loadProjects } from '$lib/stores/projects.js';
  import { paymentStatus } from '$lib/stores/donations.js';
  import { get } from 'svelte/store';

  let project;
  let projectId;
  let loading = true;
  let error = null;

  $: projectId = $page.params.id;

  onMount(async () => {
    try {
      if (get(projects).length === 0) {
        await loadProjects();
      }
      project = get(projects).find(p => p.id === projectId);
      if (!project) {
        error = 'Project not found';
      }
    } catch (e) {
      error = 'Failed to load project';
      console.error(e);
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <p>Loading project...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if project}
  <h2>{project.title}</h2>
  <p>{project.description}</p>
  <p>Target: KSh {project.target_amount}</p>
  <p>Raised: KSh {project.current_amount}</p>
  
  {#if $paymentStatus !== 'idle'}
    <PaymentStatus status={$paymentStatus} />
  {:else}
    <DonationForm {projectId} />
  {/if}
{/if}

<style>
  .error {
    color: red;
  }
</style> 