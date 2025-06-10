# Simple Donation Platform - Minimal Architecture
## SvelteKit + Mpesa Integration

---

## Simplified File Structure

```
donation-platform/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ProjectCard.svelte
│   │   │   ├── DonationForm.svelte
│   │   │   ├── AdminLogin.svelte
│   │   │   └── PaymentStatus.svelte
│   │   ├── stores/
│   │   │   ├── projects.js
│   │   │   └── donations.js
│   │   ├── utils/
│   │   │   ├── mpesa.js
│   │   │   └── database.js
│   │   └── database.sql
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte                    // Homepage - list projects
│   │   ├── donate/
│   │   │   └── [id]/
│   │   │       └── +page.svelte            // Donation form
│   │   ├── admin/
│   │   │   ├── +page.svelte                // Admin dashboard
│   │   │   └── login/
│   │   │       └── +page.svelte            // Admin login
│   │   └── api/
│   │       ├── projects/
│   │       │   └── +server.js              // CRUD projects
│   │       ├── donations/
│   │       │   └── +server.js              // Handle donations
│   │       └── mpesa/
│   │           └── +server.js              // Mpesa callbacks
│   └── app.html
├── .env
└── package.json
```

---

## Core Components (4 Total)

### 1. ProjectCard.svelte
**Purpose**: Display project info with donate button
```svelte
<script>
  export let project;
</script>

<div class="card">
  <h3>{project.title}</h3>
  <p>{project.description}</p>
  <div class="progress">
    <div class="bar" style="width: {project.progress}%"></div>
  </div>
  <p>KSh {project.current_amount} / KSh {project.target_amount}</p>
  <a href="/donate/{project.id}">Donate Now</a>
</div>
```

### 2. DonationForm.svelte
**Purpose**: Collect donation amount and phone number
```svelte
<script>
  import { donations } from '$lib/stores/donations.js';
  
  export let projectId;
  let amount = '';
  let phone = '';
  let donorName = '';
  let anonymous = false;
</script>

<form on:submit={handleDonate}>
  <input bind:value={amount} placeholder="Amount (KSh)" required />
  <input bind:value={phone} placeholder="Phone (07xxxxxxxx)" required />
  <input bind:value={donorName} placeholder="Your name (optional)" />
  <label>
    <input type="checkbox" bind:checked={anonymous} />
    Donate anonymously
  </label>
  <button type="submit">Pay with Mpesa</button>
</form>
```

### 3. AdminLogin.svelte
**Purpose**: Simple admin authentication
```svelte
<script>
  let email = '';
  let password = '';
</script>

<form on:submit={handleLogin}>
  <input bind:value={email} type="email" placeholder="Admin Email" required />
  <input bind:value={password} type="password" placeholder="Password" required />
  <button type="submit">Login</button>
</form>
```

### 4. PaymentStatus.svelte
**Purpose**: Show payment progress
```svelte
<script>
  export let status; // 'pending', 'success', 'failed'
</script>

{#if status === 'pending'}
  <p>⏳ Processing payment...</p>
{:else if status === 'success'}
  <p>✅ Payment successful! Thank you for your donation.</p>
{:else if status === 'failed'}
  <p>❌ Payment failed. Please try again.</p>
{/if}
```

---

## Simple State Management

### Projects Store (`src/lib/stores/projects.js`)
```javascript
import { writable } from 'svelte/store';

export const projects = writable([]);

export async function loadProjects() {
  const response = await fetch('/api/projects');
  const data = await response.json();
  projects.set(data);
}
```

### Donations Store (`src/lib/stores/donations.js`)
```javascript
import { writable } from 'svelte/store';

export const currentDonation = writable(null);
export const paymentStatus = writable('idle');

export async function makeDonation(projectId, amount, phone, donorName, anonymous) {
  paymentStatus.set('pending');
  
  const response = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, amount, phone, donorName, anonymous })
  });
  
  const result = await response.json();
  
  if (result.success) {
    paymentStatus.set('success');
  } else {
    paymentStatus.set('failed');
  }
  
  return result;
}
```

---

## Database Schema (3 Tables)

```sql
-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0
);

-- Donations table
CREATE TABLE donations (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  amount INTEGER NOT NULL,
  donor_name TEXT,
  donor_phone TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  mpesa_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

---

## API Routes (3 Files)

### 1. Projects API (`src/routes/api/projects/+server.js`)
```javascript
import { db } from '$lib/utils/database.js';

export async function GET() {
  const projects = await db.all('SELECT * FROM projects');
  return new Response(JSON.stringify(projects));
}

export async function POST({ request }) {
  const { title, description, target_amount } = await request.json();
  
  await db.run(
    'INSERT INTO projects (id, title, description, target_amount) VALUES (?, ?, ?, ?)',
    [crypto.randomUUID(), title, description, target_amount]
  );
  
  return new Response(JSON.stringify({ success: true }));
}
```

### 2. Donations API (`src/routes/api/donations/+server.js`)
```javascript
import { initiateMpesaPayment } from '$lib/utils/mpesa.js';
import { db } from '$lib/utils/database.js';

