import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { fetchTableNames, fetchTableData } from "../../api/db-browser";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string") {
    if (value.startsWith("{") || value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value;
      }
    }
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

export function DatabaseBrowserPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const {
    data: tableNames = [],
    isLoading: isLoadingTables,
    isError: isErrorTables
  } = useQuery({
    queryKey: ["db-browser", "tables"],
    queryFn: fetchTableNames
  });

  const {
    data: tableData,
    isLoading: isLoadingData,
    isError: isErrorData
  } = useQuery({
    queryKey: ["db-browser", "table", selectedTable],
    queryFn: () => fetchTableData(selectedTable!, 1000),
    enabled: selectedTable !== null
  });

  useEffect(() => {
    if (tableNames.length > 0 && selectedTable === null) {
      setSelectedTable(tableNames[0]);
    }
  }, [tableNames, selectedTable]);

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold tracking-wide text-foreground">
        Database Browser
      </h1>

      {isErrorTables ? (
        <div className="p-4 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error">
          <AlertCircle className="size-5" />
          Failed to load table names
        </div>
      ) : isLoadingTables ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Table selector tabs */}
          <div className="bg-background bg-background-gradient border border-border rounded-lg p-2">
            <div className="flex flex-wrap gap-1">
              {tableNames.map((tableName) => (
                <Button
                  key={tableName}
                  variant={selectedTable === tableName ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTable(tableName)}
                  className={cn(
                    selectedTable === tableName
                      ? "bg-primary/20 text-primary"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {tableName}
                </Button>
              ))}
            </div>
          </div>

          {/* Table data */}
          {selectedTable && (
            <div className="bg-background bg-background-gradient border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedTable}
                </h2>
                {tableData && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary">
                    {tableData.rowCount} rows
                  </span>
                )}
              </div>

              {isErrorData ? (
                <div className="m-4 p-4 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error">
                  <AlertCircle className="size-5" />
                  Failed to load table data
                </div>
              ) : isLoadingData ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : tableData && tableData.rows.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  No data in this table
                </div>
              ) : tableData ? (
                <div className="overflow-auto max-h-[70vh]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background">
                      <tr>
                        {tableData.columns.map((column) => (
                          <th
                            key={column}
                            className="text-left p-4 text-muted font-semibold border-b border-border"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border hover:bg-primary/5 transition-colors"
                        >
                          {tableData.columns.map((column) => {
                            const value = row[column];
                            const formatted = formatValue(value);
                            const isJson = typeof value === "string" && (value.startsWith("{") || value.startsWith("["));

                            return (
                              <td
                                key={column}
                                className={cn(
                                  "p-4 text-muted",
                                  isJson ? "font-mono text-xs whitespace-pre-wrap max-w-[400px] overflow-auto" : "text-sm max-w-[200px] overflow-hidden text-ellipsis"
                                )}
                                title={isJson ? formatted : undefined}
                              >
                                {formatted}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
