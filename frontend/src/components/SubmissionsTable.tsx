
import React, { useState, useMemo } from 'react';
import { useSubmissions, SubmissionResponse, SubmissionsQuery, useDeleteSubmission } from '../api/formApi'; // ADD useDeleteSubmission
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import ViewSubmissionModal from './ViewSubmissionModal';
import { useDebounce } from '../hooks/useDebounce'; 
import toast from 'react-hot-toast'; 

export interface SubmissionRow {
    id: string;
    createdAt: string;
    updatedAt?: string; 
    data: Record<string, any>;
}

const exportToCsv = (data: SubmissionRow[]) => {
    if (data.length === 0) {
        toast.error("No data to export.");
        return;
    }
    
    const headers = ['Submission ID', 'Created Date', ...Object.keys(data[0].data)];
    const csvContent = headers.join(',') + '\n';

    const rows = data.map(sub => {
        const values = [
            sub.id,
            new Date(sub.createdAt).toLocaleString(),
            ...Object.values(sub.data).map(val => 
                `"${(Array.isArray(val) ? val.join(';') : String(val)).replace(/"/g, '""')}"`
            ),
        ];
        return values.join(',');
    }).join('\n');

    const finalCsv = csvContent + rows;
    
    const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "submissions_export.csv";
    link.click();
    toast.success("CSV export complete.");
};


const SubmissionsTable: React.FC = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]); 
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500); 

    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null);
    const openModal = (submission: SubmissionRow) => { setSelectedSubmission(submission); };
    const closeModal = () => { setSelectedSubmission(null); };
    // -------------------
    
    // DELETE HOOK
    const deleteMutation = useDeleteSubmission();
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this submission?")) {
            deleteMutation.mutate(id);
        }
    };

    const apiQuery = useMemo(() => ({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
        search: debouncedSearch, // Pass debounced search term
    }), [pagination, sorting, debouncedSearch]);


    const { data, isLoading, isError, isFetching } = useSubmissions(apiQuery as SubmissionsQuery);
    

    const columnHelper = createColumnHelper<SubmissionRow>();

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'Submission ID',
            cell: info => info.getValue().substring(0, 8) + '...',
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created Date',
            cell: info => new Date(info.getValue()).toLocaleString(),
            enableSorting: true,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: props => (
                <div className="space-x-2 flex">
                    <button 
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium hover:underline"
                        onClick={() => props.table.options.meta?.openModal(props.row.original)}
                    >
                        View
                    </button>
                    <button
                         onClick={() => handleDelete(props.row.original.id)}
                         className="text-red-600 hover:text-red-900 text-sm font-medium hover:underline disabled:opacity-50"
                         disabled={deleteMutation.isPending}
                    >
                        Delete
                    </button>
                </div>
            ),
        }),
    ], [deleteMutation.isPending]);


    const table = useReactTable({
        data: data?.submissions || [],
        columns, 
        pageCount: data?.totalPages ?? 0, 
        state: {
            pagination,
            sorting,
            globalFilter: isFetching ? 'Fetching...' : undefined
        },
        meta: { openModal: openModal, },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true, 
        manualSorting: true,
    });


  if (isLoading) {
    return <div className="p-4 text-center text-indigo-600 font-medium">Loading submissions...</div>;
  }
  if (isError) {
    return <div className="p-4 text-center text-red-500 font-medium">❌ Error fetching submissions. Please check backend status.</div>;
  }

  if (data?.totalCount === 0) {
    return <div className="p-4 text-center text-gray-500">No submissions found.</div>;
  }
    const totalCount = data?.totalCount ?? 0;
    
    return (
        <>
            <ViewSubmissionModal submission={selectedSubmission} onClose={closeModal} />
        
            <div className="p-8 bg-white shadow-xl rounded-xl border border-gray-200">
                <h2 className="text-3xl font-semibold mb-4 text-gray-900 border-b pb-4">Form Submissions</h2>
                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Search submissions..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPagination(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                        className="flex h-10 w-64 rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                    
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => exportToCsv(data?.submissions || [])}
                            className="px-3 py-2 border border-green-600 text-green-600 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
                        >
                            Export CSV
                        </button>
                        
                        <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700">Items per page:</label>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => { table.setPageSize(Number(e.target.value)); }}
                                className="border border-gray-300 p-1 rounded-md text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {[10, 20, 50].map(pageSize => (<option key={pageSize} value={pageSize}>{pageSize}</option>))}
                            </select>
                        </div>
              
                        <p className="text-sm font-medium text-gray-700">Total Results: 
                            <span className="font-bold text-indigo-600"> {totalCount}</span>
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer transition-colors hover:bg-gray-200"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            {{ asc: ' ↑', desc: ' ↓', }[header.column.getIsSorted() as string] ?? null}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-indigo-50/50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-600">
                        Page <span className="font-bold">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-bold">{table.getPageCount()}</span>
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || isFetching}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || isFetching}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                      </div>
                </div>
                {isFetching && <div className="text-center text-sm mt-2 text-indigo-500">🔄 Updating data...</div>}
            </div>
        </>
    );
};

export default SubmissionsTable;