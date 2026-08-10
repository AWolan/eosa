import { z } from 'zod';

export const saleEventSchema = z.object({
  sellDate: z.string().datetime(),
  amountLitres: z.number().positive(),
  pricePerLitre: z.number().positive(),
  customerCompany: z.string().min(1),
  salesmanName: z.string().min(1),
  warrantyType: z.enum(['mileage', 'time']),
  warrantyPeriodDays: z.number().int().positive(),
  expectedYearlyMileage: z.number().int().positive().nullable().optional(),
});

export const batchSchema = z.array(saleEventSchema);
