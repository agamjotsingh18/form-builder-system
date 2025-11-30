
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormSchema } from '../types/schema';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("VITE_API_BASE_URL is not configured. API calls will likely fail.");
}

// -----------------------------------------------------------------------------
// 1. Fetch Form Schema (GET /api/form-schema)
// -----------------------------------------------------------------------------
export const useFormSchema = () => {
  return useQuery<FormSchema>({
    queryKey: ['form-schema'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/form-schema`); 
      if (!response.ok) {
        throw new Error('Failed to fetch form schema');
      }
      return response.json();
    },
  });
};

// -----------------------------------------------------------------------------
// 2. Submit Form (POST /api/submissions)
// -----------------------------------------------------------------------------
export const useSubmitForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      // Use the single, correct API_BASE_URL constant
      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors ? JSON.stringify(data.errors) : 'Submission failed');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
};


export interface SubmissionResponse {
    submissions: Array<{
        id: string;
        createdAt: string;
        data: Record<string, any>;
    }>;
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
}

export interface SubmissionsQuery {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

// -----------------------------------------------------------------------------
// 3. Fetch Submissions (GET /api/submissions)
// -----------------------------------------------------------------------------
export const useSubmissions = (query: SubmissionsQuery) => {
    const { page, limit, sortBy, sortOrder } = query;
    const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
    }).toString();

    return useQuery<SubmissionResponse>({
        queryKey: ['submissions', query], 
        queryFn: async () => {
            const response = await fetch(`${API_BASE_URL}/submissions?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }
            return response.json();
        },
    });
};

// -----------------------------------------------------------------------------
// 4. Delete Submission (DELETE /api/submissions/:id)
// -----------------------------------------------------------------------------
export const useDeleteSubmission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
                method: 'DELETE',
            });

            if (response.status === 204) {
                return { success: true };
            }
            throw new Error('Deletion failed.');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            toast.success('Submission successfully deleted!', { duration: 2500 });
        },
        onError: () => {
             toast.error('Failed to delete submission.', { duration: 3000 });
        }
    });
};