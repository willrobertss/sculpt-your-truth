import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

interface PaginatedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalLabel?: string;
}

function PaginatedTable<T extends { id?: string }>({
  columns,
  data,
  loading,
  page,
  onPageChange,
  pageSize = 10,
  totalLabel,
}: PaginatedTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12">
        <p className="font-sans text-gray-400 text-sm">No records found.</p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className="font-heading text-xs uppercase tracking-wider text-gray-500">
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={(row as any).id ?? idx} className="border-gray-100 hover:bg-gray-50">
              {columns.map((col) => (
                <TableCell key={col.key} className="font-sans text-sm text-gray-800">
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs font-sans text-gray-400">
          {totalLabel ?? `Page ${page + 1}`}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft size={14} /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={data.length < pageSize}
            onClick={() => onPageChange(page + 1)}
            className="border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaginatedTable;
