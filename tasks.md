# Donation Platform MVP - Granular Build Plan

## Phase 1: Project Setup & Foundation

### Task 1.1: Initialize SvelteKit Project
**Goal**: Create basic SvelteKit project structure
**End**: Working SvelteKit app on localhost:5173
**Test**: Visit localhost:5173 and see "Welcome to SvelteKit" page

**Steps**:

4. `npm run dev`
5. Verify app loads in browser

---

### Task 1.2: Install Required Dependencies
**Goal**: Add all necessary packages for the MVP
**Start**: Fresh SvelteKit project
**End**: All dependencies installed and ready
**Test**: `npm run dev` still works without errors

**Dependencies to install**:
```bash
npm install sqlite3
npm install dotenv
```

**Verify**: Check package.json contains the new dependencies

---

### Task 1.3: Create Environment Configuration
**Goal**: Set up environment variables for Mpesa
**Start**: Project with dependencies
**End**: .env file with Mpesa sandbox credentials
**Test**: Environment variables load correctly

**Files to create**:
- `.env.example` with template
- `.env` with actual values (gitignored)
- Update `.gitignore` to include `.env`

**Template**:
```bash
MPESA_CONSUMER_KEY=your_key_here
MPESA_CONSUMER_SECRET=your_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
PUBLIC_APP_URL=http://localhost:5173
```

---

## Phase 2: Database Layer

### Task 2.1: Create Database Utility
**Goal**: Set up SQLite database connection and basic utilities
**Start**: Project with dependencies
**End**: Working database connection in `src/lib/utils/database.js`
**Test**: Database file is created and connection works

**File**: `src/lib/utils/database.js`
**Content**: Database initialization with better-sqlite3
**Test**: Import the file and verify no errors, check if `.db` file is created

---

### Task 2.2: Create Database Schema
**Goal**: Define and create all required tables
**Start**: Database utility exists
**End**: All tables created with proper structure
**Test**: Query each table and verify structure

**Tables to create**:
1. `projects` table with all required columns
2. `donations` table with foreign key to projects
3. `admin_users` table for authentication

**Test SQL**:
```sql
.schema projects
.schema donations  
.schema admin_users
```

---

### Task 2.3: Seed Initial Data
**Goal**: Add sample projects and one admin user
**Start**: Empty database tables
**End**: Database with test data for development
**Test**: Query tables and verify sample data exists

**Sample data**:
- 3 sample projects with different target amounts
- 1 admin user (email: admin@test.com, password: hashed)
- No donations initially

**Test**: 
```sql
SELECT COUNT(*) FROM projects; -- Should return 3
SELECT COUNT(*) FROM admin_users; -- Should return 1
```

---

## Phase 3: Basic UI Components

### Task 3.1: Create ProjectCard Component
**Goal**: Build reusable project display component
**Start**: Clean SvelteKit app
**End**: Working ProjectCard.svelte component
**Test**: Component renders with mock data

**File**: `src/lib/components/ProjectCard.svelte`
**Props**: `project` object
**Test**: Import in a test page and pass mock project data

**Mock test data**:
```javascript
{
  id: '1',
  title: 'Test Project',
  description: 'Test description',
  target_amount: 50000,
  current_amount: 15000
}
```

---

### Task 3.2: Create Basic Layout
**Goal**: Set up site-wide layout with header and navigation
**Start**: Default SvelteKit layout
**End**: Custom layout with header and basic styling
**Test**: Layout appears on all pages consistently

**File**: `src/routes/+layout.svelte`
**Content**: Header with site title, basic navigation, footer
**Test**: Navigate between pages and verify layout persists

---

### Task 3.3: Create Homepage
**Goal**: Display list of projects on homepage
**Start**: Basic layout exists
**End**: Homepage showing project cards
**Test**: Homepage loads and displays project cards

**File**: `src/routes/+page.svelte`
**Content**: Grid of ProjectCard components
**Test**: Visit homepage and see projects displayed in grid format

---

## Phase 4: Projects Store & API

### Task 4.1: Create Projects Store
**Goal**: Set up Svelte store for projects state management
**Start**: Components exist but no state management
**End**: Working projects store with load function
**Test**: Store updates and components react to changes

**File**: `src/lib/stores/projects.js`
**Functions**: 
- `projects` writable store
- `loadProjects()` async function
**Test**: Import store, call loadProjects(), verify data flows to components

---

### Task 4.2: Create Projects API Endpoint
**Goal**: Build API to serve projects data
**Start**: Database with sample projects
**End**: GET /api/projects returns JSON data
**Test**: curl or browser request returns project list

**File**: `src/routes/api/projects/+server.js`
**Methods**: GET (list all projects)
**Test**: 
```bash
curl http://localhost:5173/api/projects
# Should return JSON array of projects
```

---

### Task 4.3: Connect Homepage to API
**Goal**: Load real data from database on homepage
**Start**: Homepage with mock data
**End**: Homepage loading from API via store
**Test**: Homepage shows real database projects

