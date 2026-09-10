import { saleEventSchema } from './schema';

describe('Sales Event Schema Validation', () => {
  const validPayload = {
    sellDate: "2026-08-08T10:00:00.000Z",
    amountLitres: 150.5,
    pricePerLitre: 12.0,
    customerCompany: "Acme Corp",
    salesmanName: "Alice Smith",
    warrantyType: "time",
    warrantyPeriodDays: 365
  };

  it('accepts a perfectly valid payload', () => {
    const result = saleEventSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects a payload with a missing required field', () => {
    const { amountLitres, ...missingFieldPayload } = validPayload;
    const result = saleEventSchema.safeParse(missingFieldPayload);
    expect(result.success).toBe(false);
  });

  it('rejects a payload with incorrect data types', () => {
    const wrongTypePayload = { ...validPayload, amountLitres: "five" };
    const result = saleEventSchema.safeParse(wrongTypePayload);
    expect(result.success).toBe(false);
  });
});
