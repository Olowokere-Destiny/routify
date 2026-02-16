import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Route from '../../../../lib/models/Route';
import { getUserFromToken } from '../../../../lib/jwt';
import { rateLimit } from '../../../../lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = rateLimit(`save-route:${ip}`, 10, 60000); // 10 saves per minute

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Please try again in ${rateLimitResult.remainingTime} seconds.`,
          remainingTime: rateLimitResult.remainingTime,
        },
        { status: 429 }
      );
    }

    // Get user from token
    const authHeader = request.headers.get('authorization');
    const user = getUserFromToken(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { name, points } = await request.json();

    // Validation
    if (!name || !points) {
      return NextResponse.json(
        { error: 'Route name and points are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(points) || points.length === 0) {
      return NextResponse.json(
        { error: 'Route must have at least one point' },
        { status: 400 }
      );
    }

    if (name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Route name cannot be empty' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Route name cannot exceed 100 characters' },
        { status: 400 }
      );
    }

    // Validate points structure
    const isValidPoints = points.every(
      (point) =>
        point.id &&
        Array.isArray(point.coordinates) &&
        point.coordinates.length === 2 &&
        typeof point.coordinates[0] === 'number' &&
        typeof point.coordinates[1] === 'number' &&
        point.timestamp
    );

    if (!isValidPoints) {
      return NextResponse.json(
        { error: 'Invalid points format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Create route
    const route = await Route.create({
      userId: user.userId,
      name: name.trim(),
      points,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Route saved successfully',
        route: {
          id: route._id,
          name: route.name,
          pointsCount: route.points.length,
          createdAt: route.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Save route error:', error);
    return NextResponse.json(
      { error: 'Failed to save route. Please try again.' },
      { status: 500 }
    );
  }
}