**Changes**: Update `+page.svelte` to use store and API
**Test**: 
1. Refresh homepage
2. Verify projects load from database
3. Add project in database, refresh, verify it appears

---

## Phase 5: Donation Form

### Task 5.1: Create DonationForm Component
**Goal**: Build form to collect donation details
**Start**: ProjectCard component exists
**End**: Working donation form component
**Test**: Form renders and validates input

**File**: `src/lib/components/DonationForm.svelte`
**Fields**: amount, phone, donor_name, anonymous checkbox
**Test**: Fill form, submit, verify all data is captured correctly

---

### Task 5.2: Create Donation Page Route
**Goal**: Build dedicated page for making donations
**Start**: DonationForm component exists
**End**: /donate/[id] page shows project + donation form
**Test**: Navigate to donation page and see form

**File**: `src/routes/donate/[id]/+page.svelte`
**Content**: Project details + DonationForm
**Test**: Visit `/donate/1` and see project info with donation form

---

### Task 5.3: Add Donate Buttons to ProjectCards
**Goal**: Link project cards to donation page
**Start**: ProjectCard displays info only
**End**: Each card has working "Donate" button
**Test**: Click donate button navigates to correct donation page

**Changes**: Add link/button to ProjectCard component
**Test**: Click donate on different projects, verify correct project ID in URL

---

## Phase 6: Donations Store & Basic Flow

### Task 6.1: Create Donations Store
**Goal**: Set up state management for donation process
**Start**: DonationForm exists but no state management
**End**: Working donations store with status tracking
**Test**: Store updates during donation flow

**File**: `src/lib/stores/donations.js`
**State**: currentDonation, paymentStatus
**Functions**: makeDonation()
**Test**: Trigger donation, verify store state updates

---

### Task 6.2: Create Donations API Endpoint
**Goal**: Handle donation creation in database
**Start**: Database schema exists
**End**: POST /api/donations creates donation record
**Test**: API creates donation and returns success

**File**: `src/routes/api/donations/+server.js`
**Method**: POST (create donation)
**Test**:
```bash
curl -X POST http://localhost:5173/api/donations \
  -H "Content-Type: application/json" \
  -d '{"projectId":"1","amount":1000,"phone":"0712345678"}'
```

---

### Task 6.3: Connect Form to API
**Goal**: Make donation form submit to API
**Start**: Form exists, API exists separately
**End**: Form submission creates database record
**Test**: Submit form, verify donation appears in database

**Changes**: Add form submission handler in DonationForm
**Test**: 
1. Fill donation form
2. Submit
3. Check database for new donation record

---

## Phase 7: Payment Status UI

### Task 7.1: Create PaymentStatus Component
**Goal**: Show payment progress and results to user
**Start**: Donations flow creates records
**End**: Component shows pending/success/failed states
**Test**: Component displays different states correctly

**File**: `src/lib/components/PaymentStatus.svelte`
**Props**: status ('pending', 'success', 'failed')
**Test**: Pass different status values, verify correct messages/icons show

---

### Task 7.2: Update Donation Page with Status
**Goal**: Show payment status after form submission
**Start**: Donation page only shows form
**End**: Page shows status component after submission
**Test**: Submit donation, see status change from form to status display

**Changes**: Conditionally render form vs status in donation page
**Test**: 
1. Visit donation page
2. Submit form
3. Verify status component replaces form

---

## Phase 8: Mpesa Integration

### Task 8.1: Create Mpesa Utility Functions
**Goal**: Build Mpesa API integration utilities
**Start**: Environment variables set
**End**: Working functions for token and STK push
**Test**: Functions can get token and initiate payment

**File**: `src/lib/utils/mpesa.js`
**Functions**: 
- `getMpesaToken()`
- `initiateMpesaPayment(phone, amount, reference)`
**Test**: Call functions with test data, verify no errors

---

### Task 8.2: Integrate Mpesa with Donations API
**Goal**: Trigger Mpesa payment when donation is created
**Start**: Donations API creates database records
**End**: API also initiates Mpesa STK push
**Test**: Create donation triggers phone prompt

**Changes**: Update donations API to call Mpesa functions
**Test**: 
1. Submit donation with real phone number
2. Verify STK push prompt appears on phone
3. Verify API returns success response

---

### Task 8.3: Create Mpesa Callback Handler
**Goal**: Handle Mpesa payment confirmations
**Start**: STK push works but no callback handling
**End**: Callback updates donation status in database
**Test**: Successful payment updates database

**File**: `src/routes/api/mpesa/+server.js`
**Method**: POST (handle callbacks)
**Test**: Mock callback payload, verify donation status updates

---

## Phase 9: Project Total Updates

### Task 9.1: Update Project Totals on Payment
**Goal**: Increment project current_amount when donations complete
**Start**: Donations complete but project totals don't update
**End**: Successful payments update project totals
**Test**: Complete payment, verify project total increases

**Changes**: Update Mpesa callback to recalculate project totals
**Test**:
1. Note project current_amount
2. Complete donation
3. Verify project current_amount increased

---

