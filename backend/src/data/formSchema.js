const schema = {
  title: 'Employee Onboarding Form',
  description: 'Please fill out your details for the onboarding process.',
  fields: [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your legal full name',
      required: true,
      validations: {
        minLength: 3,
        maxLength: 50
      }
    },
    {
      name: 'email',
      label: 'Work Email',
      type: 'text',
      placeholder: 'e.g., john.doe@matbook.com',
      required: true,
      validations: {
        regex: '^\\S+@\\S+\\.\\S+$'
      }
    },
    {
      name: 'employeeId',
      label: 'Employee ID',
      type: 'number',
      placeholder: 'Your 6-digit employee ID',
      required: true,
      validations: {
        min: 100000,
        max: 999999
      }
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      placeholder: 'Select your department',
      required: true,
      options: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'hr', label: 'Human Resources' },
        { value: 'marketing', label: 'Marketing' }
      ]
    },
    {
      name: 'skills',
      label: 'Technical Skills',
      type: 'multi-select',
      placeholder: 'Select relevant skills',
      required: true,
      options: [
        { value: 'react', label: 'React' },
        { value: 'node', label: 'Node.js' },
        { value: 'sql', label: 'SQL' },
        { value: 'ts', label: 'TypeScript' }
      ],
      validations: {
        minSelected: 1,
        maxSelected: 3
      }
    },
    {
      name: 'startDate',
      label: 'Start Date',
      type: 'date',
      required: true,
      validations: {
        minDate: new Date().toISOString().split('T')[0] 
      }
    },
    {
      name: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      placeholder: 'Any special requests or comments',
      required: false
    },
    {
      name: 'termsAccepted',
      label: 'I accept the terms and conditions.',
      type: 'switch',
      required: true
    },
  ]
};

module.exports = schema;