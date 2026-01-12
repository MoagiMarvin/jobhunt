# Quick Start Guide: Recruiter Group Management

## What You Can Do Now

### 1. **Create Groups** 
   - Go to `/recruiter/search` (Recruiter Portal)
   - Find a candidate you like
   - Click the **folder + icon** on their card
   - Click **"New"** to create a new group
   - Enter group name (e.g., "Doctor - City Hospital")
   - Optionally add description
   - Click **"Create Group"**

### 2. **Save Candidates to Groups**
   - Click the **folder + icon** again on any talent card
   - Select your group from the list
   - Add optional notes (e.g., "Great bedside manner, 5+ years ICU experience")
   - Click **"Save Candidate"**
   - Button turns green to confirm save

### 3. **View & Manage Saved Candidates**
   - Click **"Saved Candidates"** in the navbar
   - View all your groups on the left
   - Click a group to see all saved candidates
   - For each candidate, you can:
     - ✉️ Email them
     - 💬 Add notes
     - 🗑️ Remove from group

## Example Scenarios

### Hiring a Doctor for a Hospital
```
1. Create group: "Doctor - Cardiology - City General"
2. Search and save suitable doctors
3. Later review all doctor candidates in one place
4. Reach out to your top choices
```

### Recruitment Agency - Multiple Positions
```
1. Create groups per client role:
   - "Engineer - Company A"
   - "Manager - Company B"
   - "Designer - Company C"
2. Save relevant candidates to each group
3. Track who you've saved where
4. Contact candidates in batches per position
```

### Building a Talent Pipeline
```
1. Create group: "Junior Developer Pipeline"
2. Save promising junior developers
3. Review their notes periodically
4. When a position opens, contact saved candidates
```

## Database Tables (Behind the Scenes)

```
talent_groups
├── id: unique group ID
├── recruiter_id: who created it
├── name: "Doctor - City Hospital"
├── description: optional notes about the group
└── created_at/updated_at

saved_candidates
├── id: unique candidate record
├── group_id: which group they're in
├── talent_id: candidate ID
├── talent_name: "Dr. John Smith"
├── talent_headline: "Board Certified Cardiologist"
├── talent_sector: "Healthcare"
├── notes: recruiter's notes about this candidate
└── saved_at: when they were saved
```

## API Endpoints

```
GET  /api/groups              - List all groups
POST /api/groups              - Create new group
GET  /api/groups/[groupId]    - List candidates in group
POST /api/groups/[groupId]    - Save candidate to group
```

## Testing

Currently using mock data, so:
- All groups are stored in memory (session-based)
- Refresh the page = data resets
- Ready to connect to Supabase when needed
- Database schema already created in supabase/schema.sql

## Future Enhancements

- [ ] Bulk email candidates from a group
- [ ] Export candidates to CSV
- [ ] Archive/delete groups
- [ ] Add candidates to multiple groups
- [ ] Tag candidates within groups
- [ ] Search candidates within a group
- [ ] Candidate status tracking (contacted, rejected, hired)
- [ ] Integration with email service
- [ ] Group statistics/insights