### Task 9.2: Update Progress Display
**Goal**: Show real-time progress on project cards
**Start**: Project cards show static progress
**End**: Progress bars reflect actual donation totals
**Test**: Progress bar matches calculated percentage

**Changes**: Calculate progress percentage in ProjectCard
**Test**: Verify progress bar width matches (current/target * 100)%

---

## Phase 10: Admin Authentication

### Task 10.1: Create AdminLogin Component
**Goal**: Build login form for admin access
**Start**: Admin user exists in database
**End**: Working login form component
**Test**: Form captures email/password correctly

**File**: `src/lib/components/AdminLogin.svelte`
**Fields**: email, password
**Test**: Fill form, verify data is captured on submission

---

### Task 10.2: Create Admin Auth API
**Goal**: Handle admin login requests
**Start**: AdminLogin component exists
**End**: API validates credentials and returns success/error
**Test**: Correct credentials return success, wrong ones fail

**File**: `src/routes/api/admin/auth/+server.js`
**Method**: POST (login)
**Test**: 
```bash
# Test valid login
curl -X POST http://localhost:5173/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

---

### Task 10.3: Create Admin Login Page
**Goal**: Dedicated page for admin login
**Start**: AdminLogin component exists
**End**: /admin/login page with login form
**Test**: Page loads and login form works

**File**: `src/routes/admin/login/+page.svelte`
**Content**: AdminLogin component
**Test**: Visit `/admin/login`, verify form works

---

## Phase 11: Admin Dashboard

### Task 11.1: Create Basic Admin Dashboard
**Goal**: Landing page for authenticated admins
**Start**: Admin login works
**End**: Basic dashboard showing projects list
**Test**: Dashboard loads and displays projects

**File**: `src/routes/admin/+page.svelte`
**Content**: List of all projects with current totals
**Test**: Login as admin, navigate to dashboard, see projects

---

### Task 11.2: Add Project Creation Form
**Goal**: Allow admins to create new projects
**Start**: Dashboard shows existing projects
**End**: Form to create new projects works
**Test**: Create new project, verify it appears in database and homepage

**Changes**: Add create form to admin dashboard
**Test**:
1. Fill project creation form
2. Submit
3. Verify new project in database
4. Check homepage shows new project

---

### Task 11.3: Add Admin Project Management
**Goal**: Basic CRUD operations for projects
**Start**: Can create projects only
**End**: Can view, edit, and delete projects
**Test**: All CRUD operations work correctly

**Changes**: Add edit/delete buttons and forms
**Test**: 
1. Edit project details
2. Delete project
3. Verify changes persist in database

---

## Phase 12: Final Integration & Testing

### Task 12.1: End-to-End Donation Flow Test
**Goal**: Verify complete donation process works
**Start**: All components built separately
**End**: Full flow from homepage to payment completion
**Test**: Complete donation with real phone number

**Test Steps**:
1. Visit homepage
2. Click donate on project
3. Fill donation form
4. Submit and get STK push
5. Complete payment on phone
6. Verify donation recorded
7. Verify project total updated

---

### Task 12.2: Admin Flow Integration Test
**Goal**: Verify admin functionality works end-to-end
**Start**: Admin components built separately
**End**: Complete admin workflow functional
**Test**: Login and manage projects successfully

**Test Steps**:
1. Login as admin
2. View dashboard
3. Create new project
4. Edit existing project
5. View donation totals
6. Verify all data persists

---

### Task 12.3: Error Handling & Edge Cases
**Goal**: Handle common error scenarios gracefully
**Start**: Happy path works
**End**: Error cases show appropriate messages
**Test**: Error scenarios display user-friendly messages

**Error Cases to Handle**:
1. Invalid phone number format
2. Mpesa service unavailable
3. Database connection errors
4. Invalid admin credentials
5. Missing project data

---

### Task 12.4: Basic Styling & Polish
**Goal**: Make app look presentable
**Start**: Functional but unstyled app
**End**: Clean, simple styling throughout
**Test**: App looks professional on desktop and mobile

**Styling Tasks**:
1. Add basic CSS to layout
2. Style project cards consistently
3. Style forms and buttons
4. Add responsive design for mobile
5. Ensure good contrast and readability

---

## Testing Checklist for Each Task

**Before marking a task complete, verify**:
- [ ] Code runs without errors
- [ ] Specific test criteria met
- [ ] No breaking changes to existing functionality
- [ ] Environment still works (`npm run dev`)
- [ ] Database operations succeed (if applicable)
- [ ] API endpoints return expected responses (if applicable)

## Common Debug Commands

```bash
# Check database contents
sqlite3 donations.db ".tables"
sqlite3 donations.db "SELECT * FROM projects;"
sqlite3 donations.db "SELECT * FROM donations;"

# Test API endpoints
curl http://localhost:5173/api/projects
curl -X POST http://localhost:5173/api/donations -H "Content-Type: application/json" -d '{...}'

# Check environment variables
node -e "console.log(process.env.MPESA_CONSUMER_KEY)"
```

---

**Total Tasks: 36**
**Estimated Time: 2-4 hours** (depending on experience level)
**Each task should take 5-15 minutes to complete and test**