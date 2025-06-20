import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';
import { donations } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('📥 Received M-Pesa callback');
  
  try {
    const data = await request.json() as MpesaCallbackData;
    console.log('📝 Callback data:', JSON.stringify(data, null, 2));

    const { stkCallback } = data.Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    console.log('🔍 Processing callback:', {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc
    });

    if (ResultCode === 0 && CallbackMetadata) {
      // Payment was successful
      const metadata = CallbackMetadata.Item.reduce((acc, item) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {} as Record<string, string | number>);

      console.log('✅ Payment successful. Metadata:', metadata);

      const {
        MpesaReceiptNumber: mpesaReceiptNumber,
        TransactionDate: transactionDate,
        PhoneNumber: phoneNumber
      } = metadata;

      // Update donation status in database
      const [updatedDonation] = await db
        .update(donations)
        .set({
          status: 'completed',
          payment_reference: mpesaReceiptNumber as string,
          payment_date: new Date(transactionDate as string),
          payment_method: 'mpesa',
          payment_details: {
            phone_number: phoneNumber,
            receipt_number: mpesaReceiptNumber,
            transaction_date: transactionDate
          }
        })
        .where(eq(donations.checkout_request_id, CheckoutRequestID))
        .returning();

      console.log('💾 Updated donation record:', updatedDonation);

      return json({
        success: true,
        message: 'Payment processed successfully'
      });
    } else {
      // Payment failed
      console.error('❌ Payment failed:', ResultDesc);

      // Update donation status to failed
      const [updatedDonation] = await db
        .update(donations)
        .set({
          status: 'failed',
          payment_details: {
            error: ResultDesc,
            checkout_request_id: CheckoutRequestID
          }
        })
        .where(eq(donations.checkout_request_id, CheckoutRequestID))
        .returning();

      console.log('💾 Updated failed donation record:', updatedDonation);

      return json({
        success: false,
        message: 'Payment failed',
        error: ResultDesc
      });
    }
  } catch (error) {
    console.error('❌ Error processing callback:', error);
    return json({
      success: false,
      message: 'Error processing callback',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 