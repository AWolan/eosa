/**
 * @jest-environment node
 */
import { POST } from './route';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  saleEvent: {
    createMany: jest.fn(),
  },
}));

describe('POST /api/sales API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and calls database when batch is valid', async () => {
    const validBatch = [{
      sellDate: "2026-08-08T10:00:00.000Z",
      amountLitres: 100,
      pricePerLitre: 10,
      customerCompany: "Test Corp",
      salesmanName: "Bob",
      warrantyType: "time",
      warrantyPeriodDays: 365
    }];

    const request = new Request('http://localhost:3000/api/sales', {
      method: 'POST',
      body: JSON.stringify(validBatch)
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.saleEvent.createMany).toHaveBeenCalledTimes(1);
  });

  it('returns 200 but DOES NOT call database when batch is malformed', async () => {
    const invalidBatch = [{ amountLitres: "Not a number" }];

    const request = new Request('http://localhost:3000/api/sales', {
      method: 'POST',
      body: JSON.stringify(invalidBatch)
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.saleEvent.createMany).not.toHaveBeenCalled();
  });
});
