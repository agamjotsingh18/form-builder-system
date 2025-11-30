import React from 'react';
import SubmissionsTable from '../components/SubmissionsTable';
import { Link } from 'react-router-dom';

const SubmissionsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <Link to="/" className="text-blue-500 hover:underline mb-4 block">
        ← Back to Form
      </Link>
      <SubmissionsTable />
    </div>
  );
};

export default SubmissionsPage;