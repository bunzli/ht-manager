import { Router } from "express";
import { getTableData, getTableNames } from "../services/db-browser.service";

export const dbBrowserRouter = Router();

dbBrowserRouter.get("/tables", async (_req, res, next) => {
  try {
    console.log("[db-browser] GET /api/db-browser/tables");
    const tableNames = await getTableNames();
    res.json({ tables: tableNames });
  } catch (error) {
    console.error("[db-browser] Failed to get table names", error);
    next(error);
  }
});

dbBrowserRouter.get("/tables/:tableName", async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 1000;
    
    console.log(`[db-browser] GET /api/db-browser/tables/${tableName}?limit=${limit}`);
    const tableData = await getTableData(tableName, limit);
    res.json({ table: tableData });
  } catch (error) {
    console.error(`[db-browser] Failed to get table data for ${req.params.tableName}`, error);
    next(error);
  }
});
