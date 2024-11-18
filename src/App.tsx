import React, { useState, useRef } from 'react';
import { Parameter, TestCase } from './types/types';
import { generatePairwiseCombinations } from './utils/pairwiseGenerator';
import ParameterInput from './components/ParameterInput';
import TestCaseTable from './components/TestCaseTable';
import ThemeSelector from './components/ThemeSelector';
import { PlusCircle, TestTube2, Download } from 'lucide-react';

function App() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearAll = () => {
    setParameters([]);
    setTestCases([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addParameter = () => {
    setParameters([...parameters, { name: '', values: [] }]);
  };

  const updateParameter = (index: number, updated: Parameter) => {
    const newParameters = [...parameters];
    newParameters[index] = updated;
    setParameters(newParameters);
  };

  const deleteParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const generateTestCases = () => {
    if (parameters.length < 2) {
      alert('Please add at least 2 parameters with values');
      return;
    }
    
    if (parameters.some(p => p.name === '' || p.values.length === 0)) {
      alert('Please ensure all parameters have names and values');
      return;
    }

    const testCases = generatePairwiseCombinations(parameters);
    setTestCases(testCases);
  };

  // Keeping the CSV export functionality
  const exportToCsv = () => {
    if (testCases.length === 0) return;

    const headers = parameters.map(p => p.name).join(',');
    const rows = testCases.map(tc => 
      parameters.map(p => tc[p.name]).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pairwise-test-cases.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportParametersToCsv = () => {
    if (parameters.length === 0) return;

    const headers = parameters.map(p => p.name).join(';');
    const values = parameters.map(p => p.values.join(',')).join(';');
    
    const csv = `${headers}\n${values}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parameters-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TestTube2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                Pairwise Testing Tool
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSelector />
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Parameters</h2>
              <div className="flex gap-4">
                {parameters.length > 0 && (
                  <button
                    onClick={exportParametersToCsv}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Parameters
                  </button>
                )}
                <button
                  onClick={addParameter}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Parameter
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {parameters.map((param, index) => (
                <ParameterInput
                  key={index}
                  parameter={param}
                  onUpdate={(updated) => updateParameter(index, updated)}
                  onDelete={() => deleteParameter(index)}
                />
              ))}
            </div>

            {parameters.length > 0 && (
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={generateTestCases}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <TestTube2 className="h-5 w-5 mr-2" />
                  Generate Test Cases
                </button>
                {testCases.length > 0 && (
                  <button
                    onClick={exportToCsv}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Test Cases
                  </button>
                )}
              </div>
            )}
          </div>

          {testCases.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Generated Test Cases
              </h2>
              <TestCaseTable
                testCases={testCases}
                parameters={parameters.map(p => p.name)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;