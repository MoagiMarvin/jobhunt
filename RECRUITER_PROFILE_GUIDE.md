# Recruiter Profile & Job Integration System

## Overview

This system allows recruiters to:
1. Create and manage their company profile
2. Connect their job board (via RSS, JSON API, or XML Sitemap)
3. Automatically sync jobs to the JobHunt platform
4. Receive candidate applications via webhook

## Database Schema

### Tables Added

#### `recruiter_profiles`
Stores recruiter business information:
- `id` - UUID primary key
- `user_id` - References auth user (unique)
- `company_name` - Recruiting company name
- `full_name` - Recruiter full name
- `email` - Contact email
- `phone` - Optional contact phone
- `company_website` - Company website URL
- `job_board_url` - URL to job board/feed
- `job_board_type` - Feed type (rss, json_api, xml_sitemap, manual)
- `verification_status` - pending, verified, rejected
- `verification_token` - For email verification
- `verified_at` - Timestamp of verification
- `industry` - Industry specialization
- `specializations` - Array of role specializations
- `company_size` - Business size category
- `years_in_business` - Years operating
- `linkedin_url` - LinkedIn profile
- `created_at`, `updated_at` - Timestamps

#### `synced_jobs`
Stores jobs pulled from recruiter job boards:
- `id` - UUID primary key
- `recruiter_id` - References recruiter_profiles
- `external_job_id` - ID from recruiter's system
- `title` - Job title
- `description` - Job description
- `location` - Job location
- `salary_min`, `salary_max` - Salary range
- `job_type` - Full-time, Contract, Part-time
- `posted_date` - When job was posted
- `application_url` - URL to apply on recruiter's site
- `sync_metadata` - JSONB with original feed data
- `last_synced_at` - Last sync timestamp
- `is_active` - Whether job is still active
- `created_at`, `updated_at` - Timestamps

#### `job_applications`
Tracks applications submitted through JobHunt:
- `id` - UUID primary key
- `synced_job_id` - References synced_jobs
- `candidate_id` - References profiles (optional)
- `recruiter_id` - References recruiter_profiles
- `candidate_name`, `candidate_email` - Applicant info
- `resume_url` - Link to resume
- `cover_letter` - Application text
- `webhook_sent_at` - When sent to recruiter
- `webhook_status` - pending, delivered, failed
- `webhook_response` - JSONB response from recruiter
- `created_at`, `updated_at` - Timestamps

## API Endpoints

### 1. Recruiter Profile Management

#### GET /api/recruiter/profile
Fetch current recruiter's profile
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://jobhunt.com/api/recruiter/profile
```

#### POST /api/recruiter/profile
Create or update recruiter profile
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "TechRecruit Inc",
    "full_name": "John Doe",
    "email": "john@techrecruit.com",
    "phone": "+1234567890",
    "company_website": "https://techrecruit.com",
    "job_board_url": "https://jobs.techrecruit.com/feed.xml",
    "job_board_type": "rss",
    "industry": "Technology",
    "specializations": ["React Developer", "Full Stack"],
    "company_size": "Medium",
    "years_in_business": 5,
    "linkedin_url": "https://linkedin.com/company/techrecruit"
  }' \
  https://jobhunt.com/api/recruiter/profile
```

### 2. Job Synchronization

#### POST /api/recruiter/sync-jobs
Sync jobs from recruiter's job board
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_board_url": "https://jobs.techrecruit.com/feed.xml",
    "job_board_type": "rss"
  }' \
  https://jobhunt.com/api/recruiter/sync-jobs
```

**Response:**
```json
{
  "count": 25,
  "message": "Successfully synced 25 jobs"
}
```

### 3. Application Webhook

#### POST /api/recruiter/webhook
Submit a job application (forwards to recruiter's system)
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "syncedJobId": "uuid-of-synced-job",
    "candidateId": "uuid-of-candidate",
    "candidateName": "Jane Smith",
    "candidateEmail": "jane@example.com",
    "resumeUrl": "https://jobhunt.com/resumes/jane.pdf",
    "coverLetter": "I am very interested in this role..."
  }' \
  https://jobhunt.com/api/recruiter/webhook
```