export async function POST({ request }) {
  const { projectId, amount, phone, donorName, anonymous } = await request.json();
  
  // Create donation record
  const donationId = crypto.randomUUID();
  await db.run(
    'INSERT INTO donations (id, project_id, amount, donor_name, donor_phone, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)',
    [donationId, projectId, amount, anonymous ? null : donorName, phone, anonymous]
  );
  
  // Initiate Mpesa payment
  const mpesaResult = await initiateMpesaPayment(phone, amount, donationId);
  
  return new Response(JSON.stringify({ 
    success: true, 
    donationId,
    message: 'Check your phone for Mpesa prompt'
  }));
}
```

### 3. Mpesa API (`src/routes/api/mpesa/+server.js`)
```javascript
import { db } from '$lib/utils/database.js';

export async function POST({ request }) {
  const mpesaCallback = await request.json();
  
  // Process Mpesa callback
  const { CheckoutRequestID, ResultCode, ResultDesc } = mpesaCallback.Body.stkCallback;
  
  if (ResultCode === 0) {
    // Payment successful
    const mpesaCode = mpesaCallback.Body.stkCallback.CallbackMetadata?.Item
      ?.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
    
    // Update donation status
    await db.run(
      'UPDATE donations SET status = ?, mpesa_code = ? WHERE id = ?',
      ['completed', mpesaCode, donationId]
    );
    
    // Update project total
    await db.run(`
      UPDATE projects SET current_amount = (
        SELECT SUM(amount) FROM donations 
        WHERE project_id = projects.id AND status = 'completed'
      ) WHERE id = ?
    `, [projectId]);
  }
  
  return new Response('OK');
}
```

---

## Utility Functions

### Database (`src/lib/utils/database.js`)
```javascript
import Database from 'better-sqlite3';

const db = new Database('donations.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_amount INTEGER NOT NULL,
    current_amount INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    amount INTEGER NOT NULL,
    donor_name TEXT,
    donor_phone TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    mpesa_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export { db };
```

### Mpesa Integration (`src/lib/utils/mpesa.js`)
```javascript
export async function initiateMpesaPayment(phone, amount, reference) {
  // Get access token
  const auth = btoa(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`);
  
  const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  
  const { access_token } = await tokenResponse.json();
  
  // Initiate STK push
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = btoa(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`);
  
  const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: `${process.env.PUBLIC_APP_URL}/api/mpesa`,
      AccountReference: reference,
      TransactionDesc: 'Donation'
    })
  });
  
  return await stkResponse.json();
}
```

---

## Pages (4 Total)

### Homepage (`src/routes/+page.svelte`)
```svelte
<script>
  import { onMount } from 'svelte';
  import { projects, loadProjects } from '$lib/stores/projects.js';
  import ProjectCard from '$lib/components/ProjectCard.svelte';
  
  onMount(loadProjects);
</script>

<h1>Support Our Projects</h1>

<div class="projects-grid">
  {#each $projects as project}
    <ProjectCard {project} />
  {/each}
</div>

<style>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
</style>
```

### Donation Page (`src/routes/donate/[id]/+page.svelte`)
```svelte
<script>
  import DonationForm from '$lib/components/DonationForm.svelte';
  import PaymentStatus from '$lib/components/PaymentStatus.svelte';
  import { paymentStatus } from '$lib/stores/donations.js';
  
  export let data; // project data from +page.server.js
</script>

<h1>Donate to {data.project.title}</h1>

{#if $paymentStatus === 'idle'}
  <DonationForm projectId={data.project.id} />
{:else}
  <PaymentStatus status={$paymentStatus} />
{/if}
```

### Admin Dashboard (`src/routes/admin/+page.svelte`)
```svelte
<script>
  import { onMount } from 'svelte';
  import { projects, loadProjects } from '$lib/stores/projects.js';
  
  let newProject = { title: '', description: '', target_amount: '' };
  
  async function createProject() {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject)
    });
    
    loadProjects();
    newProject = { title: '', description: '', target_amount: '' };
  }
  
  onMount(loadProjects);
</script>

<h1>Admin Dashboard</h1>

<h2>Create New Project</h2>
<form on:submit|preventDefault={createProject}>
  <input bind:value={newProject.title} placeholder="Project Title" required />
  <textarea bind:value={newProject.description} placeholder="Description" required></textarea>
  <input bind:value={newProject.target_amount} type="number" placeholder="Target Amount" required />
  <button type="submit">Create Project</button>
</form>

<h2>All Projects</h2>
{#each $projects as project}
  <div class="project-row">
    <h3>{project.title}</h3>
    <p>KSh {project.current_amount} / KSh {project.target_amount}</p>
  </div>
{/each}
```

### Admin Login (`src/routes/admin/login/+page.svelte`)
```svelte
<script>
  import AdminLogin from '$lib/components/AdminLogin.svelte';
</script>

<h1>Admin Login</h1>
<AdminLogin />
```

---

## Environment Variables (.env)
```bash
# Mpesa Sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret  
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey

# App
PUBLIC_APP_URL=http://localhost:5173
```

---

## How It All Connects

1. **User visits homepage** → Loads projects from database
2. **User clicks donate** → Opens donation form
3. **User submits form** → Creates donation record + initiates Mpesa
4. **Mpesa processes payment** → Sends callback to `/api/mpesa`
5. **Callback received** → Updates donation status + project total
6. **Admin manages projects** → Simple CRUD via admin dashboard

**That's it!** This minimal architecture gives you:
- ✅ Anonymous donations
- ✅ Mpesa integration  
- ✅ Admin project management
- ✅ Real-time payment status
- ✅ Simple database with 3 tables
- ✅ 4 components, 4 pages, 3 API routes

Total: **~15 files** for a complete donation platform!