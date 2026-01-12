import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip
} from "@mui/material";
import { fetchTableNames, fetchTableData } from "../../api/db-browser";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string") {
    // If it's a JSON string, try to format it nicely
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

  // Auto-select first table when tables load
  useEffect(() => {
    if (tableNames.length > 0 && selectedTable === null) {
      setSelectedTable(tableNames[0]);
    }
  }, [tableNames, selectedTable]);

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{
          color: "#e2e8f0",
          fontWeight: 700,
          letterSpacing: "0.5px"
        }}
      >
        Database Browser
      </Typography>

      {isErrorTables ? (
        <Alert severity="error">
          Failed to load table names
        </Alert>
      ) : isLoadingTables ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Table selector tabs */}
          <Paper
            sx={{
              bgcolor: "#0a0e27",
              backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
              border: "1px solid rgba(66, 153, 225, 0.2)",
              borderRadius: 2
            }}
          >
            <Tabs
              value={selectedTable ?? false}
              onChange={(_e, newValue) => setSelectedTable(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: "1px solid rgba(66, 153, 225, 0.2)",
                "& .MuiTab-root": {
                  color: "#9ca3af",
                  "&.Mui-selected": {
                    color: "#4299e1"
                  }
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#4299e1"
                }
              }}
            >
              {tableNames.map((tableName) => (
                <Tab key={tableName} label={tableName} value={tableName} />
              ))}
            </Tabs>
          </Paper>

          {/* Table data */}
          {selectedTable && (
            <Paper
              sx={{
                bgcolor: "#0a0e27",
                backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
                border: "1px solid rgba(66, 153, 225, 0.2)",
                borderRadius: 2,
                overflow: "hidden"
              }}
            >
              <Box sx={{ p: 3, borderBottom: "1px solid rgba(66, 153, 225, 0.2)" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#e2e8f0",
                      fontWeight: 600
                    }}
                  >
                    {selectedTable}
                  </Typography>
                  {tableData && (
                    <Chip
                      label={`${tableData.rowCount} rows`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(66, 153, 225, 0.2)",
                        color: "#4299e1",
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
              </Box>

              {isErrorData ? (
                <Alert severity="error" sx={{ m: 3 }}>
                  Failed to load table data
                </Alert>
              ) : isLoadingData ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : tableData && tableData.rows.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center", color: "#9ca3af" }}>
                  No data in this table
                </Box>
              ) : tableData ? (
                <TableContainer sx={{ maxHeight: "70vh" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {tableData.columns.map((column) => (
                          <TableCell
                            key={column}
                            sx={{
                              color: "#9ca3af",
                              borderColor: "rgba(66, 153, 225, 0.2)",
                              fontWeight: 600,
                              bgcolor: "#0a0e27"
                            }}
                          >
                            {column}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.rows.map((row, idx) => (
                        <TableRow
                          key={idx}
                          sx={{
                            "&:hover": {
                              bgcolor: "rgba(66, 153, 225, 0.05)"
                            }
                          }}
                        >
                          {tableData.columns.map((column) => {
                            const value = row[column];
                            const formatted = formatValue(value);
                            const isJson = typeof value === "string" && (value.startsWith("{") || value.startsWith("["));

                            return (
                              <TableCell
                                key={column}
                                sx={{
                                  color: "#cbd5e0",
                                  borderColor: "rgba(66, 153, 225, 0.2)",
                                  fontFamily: isJson ? "monospace" : "inherit",
                                  fontSize: isJson ? "0.75rem" : "0.875rem",
                                  whiteSpace: isJson ? "pre-wrap" : "normal",
                                  maxWidth: isJson ? "400px" : "200px",
                                  overflow: isJson ? "auto" : "hidden",
                                  textOverflow: isJson ? "unset" : "ellipsis"
                                }}
                                title={isJson ? formatted : undefined}
                              >
                                {formatted}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
}