**Response:**
```json
{
  "applicationId": "uuid-of-application",
  "message": "Application submitted successfully",
  "webhookStatus": "delivered"
}
```

#### GET /api/recruiter/webhook
Check application status
```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://jobhunt.com/api/recruiter/webhook?jobId=UUID&candidateId=UUID"
```

## Frontend Components

### Recruiter Profile Page
**Location:** `src/app/recruiter/profile/page.tsx`

Features:
- Basic information form (name, email, phone)
- Business information (industry, company size, years, etc.)
- Job board integration setup
- Job sync button
- Real-time form validation
- Success/error messaging

### Navigation
Added "Recruiter Profile" link to main navbar for easy access.

## Job Feed Integration Guide

### RSS Feed
Most common format. Your job board should expose an RSS/Atom feed:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>TechRecruit Jobs</title>
    <item>
      <title>Senior React Developer</title>
      <description>We are looking for...</description>
      <link>https://jobs.techrecruit.com/job/123</link>
      <pubDate>Mon, 13 Jan 2025 10:00:00 GMT</pubDate>
      <guid>123</guid>
      <job:location>San Francisco, CA</job:location>
      <job:type>Full-time</job:type>
    </item>
  </channel>
</rss>
```

### JSON API
For custom job boards, provide a JSON endpoint:
```json
{
  "jobs": [
    {
      "id": "123",
      "title": "Senior React Developer",
      "description": "We are looking for...",
      "location": "San Francisco, CA",
      "job_type": "Full-time",
      "salary_min": 150000,
      "salary_max": 200000,
      "apply_url": "https://jobs.techrecruit.com/job/123",
      "posted_date": "2025-01-13T10:00:00Z"
    }
  ]
}
```

### Webhook Callback
When a candidate applies through JobHunt, we'll POST to your webhook:
```json
{
  "event": "job_application",
  "data": {
    "syncedJobId": "uuid",
    "candidateName": "Jane Smith",
    "candidateEmail": "jane@example.com",
    "resumeUrl": "https://jobhunt.com/resumes/jane.pdf",
    "coverLetter": "Optional cover letter text"
  },
  "timestamp": "2025-01-13T10:00:00Z"
}
```

Expected response:
```json
{
  "success": true,
  "applicationId": "your-app-id",
  "status": "received"
}
```

## Workflow

1. **Recruiter Setup**
   - Navigate to Recruiter Profile
   - Fill in business information
   - Add job board URL and select feed type
   - Click "Sync Jobs Now"

2. **Job Syncing**
   - System fetches jobs from specified URL
   - Stores them in `synced_jobs` table
   - Jobs appear in JobHunt's job search

3. **Candidate Application**
   - Candidate finds job in JobHunt search
   - Clicks apply
   - Application submitted via `/api/recruiter/webhook`
   - Data forwarded to recruiter's system

4. **Recruiter Management**
   - Recruiter can update profile anytime
   - Re-sync jobs to get latest postings
   - View applications in their system

## Future Enhancements

- [ ] Email verification for recruiter accounts
- [ ] Business document verification (licenses, certifications)
- [ ] Webhook URL management in profile
- [ ] Application status tracking dashboard
- [ ] Bulk job import via CSV
- [ ] Job board analytics and insights
- [ ] Candidate pipeline management
- [ ] Integration with ATS systems
- [ ] Automated job expiration
- [ ] Rate limiting for job syncs

## Troubleshooting

**Jobs not syncing:**
- Verify job board URL is accessible
- Check feed format matches selected type
- Ensure feed contains required fields
- Check browser console for errors

**Webhook failures:**
- Verify recruiter's webhook endpoint is accessible
- Check endpoint accepts POST requests
- Ensure endpoint doesn't require authentication
- Review webhook_response in job_applications table

**Missing jobs:**
- Old jobs are cleared on each sync
- Sync frequency can be adjusted as needed
- Consider archiving old jobs on recruiter's side
