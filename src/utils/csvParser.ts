export function parseCSV(content: string): { name: string; values: string[] }[] {
  // Split content into lines and remove empty lines
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  // Get parameter names from header row
  const parameterNames = lines[0].split(';')
    .map(name => name.trim())
    .filter(Boolean);

  if (parameterNames.length === 0) {
    throw new Error('No valid parameter names found in CSV header');
  }

  // Initialize parameters array
  const parameters = parameterNames.map(name => ({
    name,
    values: new Set<string>() // Use Set to automatically handle duplicates
  }));

  // Process data rows
  lines.slice(1).forEach(line => {
    const rowValues = line.split(';')
      .map(cell => cell.trim())
      .filter(Boolean);

    // Add values to their respective parameters
    rowValues.forEach((cell, index) => {
      if (index < parameters.length) {
        // Split by comma and add each value to the Set
        cell.split(',')
          .map(v => v.trim())
          .filter(Boolean)
          .forEach(value => parameters[index].values.add(value));
      }
    });
  });

  // Convert Sets to arrays and return only parameters with values
  return parameters
    .map(param => ({
      name: param.name,
      values: Array.from(param.values)
    }))
    .filter(param => param.values.length > 0);
}