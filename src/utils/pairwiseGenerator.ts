import { Parameter, TestCase, PairwiseCombination } from '../types/types';

export function generatePairwiseCombinations(parameters: Parameter[]): TestCase[] {
  // Helper function to create a pair key
  const getPairKey = (param1: string, value1: string, param2: string, value2: string) => 
    `${param1}:${value1}-${param2}:${value2}`;

  // Calculate minimum required test cases based on two parameters with most values
  const getMinimumTestCases = (params: Parameter[]): number => {
    const sortedValueCounts = params
      .map(p => p.values.length)
      .sort((a, b) => b - a);
    return sortedValueCounts[0] * sortedValueCounts[1];
  };

  // Generate all possible pairs that need to be covered
  const allPairs: PairwiseCombination[] = [];
  const pairKeys = new Set<string>();
  
  for (let i = 0; i < parameters.length - 1; i++) {
    for (let j = i + 1; j < parameters.length; j++) {
      const param1 = parameters[i];
      const param2 = parameters[j];
      
      param1.values.forEach(value1 => {
        param2.values.forEach(value2 => {
          const pair = {
            param1: param1.name,
            value1,
            param2: param2.name,
            value2
          };
          allPairs.push(pair);
          pairKeys.add(getPairKey(param1.name, value1, param2.name, value2));
        });
      });
    }
  }

  const testCases: TestCase[] = [];
  const coveredPairs = new Set<string>();

  // Helper function to count how many new pairs a test case would cover
  const countNewPairsCovered = (testCase: TestCase): number => {
    let count = 0;
    for (let i = 0; i < parameters.length - 1; i++) {
      for (let j = i + 1; j < parameters.length; j++) {
        const param1 = parameters[i].name;
        const param2 = parameters[j].name;
        const value1 = testCase[param1];
        const value2 = testCase[param2];
        
        const pairKey = getPairKey(param1, value1, param2, value2);
        if (pairKeys.has(pairKey) && !coveredPairs.has(pairKey)) {
          count++;
        }
      }
    }
    return count;
  };

  // Helper function to mark pairs in a test case as covered
  const markPairsCovered = (testCase: TestCase) => {
    for (let i = 0; i < parameters.length - 1; i++) {
      for (let j = i + 1; j < parameters.length; j++) {
        const param1 = parameters[i].name;
        const param2 = parameters[j].name;
        const value1 = testCase[param1];
        const value2 = testCase[param2];
        
        const pairKey = getPairKey(param1, value1, param2, value2);
        if (pairKeys.has(pairKey)) {
          coveredPairs.add(pairKey);
        }
      }
    }
  };

  // Helper function to generate a candidate test case
  const generateCandidate = (): TestCase => {
    const candidate: TestCase = {};
    
    // Try to use values that would cover uncovered pairs more often
    parameters.forEach(param => {
      const uncoveredCounts = new Map<string, number>();
      
      // Count how many uncovered pairs each value could potentially cover
      param.values.forEach(value => {
        let count = 0;
        parameters.forEach(otherParam => {
          if (otherParam.name !== param.name) {
            otherParam.values.forEach(otherValue => {
              const key1 = getPairKey(param.name, value, otherParam.name, otherValue);
              const key2 = getPairKey(otherParam.name, otherValue, param.name, value);
              if (!coveredPairs.has(key1) && !coveredPairs.has(key2)) {
                count++;
              }
            });
          }
        });
        uncoveredCounts.set(value, count);
      });

      // Select value with probability proportional to uncovered pair count
      const totalUncovered = Array.from(uncoveredCounts.values()).reduce((a, b) => a + b, 0);
      if (totalUncovered > 0) {
        let random = Math.random() * totalUncovered;
        for (const [value, count] of uncoveredCounts.entries()) {
          random -= count;
          if (random <= 0) {
            candidate[param.name] = value;
            break;
          }
        }
      }
      
      // If no uncovered pairs, choose randomly
      if (!candidate[param.name]) {
        candidate[param.name] = param.values[Math.floor(Math.random() * param.values.length)];
      }
    });
    
    return candidate;
  };

  const minimumTestCases = getMinimumTestCases(parameters);
  const maxAttempts = minimumTestCases * 10; // Safety factor
  let attempts = 0;

  // Generate test cases until all pairs are covered or we hit the maximum attempts
  while (coveredPairs.size < pairKeys.size && attempts < maxAttempts) {
    let bestTestCase: TestCase | null = null;
    let maxNewPairsCovered = 0;

    // Try multiple candidates and pick the best one
    for (let i = 0; i < 50; i++) {
      const candidate = generateCandidate();
      const newPairsCovered = countNewPairsCovered(candidate);
      
      if (newPairsCovered > maxNewPairsCovered) {
        maxNewPairsCovered = newPairsCovered;
        bestTestCase = candidate;
      }
    }

    if (bestTestCase && maxNewPairsCovered > 0) {
      testCases.push(bestTestCase);
      markPairsCovered(bestTestCase);
    }

    attempts++;

    // Early success check
    if (coveredPairs.size === pairKeys.size) {
      break;
    }

    // If we've generated more than minimum required cases and still haven't covered all pairs,
    // check if we're making progress
    if (testCases.length >= minimumTestCases && attempts % 100 === 0) {
      const coveragePercentage = (coveredPairs.size / pairKeys.size) * 100;
      if (coveragePercentage < 95) {
        // If coverage is too low after minimum cases, restart with fresh attempt
        testCases.length = 0;
        coveredPairs.clear();
        attempts = 0;
      }
    }
  }

  // Verify coverage
  if (coveredPairs.size < pairKeys.size) {
    console.warn(`Warning: Could not achieve full pair coverage. Covered ${coveredPairs.size} out of ${pairKeys.size} pairs.`);
  }

  return testCases;
}