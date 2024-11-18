import React from 'react';
import { TestCase } from '../types/types';

interface TestCaseTableProps {
  testCases: TestCase[];
  parameters: string[];
}

export default function TestCaseTable({ testCases, parameters }: TestCaseTableProps) {
  if (testCases.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 border-b dark:border-gray-600 text-left text-gray-900 dark:text-white">#</th>
            {parameters.map(param => (
              <th key={param} className="px-4 py-2 border-b dark:border-gray-600 text-left text-gray-900 dark:text-white font-bold">
                {param}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-2 border-b dark:border-gray-600 text-gray-900 dark:text-gray-300">{index + 1}</td>
              {parameters.map(param => (
                <td key={param} className="px-4 py-2 border-b dark:border-gray-600 text-gray-900 dark:text-gray-300">
                  {testCase[param]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}