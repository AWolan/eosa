import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// --- Helper Methods ---

async function fetchRecentSales() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await prisma.saleEvent.findMany({
    where: { sellDate: { gte: thirtyDaysAgo } },
    orderBy: { sellDate: 'asc' },
  });
}

function calculateLeaderboard(sales: any[]) {
  const totals: Record<string, number> = {};
  sales.forEach((sale) => {
    totals[sale.salesmanName] = (totals[sale.salesmanName] || 0) + sale.amountLitres;
  });

  return Object.entries(totals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

function findClosestWarranty(sales: any[]) {
  const now = new Date();
  let closest: any = null;
  let minDays = Infinity;

  sales.forEach((sale) => {
    const expirationDate = new Date(sale.sellDate);
    expirationDate.setDate(expirationDate.getDate() + sale.warrantyPeriodDays);

    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays < minDays) {
      minDays = diffDays;
      closest = {
        customerCompany: sale.customerCompany,
        expirationDate: expirationDate.toISOString(),
        daysLeft: diffDays,
        salesmanName: sale.salesmanName,
        warrantyType: sale.warrantyType,
      };
    }
  });

  return closest;
}

function generateChartData(sales: any[]) {
  const cumulativeTotals: Record<string, number> = {};
  return sales.map((sale) => {
    cumulativeTotals[sale.salesmanName] = (cumulativeTotals[sale.salesmanName] || 0) + sale.amountLitres;
    return {
      date: sale.sellDate,
      salesman: sale.salesmanName,
      cumulativeVolume: cumulativeTotals[sale.salesmanName],
      annotation: `Sold ${sale.amountLitres}L to ${sale.customerCompany}`,
    };
  });
}

// --- Main Pipeline ---

async function getDashboardData() {
  const sales = await fetchRecentSales();

  if (sales.length === 0) {
    return { leaderboard: [], closestWarranty: null, chartData: [] };
  }

  return {
    leaderboard: calculateLeaderboard(sales),
    closestWarranty: findClosestWarranty(sales),
    chartData: generateChartData(sales)
  };
}

// --- Stream Handler ---

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      let lastSignature = '';

      const checkAndPush = async () => {
        try {
          const count = await prisma.saleEvent.count();
          const latest = await prisma.saleEvent.findFirst({
            orderBy: { sellDate: 'desc' },
            select: { sellDate: true },
          });

          const currentSignature = `${count}-${latest?.sellDate || 'empty'}`;

          if (currentSignature !== lastSignature) {
            lastSignature = currentSignature;
            const data = await getDashboardData();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }
        } catch (error) {
          console.error('SSE check failed:', error);
        }
      };

      await checkAndPush();
      const interval = setInterval(checkAndPush, 2000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(customStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}