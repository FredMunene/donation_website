import { json } from '@sveltejs/kit';
import { run, getDb } from '$lib/utils/database.js';
import { initiateMpesaPayment } from '$lib/mpesa';
import crypto from 'crypto';

export async function POST({ request }) {
    console.log('📥 Received donation request');
    try {
        const { projectId, amount, phone, donorName, email, message } = await request.json();
        console.log('📝 Donation data:', { projectId, amount, phone, donorName, email, message });

        // Validate required fields
        if (!projectId || !amount || !phone) {
            console.error('❌ Missing required fields');
            return json({ 
                success: false, 
                error: 'Missing required fields (projectId, amount, phone)' 
            }, { status: 400 });
        }

        // Create donation record
        const donationId = crypto.randomUUID();
        await run(
            `INSERT INTO donations (
                id, project_id, amount, donor_name, donor_phone, donor_email, message, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [donationId, projectId, amount, donorName || null, phone, email || null, message || null, 'pending']
        );

        console.log('✅ Created donation record:', { id: donationId });

        // Initiate M-Pesa payment
        console.log('🚀 Initiating M-Pesa payment...');
        const mpesaResult = await initiateMpesaPayment({
            phoneNumber: phone,
            amount: amount,
            projectId: projectId
        });

        console.log('📥 M-Pesa response:', mpesaResult);

        // Update donation with M-Pesa details
        await run(
            `UPDATE donations SET 
                checkout_request_id = ?,
                payment_details = ?
            WHERE id = ?`,
            [
                mpesaResult.CheckoutRequestID,
                JSON.stringify({
                    merchant_request_id: mpesaResult.MerchantRequestID,
                    checkout_request_id: mpesaResult.CheckoutRequestID,
                    customer_message: mpesaResult.CustomerMessage
                }),
                donationId
            ]
        );

        console.log('✅ Updated donation with M-Pesa details');

        return json({
            success: true,
            message: 'Donation created successfully',
            data: {
                donationId,
                checkoutRequestId: mpesaResult.CheckoutRequestID,
                customerMessage: mpesaResult.CustomerMessage
            }
        });
    } catch (error) {
        console.error('❌ Error creating donation:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create donation'
        }, { status: 500 });
    }
} 