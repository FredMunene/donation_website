/**
 * M-Pesa payment integration functions
 */

/**
 * Custom error class for M-Pesa related errors
 */
export class MpesaError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'MpesaError';
    this.code = code;
  }
}

/**
 * Validates a phone number for M-Pesa
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export function validateMpesaPhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if the number starts with 254 and has 12 digits
  if (cleanedNumber.startsWith('254') && cleanedNumber.length === 12) {
    return true;
  }
  
  // Check if the number starts with 0 and has 10 digits
  if (cleanedNumber.startsWith('0') && cleanedNumber.length === 10) {
    return true;
  }
  
  // Check if the number is 9 digits (without prefix)
  if (cleanedNumber.length === 9) {
    return true;
  }
  
  return false;
}

/**
 * Formats a phone number for M-Pesa
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number in M-Pesa format (254XXXXXXXXX)
 * @throws {MpesaError} When phone number cannot be formatted
 */
export function formatMpesaPhoneNumber(phoneNumber) {
  try {
    // Remove any non-digit characters
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // If number starts with 0, replace with 254
    if (cleanedNumber.startsWith('0')) {
      return '254' + cleanedNumber.substring(1);
    }
    
    // If number starts with 254, return as is
    if (cleanedNumber.startsWith('254')) {
      return cleanedNumber;
    }
    
    // If number is 9 digits, add 254 prefix
    if (cleanedNumber.length === 9) {
      return '254' + cleanedNumber;
    }
    
    throw new MpesaError('Invalid phone number format', 'INVALID_FORMAT');
  } catch (error) {
    if (error instanceof MpesaError) {
      throw error;
    }
    throw new MpesaError('Failed to format phone number', 'FORMAT_ERROR');
  }
}

/**
 * Initiates an M-Pesa STK push payment
 * @param {Object} paymentDetails - Payment details
 * @param {string} paymentDetails.phoneNumber - Customer's phone number
 * @param {number} paymentDetails.amount - Payment amount
 * @param {string} paymentDetails.projectId - Project ID for the donation
 * @returns {Promise<Object>} Response from the M-Pesa API
 * @throws {MpesaError} When payment initiation fails
 */
export async function initiateMpesaPayment(paymentDetails) {
  try {
    if (!validateMpesaPhoneNumber(paymentDetails.phoneNumber)) {
      throw new MpesaError('Invalid phone number format', 'INVALID_PHONE');
    }

    if (paymentDetails.amount <= 0) {
      throw new MpesaError('Amount must be greater than 0', 'INVALID_AMOUNT');
    }

    const formattedPhone = formatMpesaPhoneNumber(paymentDetails.phoneNumber);
    
    const response = await fetch('/api/mpesa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...paymentDetails,
        phoneNumber: formattedPhone
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new MpesaError(
        errorData.message || 'Failed to initiate M-Pesa payment',
        errorData.code || 'PAYMENT_FAILED'
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof MpesaError) {
      throw error;
    }
    throw new MpesaError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'UNKNOWN_ERROR'
    );
  }
} 