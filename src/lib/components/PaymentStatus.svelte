<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { MpesaError } from '$lib/mpesa';

  export let projectId: string;
  export let paymentReference: string | null = null;

  let status: 'pending' | 'completed' | 'failed' = 'pending';
  let error: string | null = null;
  let loading = true;

  async function checkPaymentStatus() {
    try {
      const response = await fetch(`/api/payments/${projectId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }
      const data = await response.json();
      status = data.status;
      error = data.error;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to check payment status';
      status = 'failed';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if (paymentReference) {
      checkPaymentStatus();
    }
  });
</script>

<div class="payment-status" transition:fade>
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Checking payment status...</p>
    </div>
  {:else if error}
    <div class="error">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
      </svg>
      <p>{error}</p>
    </div>
  {:else}
    <div class="status {status}">
      {#if status === 'completed'}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
        </svg>
        <p>Payment completed successfully!</p>
      {:else if status === 'pending'}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clip-rule="evenodd" />
        </svg>
        <p>Payment is being processed...</p>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
        </svg>
        <p>Payment failed. Please try again.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .payment-status {
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #f8fafc;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
  }

  .spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status.completed {
    color: #059669;
  }

  .status.pending {
    color: #3b82f6;
  }

  .status.failed {
    color: #dc2626;
  }

  .error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #dc2626;
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style> 