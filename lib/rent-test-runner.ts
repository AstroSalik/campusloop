/**
 * Rent Engine Sanity Checker & Unit Assertion Runner
 */
import {
  calculateSplit,
  calculateHousingRatio,
  getAffordabilityFlag,
  evaluateRentHealth,
} from "./rent-engine";

interface TestCase {
  name: string;
  rent: number;
  utilities: number;
  maintenance: number;
  occupants: number;
  income: number;
  expectedShare: number;
  expectedFlag: string;
}

const testCases: TestCase[] = [
  {
    name: "Scenario 1 (Low Budget / 🟢 Comfortable)",
    rent: 8000,
    utilities: 800,
    maintenance: 400,
    occupants: 3,
    income: 15000,
    expectedShare: 3067, // (8000 + 800 + 400)/3 = 3066.67 => 3067
    expectedFlag: "comfortable", // 3067 / 15000 = 20.4% <= 30%
  },
  {
    name: "Scenario 2 (Moderate Budget / 🟡 Moderate)",
    rent: 12000,
    utilities: 1200,
    maintenance: 500,
    occupants: 2,
    income: 18000,
    expectedShare: 6850, // (12000 + 1200 + 500)/2 = 6850
    expectedFlag: "moderate", // 6850 / 18000 = 38.1% <= 40%
  },
  {
    name: "Scenario 3 (Primary Demo Room #1 / 🟠 High)",
    rent: 18000,
    utilities: 1500,
    maintenance: 900,
    occupants: 3,
    income: 15000,
    expectedShare: 6800, // (18000 + 1500 + 900)/3 = 6800
    expectedFlag: "high", // 6800 / 15000 = 45.3% <= 50%
  },
  {
    name: "Scenario 4 (Luxury Flat / 🔴 Heavy)",
    rent: 24000,
    utilities: 2000,
    maintenance: 1000,
    occupants: 3,
    income: 15000,
    expectedShare: 9000, // (24000 + 2000 + 1000)/3 = 9000
    expectedFlag: "heavy", // 9000 / 15000 = 60.0% > 50%
  },
  {
    name: "Scenario 5 (Single Studio / 🔴 Heavy Solo)",
    rent: 12000,
    utilities: 1000,
    maintenance: 500,
    occupants: 1,
    income: 15000,
    expectedShare: 13500, // 13500/1 = 13500
    expectedFlag: "heavy", // 13500 / 15000 = 90.0% > 50%
  },
];

console.log("===============================================================");
console.log("             CAMPUSLOOP RENT ENGINE TEST SUITE                ");
console.log("===============================================================\n");

let allPassed = true;

testCases.forEach((tc, idx) => {
  const result = evaluateRentHealth(
    tc.rent,
    tc.utilities,
    tc.maintenance,
    tc.occupants,
    tc.income
  );

  const shareMatch = Math.abs(result.perPersonShare - tc.expectedShare) <= 1;
  const flagMatch = result.flag === tc.expectedFlag;
  const pass = shareMatch && flagMatch;

  if (!pass) allPassed = false;

  console.log(`[TEST ${idx + 1}] ${tc.name}`);
  console.log(`  • Inputs: Rent=₹${tc.rent}, Util=₹${tc.utilities}, Maint=₹${tc.maintenance}, Occupants=${tc.occupants}, Income=₹${tc.income}`);
  console.log(`  • Output: Total=₹${result.totalCost}, Share=₹${result.perPersonShare}/person, Ratio=${result.housingRatioPct}%`);
  console.log(`  • Flag: ${result.flagEmoji} ${result.flagLabel.toUpperCase()} (${result.flag})`);
  console.log(`  • Status: ${pass ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  • Guidance: "${result.description}"\n`);
});

console.log("===============================================================");
console.log(`FINAL RESULT: ${allPassed ? "✅ ALL 5 TEST SCENARIOS PASSED" : "❌ TEST FAILURES DETECTED"}`);
console.log("===============================================================");
