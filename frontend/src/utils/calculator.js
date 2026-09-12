/**
 * Client-side loan computation engine for zero-latency slider interactions
 */

export function calculateEMI(principal, annualRate, tenureMonths) {
  const P = Number(principal);
  const R = Number(annualRate);
  const N = Number(tenureMonths);

  if (P <= 0 || N <= 0) {
    return {
      monthlyEMI: 0,
      totalInterest: 0,
      totalPayment: 0,
    };
  }

  if (R === 0) {
    const emi = Math.round((P / N) * 100) / 100;
    return {
      monthlyEMI: emi,
      totalInterest: 0,
      totalPayment: P,
    };
  }

  const monthlyRate = R / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, N);
  const emi = (P * monthlyRate * factor) / (factor - 1);

  const roundedEMI = Math.round(emi);
  const totalPayment = Math.round(roundedEMI * N);
  const totalInterest = Math.max(0, totalPayment - P);

  return {
    monthlyEMI: roundedEMI,
    totalInterest,
    totalPayment,
  };
}

export function generateAmortization(principal, annualRate, tenureMonths, options = {}) {
  const P = Number(principal);
  const R = Number(annualRate);
  const N = Number(tenureMonths);
  const extraMonthly = Number(options.extraMonthly || 0);
  const lumpSumAmount = Number(options.lumpSumAmount || 0);
  const lumpSumMonth = Number(options.lumpSumMonth || 0);

  if (P <= 0 || N <= 0) {
    return {
      monthlyEMI: 0,
      totalInterest: 0,
      totalPayment: 0,
      actualEMI: 0,
      actualTenureMonths: 0,
      monthsSaved: 0,
      interestSaved: 0,
      actualTotalInterest: 0,
      actualTotalPayment: 0,
      monthlySchedule: [],
      yearlySchedule: [],
    };
  }

  const baseResult = calculateEMI(P, R, N);
  const baseEMI = baseResult.monthlyEMI;
  const monthlyRate = R / (12 * 100);

  let balance = P;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;

  const monthlySchedule = [];
  const yearlyRollup = {};

  const startDate = options.startDate ? new Date(options.startDate) : new Date();

  let month = 1;
  const maxIteration = Math.max(N * 2, 720);

  while (balance > 0.01 && month <= maxIteration) {
    const openingBalance = balance;
    const interest = R === 0 ? 0 : Math.round(balance * monthlyRate);

    let scheduledPrincipal = Math.min(baseEMI - interest, balance);
    if (scheduledPrincipal < 0) scheduledPrincipal = 0;

    let extraThisMonth = extraMonthly;
    if (lumpSumAmount > 0 && month === lumpSumMonth) {
      extraThisMonth += lumpSumAmount;
    }

    let actualPrincipal = scheduledPrincipal + extraThisMonth;
    if (actualPrincipal > balance) {
      actualPrincipal = balance;
    }

    const totalPaidThisMonth = actualPrincipal + interest;
    balance = Math.max(0, Math.round(balance - actualPrincipal));

    totalInterestPaid += interest;
    totalPrincipalPaid += actualPrincipal;

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + month);
    const dateStr = paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const yearNumber = Math.ceil(month / 12);

    monthlySchedule.push({
      month,
      year: yearNumber,
      date: dateStr,
      openingBalance: Math.round(openingBalance),
      emi: Math.round(totalPaidThisMonth),
      principal: Math.round(actualPrincipal),
      interest: Math.round(interest),
      closingBalance: Math.round(balance),
      totalInterestPaid: Math.round(totalInterestPaid),
    });

    if (!yearlyRollup[yearNumber]) {
      yearlyRollup[yearNumber] = {
        year: yearNumber,
        openingBalance: Math.round(openingBalance),
        totalEMI: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        closingBalance: 0,
      };
    }
    yearlyRollup[yearNumber].totalEMI += totalPaidThisMonth;
    yearlyRollup[yearNumber].totalPrincipal += actualPrincipal;
    yearlyRollup[yearNumber].totalInterest += interest;
    yearlyRollup[yearNumber].closingBalance = Math.round(balance);

    if (balance <= 0.01) break;
    month++;
  }

  const yearlySchedule = Object.values(yearlyRollup).map((y) => ({
    year: y.year,
    openingBalance: Math.round(y.openingBalance),
    totalEMI: Math.round(y.totalEMI),
    totalPrincipal: Math.round(y.totalPrincipal),
    totalInterest: Math.round(y.totalInterest),
    closingBalance: Math.round(y.closingBalance),
  }));

  const actualTenureMonths = monthlySchedule.length;
  const monthsSaved = Math.max(0, N - actualTenureMonths);
  const interestSaved = Math.max(0, Math.round(baseResult.totalInterest - totalInterestPaid));

  return {
    ...baseResult,
    actualEMI: baseEMI,
    actualTenureMonths,
    monthsSaved,
    interestSaved,
    actualTotalInterest: totalInterestPaid,
    actualTotalPayment: P + totalInterestPaid,
    monthlySchedule,
    yearlySchedule,
  };
}
