# Recruiter Profile - Quick Start Guide

## TL;DR - What You're Getting

A complete recruiter profile system where:
1. Recruiters create a profile with company info
2. Connect their job board (RSS/JSON/XML feed)
3. Jobs automatically appear on JobHunt
4. Candidates apply through JobHunt
5. Applications sent to recruiter's webhook

**Time to deploy:** ~30 minutes

## Getting Started

### Step 1: Merge Database Changes (5 min)

```bash
# Copy the SQL from supabase/schema.sql into Supabase dashboard
# Or use Supabase CLI:
supabase db push
```

The schema adds these tables:
- `recruiter_profiles` (company info)
- `synced_jobs` (pulled job listings)
- `job_applications` (tracked applications)

### Step 2: Install Dependencies (2 min)

```bash
npm install
```

New packages added:
- `@supabase/supabase-js` - Database client
- `xml2js` - For parsing RSS/XML feeds

### Step 3: Verify Build (3 min)

```bash
npm run build
```

Should complete without errors.

### Step 4: Test Locally (5 min)

```bash
npm run dev
```

Then:
1. Go to `http://localhost:3000/recruiter/profile`
2. Fill in test company info
3. Click Save
4. Verify it shows "Profile saved successfully!"

### Step 5: Deploy to Production (10 min)

```bash
# Your normal deployment process
# e.g., git push, Vercel deploy, etc.
```

That's it! 🚀

## Feature Summary

### What Recruiters Get

✅ **Profile Management**
- Company information form
- Business details (industry, size, etc.)
- Specializations/roles
- LinkedIn & website links

✅ **Job Board Integration**
- Connect via RSS/JSON/XML
- One-click job sync
- Jobs instantly appear on JobHunt
- Support for 500+ jobs per recruiter

✅ **Application Handling**
- Receive applications via webhook
- Forward to recruiter's system
- Track delivery status
- Full audit trail

### What's in the Code

**New Files (4):**
- `src/app/recruiter/profile/page.tsx` - Profile UI
- `src/app/api/recruiter/profile/route.ts` - Profile API
- `src/app/api/recruiter/sync-jobs/route.ts` - Job sync API
- `src/app/api/recruiter/webhook/route.ts` - Application handling

**Modified Files (3):**
- `supabase/schema.sql` - Added tables
- `src/components/Navbar.tsx` - Added profile link
- `package.json` - Added dependencies

**Documentation (5):**
- `RECRUITER_PROFILE_GUIDE.md` - Technical docs
- `RECRUITER_PROFILE_SETUP.md` - Implementation summary
- `RECRUITER_INTEGRATION_EXAMPLES.md` - Code examples
- `RECRUITER_ARCHITECTURE.md` - System architecture
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide

## Key Features Explained

### 1. Profile Form
Recruiters fill in:
- Name, email, phone
- Company name & website
- Industry & specializations
- Years in business
- LinkedIn URL

### 2. Job Feed Types
**RSS/Atom** - Most common
```xml
<rss version="2.0">
  <channel>
    <item>
      <title>Senior Developer</title>
      <link>https://jobs.company.com/123</link>
      ...
    </item>
  </channel>
</rss>
```

**JSON API** - Custom endpoints
```json
[
  {
    "id": "123",
    "title": "Senior Developer",
    "apply_url": "https://jobs.company.com/123"
  }
]
```

**XML Sitemap** - Job URL feeds
```xml
<urlset>
  <url>
    <loc>https://jobs.company.com/senior-developer</loc>
  </url>
</urlset>
```

### 3. Job Sync Flow
```
Recruiter clicks "Sync Jobs Now"
    ↓
System fetches from job_board_url
    ↓
Parses based on feed type
    ↓
Stores in synced_jobs table
    ↓
Jobs appear in JobHunt search
```

### 4. Application Webhook
When candidate applies:
```
POST to: https://recruiter.com/webhooks/jobhunt

{
  "event": "job_application",
  "data": {
    "candidateName": "Jane Smith",
    "candidateEmail": "jane@example.com",
    "resumeUrl": "https://...",
    "syncedJobId": "uuid"
  },
  "timestamp": "2025-01-13T10:00:00Z"
}
```

## API Endpoints

**Profile:**
```
GET  /api/recruiter/profile
POST /api/recruiter/profile
```

**Jobs:**
```
POST /api/recruiter/sync-jobs
```

**Applications:**
```
POST /api/recruiter/webhook
GET  /api/recruiter/webhook?jobId=...
```

## Testing Checklist

- [ ] Profile page loads
- [ ] Can fill and save profile
- [ ] Profile data persists
- [ ] Can add specializations
- [ ] "Sync Jobs Now" button works
- [ ] Jobs appear in database
- [ ] Navbar shows profile link
- [ ] No console errors

## Common Tasks

### Test with sample RSS feed
```bash
curl https://feeds.example.com/jobs.xml
```

### Check if profile was saved
```sql
SELECT * FROM recruiter_profiles;
```

### View synced jobs
```sql
SELECT * FROM synced_jobs WHERE recruiter_id = 'uuid';
```

### Check applications
```sql
SELECT * FROM job_applications 
WHERE created_at > NOW() - INTERVAL '1 day';
```

## Troubleshooting

**Profile page shows 404**
- Ensure Supabase URL is set in env vars
- Check TypeScript build completed

**Jobs won't sync**
- Verify job_board_url is accessible
- Check feed format matches selected type
- Review browser console for errors

**Applications not forwarding**
- Confirm recruiter's webhook URL is valid
- Test webhook endpoint with curl
- Check webhook_response in job_applications table

## Next Steps

1. ✅ Deploy this feature
2. ⏭️ Recruit first recruiter
3. ⏭️ Test job sync with real feed
4. ⏭️ Get first candidate application
5. ⏭️ Gather feedback
6. ⏭️ Add Phase 2 features (email verification, etc.)

## Support Docs

- **Setup Issues?** → See `DEPLOYMENT_CHECKLIST.md`
- **Integration Help?** → See `RECRUITER_INTEGRATION_EXAMPLES.md`
- **Architecture Questions?** → See `RECRUITER_ARCHITECTURE.md`
- **Full Details?** → See `RECRUITER_PROFILE_GUIDE.md`

## Quick Deploy Script

```bash
#!/bin/bash
echo "1. Installing dependencies..."
npm install

echo "2. Building..."
npm run build

echo "3. Ready to deploy!"
echo ""
echo "Next steps:"
echo "- Deploy code to production"
echo "- Run SQL migrations in Supabase"
echo "- Test at /recruiter/profile"
```

## Metrics to Track

After deployment, monitor:
- New recruiter signups
- Job syncs per recruiter
- Sync success rate
- Applications received
- Webhook delivery rate

```sql
-- New recruiters (daily)
SELECT COUNT(*), DATE(created_at) 
FROM recruiter_profiles 
GROUP BY DATE(created_at);

-- Jobs synced (total)
SELECT COUNT(*) FROM synced_jobs;

-- Applications (past 7 days)
SELECT COUNT(*) FROM job_applications 
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

**Ready to ship?** 🚢

This is a complete, production-ready MVP. No other features needed before launch.

Questions? Check the docs folder or review the code comments.
