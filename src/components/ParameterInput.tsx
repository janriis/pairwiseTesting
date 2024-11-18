import React, { KeyboardEvent, useState, useRef, useEffect } from 'react';
import { Parameter } from '../types/types';
import { X, Eraser, Plus } from 'lucide-react';

/**
 * Props interface for the ParameterInput component
 * @interface ParameterInputProps
 * @property {Parameter} parameter - The parameter object containing name and values
 * @property {Function} onUpdate - Callback function to update the parameter
 * @property {Function} onDelete - Callback function to delete the parameter
 */
interface ParameterInputProps {
  parameter: Parameter;
  onUpdate: (updated: Parameter) => void;
  onDelete: () => void;
}

/**
 * ParameterInput Component
 * Renders a form for managing a parameter and its values
 * 
 * @component
 * @param {ParameterInputProps} props - Component props
 */
export default function ParameterInput({ parameter, onUpdate, onDelete }: ParameterInputProps) {
  // Track the index of the last added value field for focus management
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
  // Refs for managing focus on input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Ref for the parameter name input
  const parameterNameRef = useRef<HTMLInputElement>(null);

  /**
   * Effect hook to manage focus when new value fields are added
   */
  useEffect(() => {
    if (lastAddedIndex !== null && inputRefs.current[lastAddedIndex]) {
      inputRefs.current[lastAddedIndex]?.focus();
      setLastAddedIndex(null);
    }
  }, [lastAddedIndex, parameter.values.length]);

  /**
   * Handles changes to the parameter name
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...parameter, name: e.target.value });
  };

  /**
   * Updates a specific value in the parameter's values array
   * @param {number} index - Index of the value to update
   * @param {string} value - New value
   */
  const handleValueChange = (index: number, value: string) => {
    const newValues = [...parameter.values];
    newValues[index] = value;
    onUpdate({ ...parameter, values: newValues });
  };

  /**
   * Clears a specific value field and maintains focus
   * @param {number} index - Index of the value to clear
   */
  const clearValue = (index: number) => {
    const newValues = [...parameter.values];
    newValues[index] = ''; // Just clear the value instead of removing it
    onUpdate({ ...parameter, values: newValues });
    // Maintain focus on the same field
    setTimeout(() => {
      inputRefs.current[index]?.focus();
    }, 0);
  };

  /**
   * Adds a new empty value field to the parameter
   */
  const addNewValue = () => {
    const newValues = [...parameter.values, ''];
    onUpdate({ ...parameter, values: newValues });
    setLastAddedIndex(newValues.length - 1);
  };

  /**
   * Handles keyboard events for value fields
   * - Tab on last field: adds new field if current field has value
   * - Enter: adds new field
   * - Backspace on empty field: removes field if not last one
   * 
   * @param {KeyboardEvent<HTMLInputElement>} e - Keyboard event
   * @param {number} index - Index of the current value field
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      if (index === parameter.values.length - 1 && e.currentTarget.value.trim() !== '') {
        e.preventDefault();
        addNewValue();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      addNewValue();
    } else if (e.key === 'Backspace' && e.currentTarget.value === '' && parameter.values.length > 1) {
      e.preventDefault();
      const newValues = [...parameter.values];
      newValues.splice(index, 1);
      onUpdate({ ...parameter, values: newValues });
      
      if (index > 0) {
        setLastAddedIndex(index - 1);
      }
    }
  };

  /**
   * Clears all values and parameter name, maintaining focus on parameter name field
   */
  const handleClearValues = () => {
    onUpdate({ ...parameter, name: '', values: [''] });
    // Use setTimeout to ensure focus is set after React updates
    setTimeout(() => {
      parameterNameRef.current?.focus();
    }, 0);
  };

  // Ensure there's always at least one empty value field
  if (parameter.values.length === 0) {
    parameter.values = [''];
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Parameter Name Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 mr-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Parameter Name
          </label>
          <input
            ref={parameterNameRef}
            type="text"
            value={parameter.name}
            onChange={handleNameChange}
            placeholder="Enter parameter name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-bold"
          />
        </div>
        {/* Parameter Control Buttons */}
        <div className="flex gap-2 self-end">
          <button
            onClick={handleClearValues}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
            aria-label="Clear all values"
            title="Clear all values"
            type="button"
          >
            <Eraser size={20} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Delete parameter"
            title="Delete parameter"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      {/* Values Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Values
        </label>
        {parameter.values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Value Input Field */}
            <input
              ref={el => inputRefs.current[index] = el}
              type="text"
              value={value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={`Value ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              data-parameter={parameter.name}
            />
            {/* Clear Value Button */}
            <button
              onClick={() => clearValue(index)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
              title="Clear value"
              type="button"
            >
              <Eraser size={16} />
            </button>
            {/* Add New Value Button (only shown on last field) */}
            {index === parameter.values.length - 1 && (
              <button
                onClick={addNewValue}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                title="Add new value"
                type="button"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Values Counter */}
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {parameter.values.filter(v => v.length > 0).length} value{parameter.values.filter(v => v.length > 0).length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}