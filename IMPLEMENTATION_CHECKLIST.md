# Implementation checklist

## Implemented and checked

- CSV, XLSX, and XLS upload, parsing, schema inference, missing-value counts, preview pagination/search/sort, deletion, and persistence of uploaded files across backend restarts.
- Constrained natural-language query planning over the selected Pandas dataset, result paging, execution timing, CSV export, filters, grouping, aggregation, and sorting.
- Data-driven overview, analytics summaries, date trends where usable date columns exist, categorical breakdowns, top-item analysis, a profitability scatter chart when the needed columns exist, and SVG download for the rendered date chart.
- Configurable AI provider settings with provider readiness reported by the backend and deterministic local analysis when no provider is configured.
- Unsupported warehouse cards are disabled and identified as planned.
- Test fixtures now remove only their own uploaded dataset, preserving other workspace data.
- Backend tests: `6 passed` (`python -m pytest -q backend/tests`).
- Frontend production build: `npm run build` succeeded.
- Live check: backend health, dataset upload, query execution, analytics, insights, and dataset deletion returned successful responses.

## Remaining work

- Query history and saved reports currently persist in browser local storage; MySQL-backed persistence and migrations are not configured.
- Dataset rename is not implemented. Upload progress currently reports processing state, not transferred-byte percentage.
- The analytics page does not yet provide user-configurable dimensions/filters, histograms, general numeric distributions, correlation analysis, or chart image export. Its available visualizations depend on recognized dataset columns.
- There is no MySQL server or connection configuration in this workspace, so database-backed behavior cannot be verified here.
