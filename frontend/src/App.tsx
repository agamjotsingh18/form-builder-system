import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DynamicFormPage from './pages/DynamicFormPage';
import SubmissionsPage from './pages/SubmissionsPage';
import toast, { Toaster } from 'react-hot-toast'; 
import './index.css'; 


const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 p-4">
          <Routes>
            <Route path="/" element={<DynamicFormPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
          </Routes>
        </div>
        <Toaster position="top-right" /> 
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;