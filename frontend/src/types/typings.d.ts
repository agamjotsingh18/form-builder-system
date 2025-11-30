// frontend/src/types/typings.d.ts

import { TableMeta } from '@tanstack/react-table';
import { SubmissionRow } from '../components/SubmissionsTable'; 
// Assuming SubmissionRow is defined/exported in SubmissionsTable.tsx or a separate types file

// Extend the TableMeta interface to include our custom function
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    // Add the custom function we defined in SubmissionsTable.tsx
    openModal: (submission: TData) => void;
  }
}