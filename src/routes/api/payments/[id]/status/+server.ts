import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';
import { donations } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const projectId = params.id;

    // Get donation status from database
    const donation = await db.query.donations.findFirst({
      where: eq(donations.projectId, projectId),
      columns: {
        status: true,
        paymentReference: true
      }
    });

    if (!donation) {
      return json({
        success: false,
        message: 'Donation not found',
        status: 'failed'
      }, { status: 404 });
    }

    return json({
      success: true,
      status: donation.status,
      paymentReference: donation.paymentReference
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    return json({
      success: false,
      message: 'Failed to check payment status',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }, { status: 500 });
  }
}; 