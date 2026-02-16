import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Route from '../../../../../lib/models/Route';
import { getUserFromToken } from '../../../../../lib/jwt';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from token
    const authHeader = request.headers.get('authorization');
    const user = getUserFromToken(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Await params in Next.js 15+
    const params = await context.params;
    const routeId = params.id;

    if (!routeId) {
      return NextResponse.json(
        { error: 'Route ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find route and verify ownership
    const route = await Route.findOne({
      _id: routeId,
      userId: user.userId,
    });

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the route
    await Route.deleteOne({ _id: routeId });

    return NextResponse.json(
      {
        success: true,
        message: 'Route deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Delete route error:', error);
    return NextResponse.json(
      { error: 'Failed to delete route. Please try again.' },
      { status: 500 }
    );
  }
}