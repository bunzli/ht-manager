import { api } from "./http";

export type TableData = {
  tableName: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
};

export async function fetchTableNames(): Promise<string[]> {
  const response = await api.get<{ tables: string[] }>("/db-browser/tables");
  return response.data.tables;
}

export async function fetchTableData(tableName: string, limit?: number): Promise<TableData> {
  const params = limit ? { limit: String(limit) } : {};
  const response = await api.get<{ table: TableData }>(`/db-browser/tables/${tableName}`, { params });
  return response.data.table;
}
