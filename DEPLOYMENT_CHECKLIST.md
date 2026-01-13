# Recruiter Profile Feature - Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] Copy all SQL from `supabase/schema.sql` into Supabase dashboard
- [ ] Run SQL to create tables:
  - [ ] `recruiter_profiles`
  - [ ] `synced_jobs`
  - [ ] `job_applications`
- [ ] Verify tables created successfully in Supabase UI
- [ ] Set appropriate Row Level Security (RLS) policies:
  ```sql
  -- Recruiter can only see their own profile
  ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can see their own recruiter profile"
    ON recruiter_profiles
    FOR SELECT USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own recruiter profile"
    ON recruiter_profiles
    FOR UPDATE USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own recruiter profile"
    ON recruiter_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  ```

### Code Installation
- [ ] Pull latest code with all new files
- [ ] Run `npm install` to install new dependencies:
  - [ ] `@supabase/supabase-js`
  - [ ] `xml2js`
- [ ] Verify `package-lock.json` updated
- [ ] Run `npm run build` to check for TypeScript errors
- [ ] Verify no build errors

### Environment Variables
- [ ] Confirm `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Test Supabase connection: `npm run dev`

## Deployment

### Staging Environment
- [ ] Deploy to staging first
- [ ] Test recruiter profile creation
- [ ] Test job sync with test RSS/JSON feed
- [ ] Test application webhook
- [ ] Verify database tables populated correctly

### Production Environment
- [ ] Get approvals from product/management
- [ ] Create database backup
- [ ] Deploy to production
- [ ] Monitor logs for errors
- [ ] Verify no increased error rates

## Post-Deployment

### Verification
- [ ] Navigate to `/recruiter/profile` - page loads
- [ ] Fill form and save - profile created in DB
- [ ] Edit profile - changes persist
- [ ] Sync jobs button works - jobs appear in DB
- [ ] Check navbar - "Recruiter Profile" link visible

### User Testing
- [ ] Have a recruiter test full flow:
  - [ ] Create profile
  - [ ] Add job board URL
  - [ ] Sync jobs
  - [ ] Verify jobs appear correctly
- [ ] Test with different feed types (RSS, JSON)
- [ ] Verify navigation is intuitive

### Monitoring
- [ ] Set up error tracking for new endpoints:
  - [ ] `/api/recruiter/profile`
  - [ ] `/api/recruiter/sync-jobs`
  - [ ] `/api/recruiter/webhook`
- [ ] Monitor database query performance
- [ ] Alert on webhook failures
- [ ] Track job sync success rate

## Rollback Plan

If issues occur:
1. [ ] Stop new recruiter signups
2. [ ] Disable sync jobs button
3. [ ] Hide recruiter profile link
4. [ ] Revert to previous version
5. [ ] Investigate issue in staging
6. [ ] Re-deploy fix

## Documentation

- [ ] `RECRUITER_PROFILE_GUIDE.md` - Technical docs ✅
- [ ] `RECRUITER_PROFILE_SETUP.md` - Implementation summary ✅
- [ ] `RECRUITER_INTEGRATION_EXAMPLES.md` - Code examples ✅
- [ ] Share docs with team
- [ ] Update main README.md with feature mention

## Feature Flag (Optional)

If you want to gradually roll out:
```typescript
// lib/featureFlags.ts
export const features = {
  recruiterProfile: process.env.FEATURE_RECRUITER_PROFILE === 'true',
};

// In page: if (!features.recruiterProfile) redirect('/');
```

## API Documentation

- [ ] Update API documentation with new endpoints
- [ ] Create postman collection for testing
- [ ] Document webhook schema
- [ ] Document error codes and responses
- [ ] Share with recruiter partners

## Marketing/Support

- [ ] Prepare recruiter onboarding guide
- [ ] Create tutorial video (optional)
- [ ] Set up webhook endpoint examples repo
- [ ] Create FAQ for common issues
- [ ] Set up support email/channel for recruiter questions

## Monitoring Queries

Add these to your monitoring dashboard:

### Recruiter Signups
```sql
SELECT COUNT(*) as new_recruiters, DATE(created_at) as date
FROM recruiter_profiles
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Job Syncs
```sql
SELECT COUNT(*) as synced_jobs, recruiter_id, MAX(last_synced_at) as last_sync
FROM synced_jobs
GROUP BY recruiter_id
ORDER BY last_sync DESC;
```

### Applications
```sql
SELECT 
  COUNT(*) as total_applications,
  SUM(CASE WHEN webhook_status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN webhook_status = 'failed' THEN 1 ELSE 0 END) as failed
FROM job_applications
WHERE created_at > NOW() - INTERVAL '7 days';
```

## Known Issues / Limitations

### Current MVP Limitations
- [ ] No auto-sync scheduling (manual only)
- [ ] No webhook retry mechanism yet
- [ ] No business verification yet
- [ ] No candidate-recruiter messaging
- [ ] No analytics dashboard

### Future Enhancements Needed
- [ ] Email verification for recruiters
- [ ] Document upload for verification
- [ ] Custom webhook URL management
- [ ] Job analytics dashboard
- [ ] Bulk operations (import/export)
- [ ] Integration with ATS systems

## Sign-Off

- [ ] Development complete
- [ ] Testing complete
- [ ] Code review approved
- [ ] Product approval
- [ ] Ready to deploy

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Verified By:** _____________

## Post-Deployment Notes

_Add any issues or observations here:_

```
[Space for notes]
```
