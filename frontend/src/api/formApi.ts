
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormSchema } from '../types/schema';

const API_BASE_URL = 'http://localhost:3001/api';
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

export const useSubmitForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Record<string, any>) => {
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