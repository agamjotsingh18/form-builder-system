import React from 'react';
import DynamicForm from '../components/DynamicForm';
import { useFormSchema } from '../api/formApi';
import { Link } from 'react-router-dom';

const DynamicFormPage: React.FC = () => {
  const { data: schema, isLoading, isError } = useFormSchema(); 

  if (isLoading) {
    return <div className="p-8 text-center">Loading form schema...</div>;
  }

  if (isError || !schema) {
    return <div className="p-8 text-center text-red-500">Error loading form. Please try again.</div>;
  }
  
  return (
    <div className="container mx-auto p-8">
      <Link to="/submissions" className="text-blue-500 hover:underline mb-4 block">
        View Submissions Table →
      </Link>
      <DynamicForm schema={schema} />
    </div>
  );
};

export default DynamicFormPage;