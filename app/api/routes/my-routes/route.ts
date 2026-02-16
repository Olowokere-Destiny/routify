import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Route from '../../../../lib/models/Route';
import { getUserFromToken } from '../../../../lib/jwt';

export async function GET(request: NextRequest) {
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

    // Connect to database
    await connectDB();

    // Fetch user's routes, sorted by most recent first
    const routes = await Route.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .select('name points createdAt updatedAt')
      .limit(100); // Limit to 100 most recent routes

    return NextResponse.json(
      {
        success: true,
        routes: routes.map((route) => ({
          id: route._id,
          name: route.name,
          points: route.points,
          pointsCount: route.points.length,
          createdAt: route.createdAt,
          updatedAt: route.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Fetch routes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes. Please try again.' },
      { status: 500 }
    );
  }
}