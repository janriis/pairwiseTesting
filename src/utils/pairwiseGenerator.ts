import { Parameter, TestCase } from '../types/types';

export function generatePairwiseCombinations(parameters: Parameter[]): TestCase[] {
  if (parameters.length < 2) {
    return [];
  }

  // Helper function to check if a pair exists in test cases
  const hasPair = (testCases: TestCase[], param1: string, value1: string, param2: string, value2: string): boolean => {
    return testCases.some(tc => 
      tc[param1] === value1 && 
      tc[param2] === value2 && 
      tc[param1] !== undefined && 
      tc[param2] !== undefined
    );
  };

  // Helper function to get uncovered pairs
  const getUncoveredPairs = (
    testCases: TestCase[],
    param1: Parameter,
    param2: Parameter
  ): Array<[string, string, string, string]> => {
    const uncovered: Array<[string, string, string, string]> = [];
    
    param1.values.forEach(value1 => {
      param2.values.forEach(value2 => {
        if (!hasPair(testCases, param1.name, value1, param2.name, value2)) {
          uncovered.push([param1.name, value1, param2.name, value2]);
        }
      });
    });
    
    return uncovered;
  };

  // Get all pairs that need to be covered
  let allPairs: Array<[string, string, string, string]> = [];
  for (let i = 0; i < parameters.length - 1; i++) {
    for (let j = i + 1; j < parameters.length; j++) {
      allPairs = allPairs.concat(getUncoveredPairs([], parameters[i], parameters[j]));
    }
  }

  const testCases: TestCase[] = [];

  // Helper function to count how many uncovered pairs a test case would cover
  const countCoveredPairs = (testCase: TestCase, remainingPairs: Array<[string, string, string, string]>): number => {
    return remainingPairs.filter(([p1, v1, p2, v2]) => 
      (testCase[p1] === v1 && testCase[p2] === v2) ||
      (testCase[p2] === v2 && testCase[p1] === v1)
    ).length;
  };

  // Helper function to create a test case that covers a specific pair
  const createTestCase = (
    param1: string,
    value1: string,
    param2: string,
    value2: string,
    remainingPairs: Array<[string, string, string, string]>
  ): TestCase => {
    const testCase: TestCase = {
      [param1]: value1,
      [param2]: value2
    };

    // Fill in other parameters with values that might cover more pairs
    parameters.forEach(param => {
      if (param.name !== param1 && param.name !== param2 && !testCase[param.name]) {
        let bestValue = param.values[0];
        let maxCovered = -1;

        param.values.forEach(value => {
          const candidateCase = { ...testCase, [param.name]: value };
          const covered = countCoveredPairs(candidateCase, remainingPairs);
          if (covered > maxCovered) {
            maxCovered = covered;
            bestValue = value;
          }
        });

        testCase[param.name] = bestValue;
      }
    });

    return testCase;
  };

  // Create test cases until all pairs are covered
  while (allPairs.length > 0) {
    let bestTestCase: TestCase | null = null;
    let maxCovered = -1;

    // Try creating a test case for each remaining pair
    for (const [p1, v1, p2, v2] of allPairs) {
      const candidate = createTestCase(p1, v1, p2, v2, allPairs);
      const covered = countCoveredPairs(candidate, allPairs);

      if (covered > maxCovered) {
        maxCovered = covered;
        bestTestCase = candidate;
      }
    }

    if (bestTestCase) {
      testCases.push(bestTestCase);
      
      // Remove covered pairs
      allPairs = allPairs.filter(([p1, v1, p2, v2]) => 
        !hasPair([bestTestCase], p1, v1, p2, v2) &&
        !hasPair([bestTestCase], p2, v2, p1, v1)
      );
    } else {
      // Shouldn't happen, but break to avoid infinite loop
      break;
    }
  }

  // Ensure all parameters have values in all test cases
  testCases.forEach(testCase => {
    parameters.forEach(param => {
      if (!testCase[param.name]) {
        testCase[param.name] = param.values[0];
      }
    });
  });

  return testCases;
}