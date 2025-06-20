import { writable } from 'svelte/store';

// Create stores for donation state
export const currentDonation = writable(null);
export const paymentStatus = writable('idle'); // 'idle' | 'pending' | 'success' | 'failed'

// Function to make a donation
export async function makeDonation(donationData) {
    try {
        console.log('📤 Sending donation data:', donationData);
        paymentStatus.set('pending');
        
        const response = await fetch('/api/donations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: donationData.projectId,
                amount: donationData.amount,
                phone: donationData.phoneNumber,
                donorName: donationData.name,
                email: donationData.email,
                message: donationData.message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ API error response:', errorData);
            throw new Error(errorData.error || 'Failed to create donation');
        }

        const result = await response.json();
        console.log('✅ Donation created:', result);
        currentDonation.set(result);
        paymentStatus.set('success');
        return result;
    } catch (error) {
        console.error('❌ Error making donation:', error);
        paymentStatus.set('failed');
        throw error;
    }
} 