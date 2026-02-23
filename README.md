# Partner Developer Report

> **Repository**: [hellomichellelee/PartnerDeveloperReportPOC](https://github.com/hellomichellelee/PartnerDeveloperReportPOC)

An internal reporting dashboard for viewing survey data collected by the [Partner Developer Survey](../Partner_Developer_Survey) app. Built with React + Fluent UI v9 and backed by Python Azure Functions, deployed as an Azure Static Web App.

## Features

- **Three-tab interface**: Responses, Participants, Questions
- **Filter & search**: Full-text search, column filters, date range pickers
- **Sort & paginate**: Sortable columns with configurable page sizes
- **Export**: Download filtered data as CSV or Excel
- **Access control**: Password-protected entry screen

## Architecture

```
React SPA (Fluent UI v9)  →  Python Azure Functions (SWA-managed)  →  Azure SQL Database
```

Connects to the same Azure SQL Database (`sqldb-responses`) used by the survey collection app. **Read-only access** — this app never writes to the database.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Python](https://www.python.org/) 3.10+
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) v4
- [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/) (`npm install -g @azure/static-web-apps-cli`)
- [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/) (`azd`)

## Quick Start

### 1. Install dependencies

```bash
# Frontend
cd src/frontend
npm install

# API
cd ../api
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your SQL connection string
```

For the API, copy local settings:
```bash
cp src/api/local.settings.json.example src/api/local.settings.json
# Edit with your connection string
```

### 3. Run locally

```bash
# Start frontend dev server + API together
cd src/frontend
npm run dev

# In another terminal, start the API
cd src/api
func start

# Or use SWA CLI to run both together
swa start http://localhost:5173 --api-location src/api
```

## Deployment

### Using Azure Developer CLI

```bash
azd auth login
azd up
```

### Using GitHub Actions

1. Push to the [PartnerDeveloperReportPOC](https://github.com/hellomichellelee/PartnerDeveloperReportPOC) repo's `main` branch
2. The workflow requires a `AZURE_STATIC_WEB_APPS_API_TOKEN` secret — get this from the Azure Portal under your Static Web App → **Manage deployment token**

## Project Structure

```
├── azure.yaml                # azd configuration
├── docs/PRD.md               # Product requirements
├── infra/                    # Bicep infrastructure
│   ├── main.bicep
│   └── main.bicepparam
├── src/
│   ├── api/                  # Python Azure Functions
│   │   ├── shared/           # Database module
│   │   ├── GetResponses/     # GET /api/responses
│   │   ├── GetParticipants/  # GET /api/participants
│   │   ├── GetQuestions/     # GET /api/questions
│   │   ├── Export*/          # Export endpoints
│   │   └── health/           # Health check
│   └── frontend/             # React + Fluent UI v9
│       └── src/
│           ├── components/   # Tab views, DataTable, filters
│           ├── hooks/        # Data fetching hooks
│           ├── services/     # API client
│           └── types/        # TypeScript types
```
