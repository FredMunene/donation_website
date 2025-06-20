<script>
  import { makeDonation, paymentStatus } from '$lib/stores/donations.js';
  import { validateMpesaPhoneNumber, formatMpesaPhoneNumber } from '$lib/mpesa';
  import { onMount } from 'svelte';

  export let projectId;
  let amount = '';
  let phoneNumber = '';
  let name = '';
  let email = '';
  let message = '';
  let anonymous = false;
  let isSubmitting = false;
  let error = '';
  let success = false;

  // Subscribe to payment status changes
  $: if ($paymentStatus) {
    console.log('🔄 Payment status updated:', $paymentStatus);
  }

  async function handleSubmit() {
    console.log('🎯 Donate button clicked');
    console.log('📝 Form data:', { amount, phoneNumber, name, email, message });
    
    try {
      isSubmitting = true;
      error = '';
      success = false;

      // Validate amount
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        console.error('❌ Invalid amount:', amount);
        error = 'Please enter a valid amount';
        return;
      }

      // Validate phone number
      if (!validateMpesaPhoneNumber(phoneNumber)) {
        console.error('❌ Invalid phone number:', phoneNumber);
        error = 'Please enter a valid M-Pesa phone number';
        return;
      }

      console.log('✅ Form validation passed');
      
      // Format phone number for M-Pesa
      const formattedPhone = formatMpesaPhoneNumber(phoneNumber);
      console.log('📱 Formatted phone number:', formattedPhone);

      // Make the donation
      console.log('🚀 Initiating donation...');
      const result = await makeDonation({
        projectId,
        amount: Number(amount),
        phoneNumber: formattedPhone,
        name,
        email,
        message
      });

      console.log('📥 Donation response:', result);

      if (result.success) {
        console.log('✅ Donation initiated successfully');
        success = true;
        // Reset form
        amount = '';
        phoneNumber = '';
        name = '';
        email = '';
        message = '';
      } else {
        console.error('❌ Donation failed:', result.error);
        error = result.error || 'Failed to process donation';
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      error = 'An unexpected error occurred';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}

  {#if success}
    <div class="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">
        {#if $paymentStatus === 'pending'}
          Please check your phone for the M-Pesa prompt to complete the payment.
        {:else if $paymentStatus === 'completed'}
          Thank you for your donation! Your payment has been received.
        {:else if $paymentStatus === 'failed'}
          The payment was not completed. Please try again.
        {/if}
      </span>
    </div>
  {/if}

  <div>
    <label for="amount" class="block text-sm font-medium text-gray-700">Amount (KES)</label>
    <div class="mt-1 relative rounded-md shadow-sm">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">KES</span>
      </div>
      <input
        type="number"
        name="amount"
        id="amount"
        bind:value={amount}
        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 sm:text-sm border-gray-300 rounded-md"
        placeholder="0.00"
        required
        min="1"
      />
    </div>
  </div>

  <div>
    <label for="phone" class="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
    <div class="mt-1">
      <input
        type="tel"
        name="phone"
        id="phone"
        bind:value={phoneNumber}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="07XXXXXXXX or 254XXXXXXXXX"
        required
      />
    </div>
    <p class="mt-2 text-sm text-gray-500">
      Enter the phone number registered with M-Pesa
    </p>
  </div>

  <div>
    <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
    <div class="mt-1">
      <input
        type="text"
        name="name"
        id="name"
        bind:value={name}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="Your name"
      />
    </div>
  </div>

  <div>
    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
    <div class="mt-1">
      <input
        type="email"
        name="email"
        id="email"
        bind:value={email}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="your.email@example.com"
      />
    </div>
  </div>

  <div>
    <label for="message" class="block text-sm font-medium text-gray-700">Message (Optional)</label>
    <div class="mt-1">
      <textarea
        name="message"
        id="message"
        bind:value={message}
        rows="3"
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        placeholder="Add a message with your donation"
      ></textarea>
    </div>
  </div>

  <div>
    <button
      type="submit"
      disabled={isSubmitting}
      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if isSubmitting}
        Processing...
      {:else}
        Donate Now
      {/if}
    </button>
  </div>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 300px;
  }
  input[type="number"],
  input[type="tel"],
  input[type="text"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
  .error {
    color: red;
    margin: 0;
  }
</style> 