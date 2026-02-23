# Product Requirements Document: Partner Developer Report

## 1. Overview

**Partner Developer Report** is an internal-facing Azure Static Web App that provides a tabular reporting interface for survey data collected by the companion **Partner Developer Survey** app. It connects to the same Azure SQL Database (`sqldb-responses`) and surfaces raw survey data across three tab-based views — Responses, Participants, and Questions — with filtering, search, and export capabilities.

The app is designed for **internal team members and product managers** who need to review, filter, and export survey feedback. Access is protected by a simple password gate — the app URL is not publicly advertised.

**Phase 1** focuses on surfacing the three existing raw data tables. **Future phases** will add views for processed/analyzed data (e.g., sentiment analysis, topic extraction) as those tables are added to the database.

---

## 2. Architecture

```
[ React SPA (Fluent UI v9) ]  →  [ Python Azure Functions (SWA-managed) ]  →  [ Azure SQL Database ]
         ↑                                                                          ↑
   Password Gate                                                              Shared with
   (client-side)                                                          Partner_Developer_Survey
```

- **Frontend**: React 18 + TypeScript + Fluent UI v9 + Vite
- **API**: Python Azure Functions, managed by the Static Web App
- **Database**: Existing Azure SQL Database — **read-only access** from this app
- **Auth**: Client-side password gate (session-based)
- **Infrastructure**: Deploys to the same resource group (`rg-rfpsurvey-dev`), reuses the existing SQL server

---

## 3. Data Source

Database resource:
```
/subscriptions/50a05771-9f0e-45e8-87b8-779c3f84602e/resourceGroups/rg-rfpsurvey-dev/
providers/Microsoft.Sql/servers/sql-rfpsurvey-dev-nlppmcvzymz2s/databases/sqldb-responses
```

### 3.1 Tables (Phase 1)

**`dbo.responses`**
| Column | Type |
|--------|------|
| id | INT (PK) |
| submission_id | UNIQUEIDENTIFIER |
| question_id | NVARCHAR(50) |
| question_text | NVARCHAR(1000) |
| response_text | NVARCHAR(MAX) |
| input_method | NVARCHAR(20) |
| processed | BIT |
| created_at | DATETIME2 |
| updated_at | DATETIME2 |

**`dbo.participants`**
| Column | Type |
|--------|------|
| id | INT (PK) |
| submission_id | UNIQUEIDENTIFIER |
| first_name | NVARCHAR(100) |
| last_name | NVARCHAR(100) |
| email | NVARCHAR(255) |
| consent_given | BIT |
| consent_timestamp | DATETIME2 |
| created_at | DATETIME2 |
| updated_at | DATETIME2 |

**`dbo.questions`**
| Column | Type |
|--------|------|
| id | INT (PK) |
| question_id | NVARCHAR(50) |
| question_text | NVARCHAR(1000) |
| question_order | INT |
| is_active | BIT |
| created_at | DATETIME2 |
| updated_at | DATETIME2 |

### 3.2 Existing View

**`dbo.vw_responses_with_participants`** — Pre-joined view for convenience queries.

### 3.3 Future Tables (Phase 2+)

Processed/analyzed data tables (sentiment scores, topic clusters, keywords) will be added by a separate pipeline.

---

## 4. User Interface

### 4.1 Layout
- **Password Gate**: Simple password entry screen before accessing the app
- **Header**: App title
- **Tab Navigation**: Responses, Participants, Questions
- **Content Area**: Data table with toolbar (search, filters, export)

### 4.2 Tab: Responses
- Filter by question ID, input method, processed status, date range, submission ID
- Full-text search across response_text
- Sortable columns, pagination (10/25/50/100 rows)
- Expandable rows for long transcripts
- CSV + Excel export

### 4.3 Tab: Participants
- Search across name and email
- Filter by date range
- Click to see participant's responses
- CSV + Excel export

### 4.4 Tab: Questions
- Search question text
- Filter by active status
- Click to see all responses for a question
- CSV + Excel export

---

## 5. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/responses` | GET | List responses (paginated, filtered, sorted) |
| `/api/participants` | GET | List participants (paginated, filtered, sorted) |
| `/api/questions` | GET | List questions |
| `/api/responses/export` | GET | Export responses (CSV/Excel) |
| `/api/participants/export` | GET | Export participants (CSV/Excel) |
| `/api/questions/export` | GET | Export questions (CSV/Excel) |
| `/api/health` | GET | Health check |

---

## 6. Authentication

- Client-side password gate with a shared access password
- Password checked in the browser; valid session stored in `sessionStorage`
- Session lasts until the browser tab is closed
- The URL is not publicly advertised as an additional layer of obscurity

---

## 7. Phases

### Phase 1 — Core Reporting (MVP)
Raw data tables, filtering, search, sort, export, password gate.

### Phase 2 — Processed Data Views
Sentiment analysis, topic clusters, summary dashboards, charts.

### Phase 3 — Advanced Features
Role-based access, real-time refresh, drill-down, comparison views.
