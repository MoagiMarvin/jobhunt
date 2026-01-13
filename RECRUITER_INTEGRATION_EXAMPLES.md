# Quick Integration Guide for Recruiters

## For Recruiter Websites

If you're a recruiter integrating with JobHunt, here's what you need to do:

### Step 1: Create Your Profile
1. Visit `https://jobhunt.com/recruiter/profile`
2. Fill in your company information
3. Add your specializations
4. Save

### Step 2: Connect Your Job Board

Choose one of three options:

#### Option A: RSS Feed (Easiest)
If your website has an RSS feed of jobs:
1. Click "Recruiter Profile"
2. Set Feed Type to "RSS Feed"
3. Paste your RSS feed URL (e.g., `https://yoursite.com/jobs/feed.xml`)
4. Click "Sync Jobs Now"

**Your RSS feed should look like:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Your Company Jobs</title>
    <item>
      <title>Senior Developer</title>
      <description>Job description here...</description>
      <link>https://yoursite.com/jobs/123</link>
      <pubDate>Mon, 13 Jan 2025 10:00:00 GMT</pubDate>
      <guid>123</guid>
    </item>
  </channel>
</rss>
```

#### Option B: JSON API (For Custom Systems)
If you have an API endpoint that returns jobs:
1. Set Feed Type to "JSON API"
2. Paste your API endpoint (e.g., `https://api.yoursite.com/jobs`)
3. Click "Sync Jobs Now"

**Your API should return:**
```json
[
  {
    "id": "123",
    "title": "Senior Developer",
    "description": "Job description here...",
    "location": "San Francisco, CA",
    "job_type": "Full-time",
    "salary_min": 150000,
    "salary_max": 200000,
    "apply_url": "https://yoursite.com/jobs/123",
    "posted_date": "2025-01-13T10:00:00Z"
  }
]
```

#### Option C: XML Sitemap
If you expose a sitemap of job URLs:
1. Set Feed Type to "XML Sitemap"
2. Paste your sitemap URL (e.g., `https://yoursite.com/sitemap-jobs.xml`)
3. Click "Sync Jobs Now"

### Step 3: Handle Applications (Webhook)

When candidates apply on JobHunt, we'll send their application to your system via webhook.

**Setup your webhook endpoint to receive:**

```json
{
  "event": "job_application",
  "data": {
    "syncedJobId": "uuid",
    "candidateName": "Jane Smith",
    "candidateEmail": "jane@example.com",
    "resumeUrl": "https://jobhunt.com/storage/resumes/jane.pdf",
    "coverLetter": "I'm interested in this role because..."
  },
  "timestamp": "2025-01-13T15:30:00Z"
}
```

**Your endpoint should:**
1. Accept POST requests
2. Log the application in your system
3. Return a 200 response with:
```json
{
  "success": true,
  "applicationId": "your-internal-id"
}
```

## Code Examples

### Ruby on Rails
```ruby
# config/routes.rb
post '/webhooks/jobhunt', to: 'webhooks#jobhunt_application'

# app/controllers/webhooks_controller.rb
class WebhooksController < ApplicationController
  def jobhunt_application
    data = params[:data]
    
    Application.create!(
      candidate_name: data[:candidateName],
      candidate_email: data[:candidateEmail],
      resume_url: data[:resumeUrl],
      cover_letter: data[:coverLetter],
      source: 'jobhunt'
    )
    
    render json: { success: true, applicationId: "app_#{Time.now.to_i}" }
  end
end
```

### Node.js/Express
```javascript
app.post('/webhooks/jobhunt', express.json(), async (req, res) => {
  const { data } = req.body;
  
  const application = await Application.create({
    candidateName: data.candidateName,
    candidateEmail: data.candidateEmail,
    resumeUrl: data.resumeUrl,
    coverLetter: data.coverLetter,
    source: 'jobhunt'
  });
  
  res.json({ 
    success: true, 
    applicationId: `app_${Date.now()}` 
  });
});
```

### Python/Flask
```python
from flask import Flask, request, jsonify

@app.route('/webhooks/jobhunt', methods=['POST'])
def jobhunt_application():
    data = request.json.get('data')
    
    application = Application.create(
        candidate_name=data['candidateName'],
        candidate_email=data['candidateEmail'],
        resume_url=data['resumeUrl'],
        cover_letter=data['coverLetter'],
        source='jobhunt'
    )
    
    return jsonify({
        'success': True,
        'applicationId': f'app_{int(time.time())}'
    })
```

### PHP/Laravel
```php
Route::post('/webhooks/jobhunt', function (Request $request) {
    $data = $request->input('data');
    
    $application = Application::create([
        'candidate_name' => $data['candidateName'],
        'candidate_email' => $data['candidateEmail'],
        'resume_url' => $data['resumeUrl'],
        'cover_letter' => $data['coverLetter'],
        'source' => 'jobhunt'
    ]);
    
    return response()->json([
        'success' => true,
        'applicationId' => 'app_' . time()
    ]);
});
```

## Testing Your Integration

### Test RSS Feed
```bash
curl -H "Accept: application/rss+xml" https://yoursite.com/jobs/feed.xml
```

### Test JSON API
```bash
curl https://api.yoursite.com/jobs
```

### Test Webhook (from JobHunt team)
```bash
curl -X POST https://yoursite.com/webhooks/jobhunt \
  -H "Content-Type: application/json" \
  -d '{
    "event": "job_application",
    "data": {
      "syncedJobId": "test-id",
      "candidateName": "Test User",
      "candidateEmail": "test@example.com",
      "resumeUrl": "https://jobhunt.com/test.pdf",
      "coverLetter": "Test application"
    },
    "timestamp": "2025-01-13T15:30:00Z"
  }'
```

## Webhook Retry Policy

If your webhook endpoint returns an error, we'll retry:
- 1st retry: 5 minutes later
- 2nd retry: 30 minutes later
- 3rd retry: 2 hours later
- Final retry: 24 hours later

## Troubleshooting

### Jobs aren't syncing
- Check your feed URL is publicly accessible
- Verify feed format (RSS, JSON, or XML)
- Ensure required fields are present:
  - **RSS:** title, link, guid
  - **JSON:** id, title, apply_url
  - **Sitemap:** loc

### Applications not being received
- Verify webhook URL in JobHunt profile
- Test endpoint with curl (see above)
- Check endpoint returns 200 status
- Review logs for incoming POST requests
- Ensure CORS is configured if applicable

### Jobs disappearing
- Each sync replaces old jobs (we keep latest)
- Jobs must be in your feed to remain synced
- Archive old jobs on your side if needed

## Support

Need help?
- Email: support@jobhunt.com
- Check job feed format at: https://jobhunt.com/integrations/help
- View your sync logs in Recruiter Profile

## FAQ

**Q: How often do jobs sync?**
A: On-demand when you click "Sync Jobs Now" or via API. Auto-sync coming soon.

**Q: Do candidates apply directly on your site?**
A: No, they apply on JobHunt. We forward applications to you.

**Q: Can I see who viewed my jobs?**
A: Not yet, but job analytics coming in Q1 2025.

**Q: Can I filter which jobs appear on JobHunt?**
A: Yes, manage which jobs sync by your feed structure.

**Q: Is there a cost?**
A: Free for MVP. Premium features coming later.
