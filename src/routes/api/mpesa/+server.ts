import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CONSUMER_KEY, CONSUMER_SECRET, BUSINESS_SHORT_CODE, PASSKEY } from '$env/static/private';

// Update with your ngrok URL
const BASE_URL = 'https://manually-relieved-unicorn.ngrok-free.app';
const CALLBACK_URL = `${BASE_URL}/api/mpesa/callback`;

import fetch from 'node-fetch';
const baseUrl = 'https://sandbox.safaricom.co.ke'; // Use live URL in production

let accessToken: string;
let tokenExpiry: number = 0;

// Helper function to generate the password
function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

interface AccessTokenResponse {
  access_token: string;
  expires_in: string;
}

async function getAccessToken(): Promise<string> {
  console.log('🔑 Getting M-Pesa access token...');
  
  // Check if we have a valid token
  if (accessToken && tokenExpiry > Date.now()) {
    console.log('✅ Using cached access token');
    return accessToken;
  }

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  try {
    const response = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Failed to get access token:', await response.text());
      throw new Error('Failed to get access token');
    }

    const data = (await response.json()) as AccessTokenResponse;
    accessToken = data.access_token;
    // Set token expiry to 50 minutes (giving 10-minute buffer)
    tokenExpiry = Date.now() + (50 * 60 * 1000);
    console.log('✅ Successfully obtained new access token');
    return accessToken;
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    throw error;
  }
}

// Register callback URL with M-Pesa
async function registerCallbackUrl(token: string) {
  console.log('🔄 Registering callback URL with M-Pesa...');
  try {
    const response = await fetch(`${baseUrl}/mpesa/c2b/v1/registerurl`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ShortCode: BUSINESS_SHORT_CODE,
        ResponseType: 'Completed',
        ConfirmationURL: CALLBACK_URL,
        ValidationURL: CALLBACK_URL
      })
    });

    const result = await response.json();
    console.log('✅ Callback URL registration result:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to register callback URL:', error);
    throw error;
  }
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('🚀 Initiating M-Pesa payment...');
  try {
    const { phoneNumber, amount, projectId } = await request.json();
    console.log('📝 Payment details:', { phoneNumber, amount, projectId });

    // 1. Get access token
    const token = await getAccessToken();
    
    // 2. Register callback URL
    await registerCallbackUrl(token);
    
    // 3. Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = generatePassword(BUSINESS_SHORT_CODE, PASSKEY, timestamp);
    
    console.log('🔐 Generated STK push credentials:', { timestamp });
    
    // 4. Prepare STK push request
    const stkPushBody = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phoneNumber,
      CallBackURL: CALLBACK_URL,
      AccountReference: projectId,
      TransactionDesc: 'Donation payment'
    };
    
    console.log('📤 Sending STK push request:', stkPushBody);

    const response = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ STK push request failed:', errorText);
      throw new Error('Failed to initiate STK push');
    }

    const result = await response.json();
    console.log('📥 STK push response:', result);

    // 5. Handle the response
    if (result.ResponseCode === '0') {
      console.log('✅ STK push initiated successfully');
      return json({
        success: true,
        message: 'STK push initiated successfully',
        data: {
          merchantRequestId: result.MerchantRequestID,
          checkoutRequestId: result.CheckoutRequestID,
          customerMessage: result.CustomerMessage
        }
      });
    } else {
      console.error('❌ STK push failed:', result.ResponseDescription);
      throw new Error(result.ResponseDescription || 'Failed to initiate payment');
    }

  } catch (error) {
    console.error('❌ M-Pesa API error:', error);
    
    return json({
      success: false,
      message: 'Failed to process payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 