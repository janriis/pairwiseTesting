export interface Parameter {
  name: string;
  values: string[];
}

export interface TestCase {
  [key: string]: string;
}

export interface PairwiseCombination {
  param1: string;
  value1: string;
  param2: string;
  value2: string;
}