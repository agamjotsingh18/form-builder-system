// frontend/src/components/ViewSubmissionModal.tsx

import React from 'react';

interface ModalProps {
    submission: SubmissionRow | null;
    onClose: () => void;
}

interface SubmissionRow {
    id: string;
    createdAt: string;
    data: Record<string, any>;
}

const ViewSubmissionModal: React.FC<ModalProps> = ({ submission, onClose }) => {
    if (!submission) return null;

    // Use Tailwind for modal styling (fixed overlay, centered content, shadow-xl)
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose} // Close modal when clicking the backdrop
        >
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 m-4 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()} // Prevent click propagation to close on content click
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Submission Details: {submission.id.substring(0, 8)}...
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-800 transition-colors text-2xl font-light"
                    >
                        &times; {/* Close symbol */}
                    </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    <p className="text-sm">
                        <span className="font-medium text-gray-700">Created At:</span> {new Date(submission.createdAt).toLocaleString()}
                    </p>
                    
                    {/* Display Submission Data (Employee Onboarding fields) */}
                    <h4 className="text-lg font-medium pt-2 border-t mt-3">Submitted Fields:</h4>
                    
                    {Object.entries(submission.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm py-1 border-b border-gray-100">
                            <span className="font-medium capitalize text-gray-600">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="text-gray-800 font-mono text-xs max-w-xs overflow-hidden text-right">
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSubmissionModal;