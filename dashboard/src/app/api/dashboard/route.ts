import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DEPRECATED: it was used to get data on demand but now it is moved to Server-Send Events at /api/dashboard/stream
 * @constructor
 */
export async function GET() {
  try {
    // Fetch all events, sorted chronologically for cumulative calculations
    const events = await prisma.saleEvent.findMany({
      orderBy: { sellDate: 'asc' },
    });

    const salesmanStats: Record<string, number> = {};
    const chartData = [];

    let closestWarranty = null;
    let minDaysToExpiry = Infinity;
    const now = new Date().getTime();

    for (const event of events) {
      // 1. Leaderboard Aggregation (Total Litres Sold)
      salesmanStats[event.salesmanName] = (salesmanStats[event.salesmanName] || 0) + event.amountLitres;

      // 2. Chart Data & Annotations
      // We store the running total and the individual event details for annotations
      chartData.push({
        date: event.sellDate.toISOString(),
        salesman: event.salesmanName,
        cumulativeVolume: salesmanStats[event.salesmanName],
        // Extra point: Data for annotating the individual event on the graph
        annotation: `Sold ${event.amountLitres.toFixed(1)}L to ${event.customerCompany}`,
      });

      // 3. Warranty Calculation
      // Convert warranty days to milliseconds and add to the sell date
      const expirationTime = event.sellDate.getTime() + (event.warrantyPeriodDays * 24 * 60 * 60 * 1000);
      const daysToExpiry = (expirationTime - now) / (1000 * 60 * 60 * 24);

      // We only care about warranties expiring in the future
      if (daysToExpiry > 0 && daysToExpiry < minDaysToExpiry) {
        minDaysToExpiry = daysToExpiry;
        closestWarranty = {
          customerCompany: event.customerCompany,
          expirationDate: new Date(expirationTime).toISOString(),
          daysLeft: Math.round(daysToExpiry),
          salesmanName: event.salesmanName,
          warrantyType: event.warrantyType,
        };
      }
    }

    // Sort leaderboard descending
    const leaderboard = Object.entries(salesmanStats)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      leaderboard,
      closestWarranty,
      chartData,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
