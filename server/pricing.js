const BASE_PRICES = new Map([
  [60, 50000],
  [120, 70000],
  [180, 100000]
]);

const LATE_FEE_PER_30_MINUTES = 30000;
const RESIDENT_DISCOUNT_RATE = 0.4;

function getBasePrice(durationMinutes) {
  const price = BASE_PRICES.get(Number(durationMinutes));
  if (!price) {
    throw new Error('Unsupported rental duration');
  }
  return price;
}

function calculateTicket({
  plannedDurationMinutes,
  startedAt,
  returnedAt,
  discountEligible
}) {
  const baseFee = getBasePrice(plannedDurationMinutes);
  const start = new Date(startedAt);
  const end = new Date(returnedAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new Error('Returned time must be after started time');
  }

  const plannedEnd = new Date(start.getTime() + Number(plannedDurationMinutes) * 60 * 1000);
  const lateMilliseconds = Math.max(0, end.getTime() - plannedEnd.getTime());
  const lateBlocks = lateMilliseconds === 0 ? 0 : Math.ceil(lateMilliseconds / (30 * 60 * 1000));
  const lateFee = lateBlocks * LATE_FEE_PER_30_MINUTES;
  const residentDiscountAmount = discountEligible ? Math.round(baseFee * RESIDENT_DISCOUNT_RATE) : 0;
  const totalAmount = baseFee - residentDiscountAmount + lateFee;

  return {
    baseFee,
    residentDiscountAmount,
    lateFee,
    totalAmount,
    lateBlocks,
    lateMinutes: Math.ceil(lateMilliseconds / 60000)
  };
}

module.exports = {
  BASE_PRICES,
  LATE_FEE_PER_30_MINUTES,
  RESIDENT_DISCOUNT_RATE,
  calculateTicket,
  getBasePrice
};
