# Recruiter Profile System - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        JobHunt Platform                          │
└─────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │  Navbar.tsx      │
                              │  (With Profile   │
                              │   Link Added)    │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
          ┌─────────▼──────────┐         ┌───────────────▼────────┐
          │   /recruiter/      │         │  /recruiter/profile/   │
          │   profile          │         │  page.tsx              │
          │   (Existing)       │         │  (NEW - Form UI)       │
          └────────┬───────────┘         └───────────┬────────────┘
                   │                                 │
      ┌────────────┴─────────────┬─────────────────┬┘
      │                          │                 │
      │                          ▼                 ▼
      │              ┌────────────────────┐   ┌────────────────────┐
      │              │  API Endpoints     │   │   Supabase DB      │
      │              │  /api/recruiter/*  │   │   (4 New Tables)   │
      │              └────────────────────┘   └────────────────────┘
      │
      ├─► /api/groups (existing)
      │
      └─► /api/recruiter/search (existing)
```

## Request/Response Flow

### Profile Management Flow
```
Recruiter User
    │
    ├─ Fills form
    │
    ▼
POST /api/recruiter/profile
    │
    ├─ Validates auth token
    ├─ Parses form data
    ├─ Creates/updates recruiter_profiles table
    │
    ▼
Returns: { id, company_name, email, ... }
    │
    ▼
Profile Page updates with success message
```

### Job Sync Flow
```
Recruiter clicks "Sync Jobs Now"
    │
    ├─ Provides: job_board_url, job_board_type
    │
    ▼
POST /api/recruiter/sync-jobs
    │
    ├─ Fetches data from job_board_url
    ├─ Parses based on type (RSS/JSON/XML)
    ├─ Validates job data
    ├─ Clears old jobs for recruiter
    ├─ Inserts new jobs into synced_jobs table
    │
    ▼
Returns: { count: 25, message: "Success" }
    │
    ▼
Success toast shows "Synced 25 jobs"
```

### Application Submission Flow
```
Candidate on JobHunt
    │
    ├─ Finds job from recruiter
    ├─ Clicks "Apply"
    │
    ▼
POST /api/recruiter/webhook
    │
    ├─ Authenticates (Bearer token)
    ├─ Validates application data
    ├─ Stores in job_applications table
    ├─ Forwards to recruiter's webhook URL
    │
    ▼
    ├─ Updates webhook_status (delivered/failed)
    ├─ Stores webhook_response
    │
    ▼
Returns: { applicationId, webhookStatus }
    │
    ▼
Candidate sees "Application submitted!"
Recruiter receives application in their system
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────┐
│                 auth.users (Supabase Auth)              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ 1:1
                       │
        ┌──────────────▼────────────────┐
        │  recruiter_profiles           │
        ├──────────────────────────────┤
        │ id (PK)                       │
        │ user_id (FK, unique)          │
        │ company_name                  │
        │ job_board_url                 │
        │ job_board_type                │
        │ verification_status           │
        │ ... 10+ more fields           │
        └──────────────┬────────────────┘
                       │
                       │ 1:N
                       │
        ┌──────────────▼────────────────┐
        │  synced_jobs                  │
        ├──────────────────────────────┤
        │ id (PK)                       │
        │ recruiter_id (FK)             │
        │ external_job_id               │
        │ title                         │
        │ location                      │
        │ salary_min/max                │
        │ application_url               │
        │ is_active                     │
        └──────────────┬────────────────┘
                       │
                       │ 1:N
                       │
        ┌──────────────▼────────────────┐
        │  job_applications             │
        ├──────────────────────────────┤
        │ id (PK)                       │
        │ synced_job_id (FK)            │
        │ recruiter_id (FK)             │
        │ candidate_id (FK - optional)  │
        │ candidate_name                │
        │ candidate_email               │
        │ resume_url                    │
        │ webhook_status                │
        │ webhook_response              │
        └───────────────────────────────┘
```

## Component Hierarchy

```
App
└── Navbar
    ├── [Logo]
    ├── Links (including new "Recruiter Profile")
    │   ├── /profile (talent profile)
    │   ├── /recruiter/profile (NEW)
    │   ├── /recruiter/search
    │   ├── /recruiter/groups
    │   ├── /search
    │   └── /generate
    │
    └── Pages
        ├── /recruiter/profile/page.tsx (NEW)
        │   ├── Header
        │   ├── Status Messages
        │   ├── Form Sections
        │   │   ├── Basic Information
        │   │   ├── Business Information
        │   │   └── Job Board Integration
        │   ├── Submit Button
        │   └── Cancel Button
        │
        └── API Routes (NEW)
            ├── /api/recruiter/profile
            │   ├── GET - Fetch profile
            │   └── POST - Create/Update
            ├── /api/recruiter/sync-jobs
            │   └── POST - Sync jobs
            └── /api/recruiter/webhook
                ├── POST - Submit application
                └── GET - Check status
```

## Data Flow Diagram

```
External Recruiter Job Board
├── RSS Feed: https://jobs.company.com/feed.xml
├── JSON API: https://api.company.com/jobs
└── XML Sitemap: https://company.com/sitemap.xml

         │
         │ (Periodic manual sync)
         ▼
┌─────────────────────────┐
│  /api/recruiter/        │
│  sync-jobs              │
│                         │
│ • Fetch job feed        │
│ • Parse (RSS/JSON/XML)  │
│ • Validate data         │
│ • Transform to internal │
└────────────┬────────────┘
             │
             ▼
    ┌────────────────┐
    │ synced_jobs    │
    │ table          │
    │ (25+ jobs)     │
    └────────────┬───┘
                 │
                 │
        ┌────────▼─────────┐
        │  JobHunt Job     │
        │  Search Page     │
        │                  │
        │  • Displays      │
        │  • Filterable    │
        │  • Searchable    │
        └────────┬─────────┘
                 │
                 │ Candidate finds job
                 │
                 ▼
        ┌────────────────┐
        │ Candidate      │
        │ Clicks Apply   │
        └────────┬───────┘
                 │
                 ▼
    POST /api/recruiter/webhook
    {
      syncedJobId
      candidateName
      candidateEmail
      resumeUrl
    }
                 │
     ┌───────────┴───────────┐
     │                       │
     ▼                       ▼
Store in          Forward to
job_applications  Recruiter's
table             Webhook URL
```

## Authentication & Authorization

```
┌─────────────────────────┐
│  User Login             │
│  (Supabase Auth)        │
└────────────┬────────────┘
             │
             ▼
    ┌─────────────────┐
    │  JWT Token      │
    │  (Bearer Token) │
    └────────┬────────┘
             │
             ├─────────────────────┬──────────────────┐
             │                     │                  │
             ▼                     ▼                  ▼
    /api/recruiter/   /api/recruiter/    /api/recruiter/
    profile           sync-jobs          webhook
             │                     │                  │
             ├─ Validate token ────┴──────────────────┤
             │                                        │
             ├─ Extract user_id ──────────────────────┤
             │                                        │
             ├─ Query database with RLS ─────────────┤
             │  (only sees own data)                  │
             │                                        │
             ▼                                        ▼
        Success response              Auth error or 
        with user's data              proper scoping
```

## Error Handling Flow

```
Request to API
    │
    ├─ Missing auth header?
    │  └─ Return: 401 Unauthorized
    │
    ├─ Invalid token?
    │  └─ Return: 401 Unauthorized
    │
    ├─ Missing required fields?
    │  └─ Return: 400 Bad Request
    │
    ├─ Database error?
    │  └─ Return: 500 Internal Server Error
    │  └─ Log error details
    │
    └─ Success
       └─ Return: 200 with data

Frontend
    │
    ├─ Network error?
    │  └─ Show: "An error occurred"
    │
    ├─ Validation error?
    │  └─ Show: Specific error message
    │
    ├─ Webhook error?
    │  └─ Show: "Failed to sync jobs"
    │
    └─ Success
       └─ Show: Success toast
```

## Technology Stack

```
Frontend
├── React 19.2.3
├── Next.js 16.1.1
├── TypeScript
├── Tailwind CSS
├── Lucide Icons
└── React Form Hooks

Backend
├── Next.js API Routes
├── TypeScript
└── Middleware
    ├── Authentication (Supabase)
    └── Request validation

Database
├── Supabase (PostgreSQL)
├── Row-Level Security (RLS)
└── 4 relational tables
    ├── recruiter_profiles
    ├── synced_jobs
    ├── job_applications
    └── talent_groups (existing)

External Integration
├── Job Feeds (RSS/JSON/XML)
├── Recruiter Webhooks
└── File Storage (for resumes)

Dependencies Added
├── @supabase/supabase-js (2.45.0)
└── xml2js (0.6.2)
```

## Deployment Architecture

```
Development
    │
    ├─ npm install (adds xml2js, supabase)
    ├─ npm run build (TypeScript check)
    ├─ npm run dev (local testing)
    │
    ▼
Staging
    │
    ├─ Deploy code changes
    ├─ Run SQL migrations
    ├─ Manual testing
    ├─ Webhook testing
    │
    ▼
Production
    │
    ├─ Code deploy
    ├─ Monitor logs
    ├─ Verify functionality
    ├─ Monitor webhook delivery
    │
    ▼
Monitoring
    ├─ Error tracking
    ├─ Performance metrics
    ├─ Webhook success rate
    ├─ Job sync success rate
    └─ Application volume
```

---

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Type-safe operations
- ✅ Secure authentication
- ✅ Database integrity
- ✅ Error handling
- ✅ Scalability
- ✅ Maintainability
