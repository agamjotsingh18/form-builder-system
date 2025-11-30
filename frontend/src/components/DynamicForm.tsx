// frontend/src/components/DynamicForm.tsx

import React from 'react';
import { FormApi, useForm, FieldApi } from '@tanstack/react-form';
import { FormField, FormSchema, FieldType } from '../types/schema';
import { useSubmitForm } from '../api/formApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Import toast function

// Utility to generate a TanStack Form validation function from schema rules
const createValidator = (field: FormField) => {
  return ({ value }: { value: any }) => {
    // Required field validation [cite: 42]
    if (field.required && (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required.`;
    }

    // MinLength / MaxLength [cite: 37]
    if (field.type === 'text' || field.type === 'textarea') {
      if (field.validations?.minLength && String(value).length < field.validations.minLength) {
        return `Must be at least ${field.validations.minLength} characters.`;
      }
      if (field.validations?.maxLength && String(value).length > field.validations.maxLength) {
        return `Must be less than ${field.validations.maxLength} characters.`;
      }
    }

    // Regex [cite: 38]
    if (field.type === 'text' && field.validations?.regex) {
      const regex = new RegExp(field.validations.regex);
      if (!regex.test(String(value))) {
        return 'Invalid format.';
      }
    }

    // Min / Max (numbers) [cite: 39]
    if (field.type === 'number') {
      const numValue = Number(value);
      if (field.validations?.min !== undefined && numValue < field.validations.min) {
        return `Must be at least ${field.validations.min}.`;
      }
      if (field.validations?.max !== undefined && numValue > field.validations.max) {
        return `Cannot be more than ${field.validations.max}.`;
      }
    }
    
    // MinDate [cite: 40]
    if (field.type === 'date' && field.validations?.minDate) {
      const inputDate = new Date(value);
      const minDate = new Date(field.validations.minDate);
      if (inputDate < minDate) {
        return `Date cannot be before ${field.validations.minDate}.`;
      }
    }
    
    // MinSelected / MaxSelected [cite: 41]
    if (field.type === 'multi-select' && Array.isArray(value)) {
        if (field.validations?.minSelected && value.length < field.validations.minSelected) {
            return `Select at least ${field.validations.minSelected} options.`;
        }
        if (field.validations?.maxSelected && value.length > field.validations.maxSelected) {
            return `Select no more than ${field.validations.maxSelected} options.`;
        }
    }
    
    return undefined; 
  };
};

// Generic Field Component to handle rendering and validation messages
const FieldComponent: React.FC<{ field: FormField, form: FormApi<any> }> = ({ field, form }) => (
  <form.Field
    name={field.name as any}
    validators={{
        onChange: createValidator(field)
    }}
    defaultValue={
        field.type === 'switch' ? false : 
        field.type === 'multi-select' ? [] : 
        ''
    }
  >
    {({ state, handleChange, handleBlur }) => {
      let inputElement;
      
      // ShadCN-style input classes and error handling logic
      const isInvalid = state.meta.errors.length > 0 || state.meta.touchedErrors.length > 0;
      const baseInputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
      const inputProps = {
        id: field.name,
        name: field.name,
        placeholder: field.placeholder, // Show placeholders [cite: 34]
        onBlur: handleBlur,
        'aria-required': field.required,
        className: `${baseInputClass} ${isInvalid ? 'border-red-500 ring-red-500' : 'border-gray-300'}`
      };

      switch (field.type as FieldType) {
        case 'text':
        case 'number':
        case 'date':
          inputElement = (
            <input
              {...inputProps}
              type={field.type === 'number' ? 'text' : field.type}
              value={state.value as string}
              onChange={e => handleChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
            />
          );
          break;
        case 'textarea':
          inputElement = (
            <textarea
              {...inputProps}
              value={state.value as string}
              onChange={e => handleChange(e.target.value)}
              className={`${inputProps.className} h-24`} 
              rows={4}
            />
          );
          break;
        case 'select':
          inputElement = (
            <select
              {...inputProps}
              value={state.value as string}
              onChange={e => handleChange(e.target.value)}
            >
              <option value="">{field.placeholder || 'Select...'}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          );
          break;
        case 'multi-select':
          inputElement = (
            <div className="flex flex-col space-y-2 p-2 border border-gray-200 rounded-md bg-white">
                {field.options?.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={(state.value as string[]).includes(option.value)}
                            onChange={(e) => {
                                const currentValue = state.value as string[];
                                const newValue = e.target.checked
                                    ? [...currentValue, option.value]
                                    : currentValue.filter(v => v !== option.value);
                                handleChange(newValue);
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
          );
          break;
        case 'switch':
            inputElement = (
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={state.value as boolean}
                        onChange={(e) => handleChange(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                </div>
            );
            break;
        default:
          inputElement = <p className="text-red-500">Unsupported Field Type: {field.type}</p>;
      }

      return (
        <div className="mb-4">
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>} {/* Show labels and required indicators [cite: 34] */}
          </label>
          {inputElement}
          {(state.meta.errors.length > 0 || state.meta.touchedErrors.length > 0) && (
            <p className="text-red-500 text-xs mt-1">{state.meta.errors[0] || state.meta.touchedErrors[0]}</p> 
          )}
        </div>
      );
    }}
  </form.Field>
);


const DynamicForm: React.FC<{ schema: FormSchema }> = ({ schema }) => {
  const navigate = useNavigate();
  const { mutate, isPending, isSuccess, isError, error, reset } = useSubmitForm();

  // Initialize TanStack Form
  const form = useForm({
    defaultValues: schema.fields.reduce((acc, field) => {
      // Set initial values based on field type
      acc[field.name] = 
        field.type === 'switch' ? false : 
        field.type === 'multi-select' ? [] : 
        '';
      return acc;
    }, {} as Record<string, any>),
    onSubmit: async ({ value, formApi }) => {
        try {
            await mutate(value, {
                onSuccess: () => {
                    // Show success message and provide clear user feedback [cite: 46, 49]
                    formApi.reset(); // Clear form after successful submission [cite: 47]
toast.success('Submission successful! Navigating...', { duration: 3000 }); // SUCCESS TOAST
                    navigate('/submissions'); // Navigate to submissions page [cite: 48]
                },
                onError: (error) => {
                    // Show error message [cite: 46]
                    console.error('Submission Error:', error);
                    let errorMessage = 'An unexpected error occurred.';
                    if (error.message.startsWith('{')) {
                        try {
                            const errors = JSON.parse(error.message);
                            const firstErrorKey = Object.keys(errors)[0];
                            errorMessage = `Validation Error: ${errors[firstErrorKey]}`;
                        } catch (e) { /* ignore JSON parse error */ }
                    }
toast.error(`Error: ${errorMessage}`); // ERROR TOAST
                }
            });
        } catch (e) {
            // Error handling from the mutation call itself
        }
    },
  });

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-xl border border-gray-200">
      <h2 className="text-3xl font-semibold mb-2 text-gray-900">{schema.title}</h2>
      <p className="text-gray-500 mb-6 border-b pb-4">{schema.description}</p>
      
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          {/* Dynamic Field Rendering */}
          {schema.fields.map(field => (
            <FieldComponent key={field.name} field={field} form={form} />
          ))}

          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-colors ${isPending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2 mt-4`}
            disabled={isPending || !form.state.isValid} // Disable submit button during submission [cite: 44]
          >
            {isPending ? 'Submitting...' : 'Submit Form'} {/* Show loading indicator [cite: 45] */}
          </button>
        </form>

      {/* Simple Success/Error Feedback [cite: 46] */}
{/*       {isSuccess && <p className="mt-4 text-green-600 font-medium">✅ Submission successful!</p>} */}
{/*       {isError && <p className="mt-4 text-red-600 font-medium">❌ Error: {error.message}</p>} */}
    </div>
  );
};

export default DynamicForm;