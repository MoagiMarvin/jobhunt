# Recruiter Talent Group Management Feature

## Overview
Added the ability for recruiters to create groups (like "Doctor - City Hospital" or "Senior Developer - TechCorp") and save candidates directly from the talent search results.

## What's New

### 1. **Group Management**
   - Create custom groups with a name and optional description
   - Groups appear in the recruiter's saved candidates dashboard
   - Example names: "Doctor - Hospital XYZ", "Senior Developer - Tech Company", "Nurse - Clinic ABC"

### 2. **Save Candidates to Groups**
   - New **"Save to Group"** button (folder icon) on each talent card
   - Click the button to open a modal where you can:
     - Select an existing group or create a new one
     - Add personal notes about why you saved this candidate
     - Save the candidate to your chosen group

### 3. **Saved Candidates Dashboard**
   - New page: **Recruiter > Saved Candidates** (`/recruiter/groups`)
   - View all your groups on the left sidebar
   - Select a group to see all candidates saved to it
   - For each candidate, see:
     - Name, headline, and sector
     - Notes you added when saving
     - Date saved
     - Quick actions: Email, Add Note, Remove

## Files Added/Modified

### New Files Created:
- `src/app/api/groups/route.ts` - API to create and list groups
- `src/app/api/groups/[groupId]/route.ts` - API to save and retrieve candidates from groups
- `src/components/recruiter/SaveToGroupModal.tsx` - Modal component for saving candidates
- `src/app/recruiter/groups/page.tsx` - Dashboard to view saved candidates by group

### Modified Files:
- `src/components/recruiter/TalentCard.tsx` - Added "Save to Group" button and modal integration
- `src/components/Navbar.tsx` - Added link to Saved Candidates page
- `supabase/schema.sql` - Added database tables for groups and saved candidates

## Database Schema Updates

```sql
-- TALENT GROUPS (For Recruiters to organize candidates)
create table public.talent_groups (
  id uuid primary key,
  recruiter_id uuid (user ID),
  name text (e.g., "Doctor - Hospital XYZ"),
  description text (optional),
  created_at timestamp,
  updated_at timestamp
);

-- SAVED CANDIDATES (In Groups)
create table public.saved_candidates (
  id uuid primary key,
  group_id uuid (reference to talent_groups),
  talent_id text,
  talent_name text,
  talent_headline text,
  talent_sector text,
  notes text (recruiter's notes),
  saved_at timestamp
);
```

## Usage Flow

1. **Search for Talent** → Go to Recruiter Portal `/recruiter/search`
2. **Find a Candidate** → Browse and filter candidates
3. **Save to Group** → Click the folder icon on any talent card
4. **Select/Create Group** → Choose an existing group or create a new one:
   - Name: "Doctor - City Hospital"
   - Description: Optional (e.g., "Cardiology Department")
5. **Add Notes** → Optional notes about the candidate
6. **View Saved Candidates** → Go to "Saved Candidates" in navbar
7. **Manage & Contact** → View all saved candidates organized by group

## Next Steps (Optional Enhancements)

- Send bulk emails to candidates in a group
- Export candidate list from a group
- Archive/delete groups
- Add candidates to multiple groups
- Tag candidates within a group
- Search/filter candidates within a group
- Contact history tracking
