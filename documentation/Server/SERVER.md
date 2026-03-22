# Mini-lancer — Backend Documentation

> Complete backend reference for the Mini-lancer SaaS freelancer platform.
> Last Updated: March 2026

---

## Table of Contents

1. [Tech Stack & Libraries](#1-tech-stack--libraries)
2. [Database Schema](#2-database-schema)
3. [Environment Variables](#3-environment-variables)
4. [API Endpoints](#4-api-endpoints)
   - [User](#41-user)
   - [Clients](#42-clients)
   - [Projects](#43-projects)
   - [Invoices](#44-invoices)
   - [Magic Link](#45-magic-link)
   - [Client Portal](#46-client-portal)
   - [Subscriptions](#47-subscriptions)
   - [Webhooks](#48-webhooks)
5. [Error Codes & Responses](#5-error-codes--responses)

---

## 1. Tech Stack & Libraries

### Framework & Runtime

| Technology | Version | Purpose                                 |
| ---------- | ------- | --------------------------------------- |
| Next.js    | 16.2.1  | Full-stack React framework (App Router) |
| Node.js    | 18+     | JavaScript runtime                      |
| TypeScript | 5.x     | Type safety across the entire codebase  |

### Authentication

| Library         | Version | Purpose                                             |
| --------------- | ------- | --------------------------------------------------- |
| `@clerk/nextjs` | 7.0.6   | Authentication, session management, user management |

> **Important:** In Next.js 16 the middleware file is named `proxy.ts` (not `middleware.ts`). Auth is handled via `await auth()` imported from `@clerk/nextjs/server`.

### Database & ORM

| Library          | Version | Purpose                                 |
| ---------------- | ------- | --------------------------------------- |
| MongoDB Atlas    | Cloud   | Primary database (NoSQL document store) |
| Prisma           | 6.x     | ORM for type-safe database queries      |
| `@prisma/client` | 6.x     | Auto-generated Prisma client            |

> **Important:** MongoDB does not support `prisma.$transaction` on free-tier Atlas clusters. All database operations use separate sequential `await` calls.

### Payments

| Library    | Version | Purpose                                           |
| ---------- | ------- | ------------------------------------------------- |
| `razorpay` | Latest  | Razorpay Node.js SDK for orders and subscriptions |

### Email

| Library               | Version | Purpose                                     |
| --------------------- | ------- | ------------------------------------------- |
| `resend`              | Latest  | Transactional email delivery                |
| `@react-email/render` | Latest  | Renders React components to HTML for Resend |

### Validation

| Library | Version | Purpose                                           |
| ------- | ------- | ------------------------------------------------- |
| `zod`   | Latest  | Runtime request body validation on all API routes |

### Utilities

| Library                     | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `crypto` (Node.js built-in) | Generating secure random magic link tokens |
| `svix`                      | Clerk webhook signature verification       |

---

## 2. Database Schema

The database has four core models. All relationships use `onDelete: Cascade` so deleting a User removes all their data automatically.

### User (Freelancer)

Represents the freelancer using the SaaS. The `id` is **not** auto-generated — it is set manually to match the Clerk `userId` on signup.

| Field                    | Type     | Notes                                       |
| ------------------------ | -------- | ------------------------------------------- |
| `id`                     | String   | Primary Key. Matches Clerk `userId` exactly |
| `email`                  | String   | Unique                                      |
| `name`                   | String   | Full name or business name                  |
| `razorpayCustomerId`     | String?  | Set when subscription is created            |
| `razorpaySubscriptionId` | String?  | Active Pro plan subscription ID             |
| `plan`                   | String   | `"FREE"` or `"PRO"`. Default: `"FREE"`      |
| `createdAt`              | DateTime | Auto-generated                              |
| `updatedAt`              | DateTime | Auto-updated                                |

### Client

Represents the freelancer's customers.

| Field            | Type      | Notes                                 |
| ---------------- | --------- | ------------------------------------- |
| `id`             | ObjectId  | Auto-generated                        |
| `userId`         | String    | Foreign Key → User                    |
| `name`           | String    | Client's full name                    |
| `email`          | String    | Where magic link emails are sent      |
| `companyName`    | String?   | Optional                              |
| `magicLinkToken` | String?   | Unique random token for portal access |
| `tokenExpiresAt` | DateTime? | Token expiry (7 days from generation) |
| `createdAt`      | DateTime  | Auto-generated                        |
| `updatedAt`      | DateTime  | Auto-updated                          |

> **Note:** `magicLinkToken` does NOT have a `@unique` Prisma constraint — uniqueness is enforced at application level to avoid MongoDB null collision issues.

### Project

Tracks the work being done for a client.

| Field       | Type     | Notes                                                  |
| ----------- | -------- | ------------------------------------------------------ |
| `id`        | ObjectId | Auto-generated                                         |
| `userId`    | String   | Foreign Key → User                                     |
| `clientId`  | ObjectId | Foreign Key → Client                                   |
| `name`      | String   | e.g. "E-commerce Website Redesign"                     |
| `status`    | Enum     | `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED` |
| `createdAt` | DateTime | Auto-generated                                         |
| `updatedAt` | DateTime | Auto-updated                                           |

### Invoice

Bills sent to clients. Line items are stored as JSON — no separate table needed.

| Field             | Type      | Notes                                     |
| ----------------- | --------- | ----------------------------------------- |
| `id`              | ObjectId  | Auto-generated                            |
| `userId`          | String    | Foreign Key → User                        |
| `clientId`        | ObjectId  | Foreign Key → Client                      |
| `projectId`       | ObjectId? | Optional Foreign Key → Project            |
| `invoiceNumber`   | String    | e.g. "INV-2026-001"                       |
| `status`          | Enum      | `DRAFT`, `PENDING`, `PAID`, `OVERDUE`     |
| `totalAmount`     | Int       | Stored in **paise** (e.g. ₹500 = `50000`) |
| `lineItems`       | Json      | Array: `[{ description, qty, rate }]`     |
| `dueDate`         | DateTime  | Payment due date                          |
| `razorpayOrderId` | String?   | Set when client clicks Pay Now            |
| `createdAt`       | DateTime  | Auto-generated                            |
| `updatedAt`       | DateTime  | Auto-updated                              |

> **Note:** `totalAmount` is stored in paise (smallest INR unit) to avoid floating point errors. Always multiply by 100 when saving, divide by 100 when displaying.

---

## 3. Environment Variables

All variables must be defined in `.env` in the project root.

```env
# ─── Database ───────────────────────────────────────────────
DATABASE_URL="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/mini-lancer"

# ─── Clerk (Authentication) ─────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
CLERK_WEBHOOK_SECRET=whsec_xxxx

# Clerk redirect routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ─── Resend (Email) ──────────────────────────────────────────
RESEND_API_KEY=re_xxxx
FROM_EMAIL=noreply@yourdomain.com

# ─── Razorpay (Payments) ─────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
RAZORPAY_PLAN_ID=plan_xxxx

# ─── App ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Variable                            | Where to Get It                            |
| ----------------------------------- | ------------------------------------------ |
| `DATABASE_URL`                      | MongoDB Atlas → Connect → Drivers          |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys                 |
| `CLERK_SECRET_KEY`                  | Clerk Dashboard → API Keys                 |
| `CLERK_WEBHOOK_SECRET`              | Clerk Dashboard → Webhooks → your endpoint |
| `RESEND_API_KEY`                    | resend.com → API Keys                      |
| `FROM_EMAIL`                        | Your verified domain on Resend             |
| `RAZORPAY_KEY_ID`                   | Razorpay Dashboard → Settings → API Keys   |
| `RAZORPAY_KEY_SECRET`               | Razorpay Dashboard → Settings → API Keys   |
| `RAZORPAY_WEBHOOK_SECRET`           | Razorpay Dashboard → Settings → Webhooks   |
| `RAZORPAY_PLAN_ID`                  | Razorpay Dashboard → Subscriptions → Plans |

---

## 4. API Endpoints

### Authentication Rules

| Route Type                                                | Protection Method                    |
| --------------------------------------------------------- | ------------------------------------ |
| Freelancer routes (`/api/clients`, `/api/projects`, etc.) | Clerk session (`await auth()`)       |
| Client portal routes (`/api/portal/...`)                  | Magic link token in URL              |
| Webhook routes (`/api/webhooks/...`)                      | Cryptographic signature verification |

---

### 4.1 User

#### `GET /api/users/me`

Returns the logged-in freelancer's plan status and client limits.

**Auth:** Clerk required

**Response `200`:**

```json
{
  "plan": "FREE",
  "clientCount": 2,
  "clientLimit": 3,
  "canAddClient": true
}
```

> `clientLimit` is `null` for PRO users (unlimited). `canAddClient` is always `true` for PRO.

---

### 4.2 Clients

#### `GET /api/clients`

Returns all clients belonging to the logged-in freelancer.

**Auth:** Clerk required

**Response `200`:**

```json
[
  {
    "id": "64abc...",
    "userId": "user_clerk...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "companyName": "Sharma Tech",
    "magicLinkToken": null,
    "tokenExpiresAt": null,
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z"
  }
]
```

---

#### `POST /api/clients`

Creates a new client. Enforces 3-client limit on FREE plan.

**Auth:** Clerk required

**Request Body:**

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "companyName": "Sharma Tech"
}
```

| Field         | Type                 | Required |
| ------------- | -------------------- | -------- |
| `name`        | string               | ✅       |
| `email`       | string (valid email) | ✅       |
| `companyName` | string               | ❌       |

**Response `201`:** Created client object

**Response `403`:**

```json
{
  "error": "Free plan limit reached. Upgrade to Pro to add more clients."
}
```

---

#### `GET /api/clients/:clientId`

Returns a specific client.

**Auth:** Clerk required

**Response `200`:** Client object
**Response `403`:** Forbidden (client belongs to another user)
**Response `404`:** Client not found

---

#### `PATCH /api/clients/:clientId`

Updates a client's details. All fields optional.

**Auth:** Clerk required

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "new@example.com",
  "companyName": "New Company"
}
```

**Response `200`:** Updated client object

---

#### `DELETE /api/clients/:clientId`

Deletes a client and all their associated data.

**Auth:** Clerk required

**Response `200`:**

```json
{ "message": "Client deleted successfully" }
```

---

### 4.3 Projects

#### `GET /api/projects`

Returns all projects. Filter by client using query param.

**Auth:** Clerk required

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `clientId` | string | Optional. Filter projects by client |

**Example:** `GET /api/projects?clientId=64abc...`

**Response `200`:** Array of project objects

---

#### `POST /api/projects`

Creates a new project linked to a client.

**Auth:** Clerk required

**Request Body:**

```json
{
  "name": "E-commerce Website Redesign",
  "clientId": "64abc...",
  "status": "NOT_STARTED"
}
```

| Field      | Type   | Required                    |
| ---------- | ------ | --------------------------- |
| `name`     | string | ✅                          |
| `clientId` | string | ✅                          |
| `status`   | enum   | ❌ (default: `NOT_STARTED`) |

**Response `201`:** Created project object
**Response `404`:** Client not found or doesn't belong to user

---

#### `GET /api/projects/:projectId`

Returns a specific project.

**Auth:** Clerk required

**Response `200`:** Project object

---

#### `PATCH /api/projects/:projectId`

Updates a project's name or status.

**Auth:** Clerk required

**Request Body:**

```json
{
  "status": "IN_PROGRESS"
}
```

| Field    | Type   | Required |
| -------- | ------ | -------- |
| `name`   | string | ❌       |
| `status` | enum   | ❌       |

**Valid status values:** `NOT_STARTED` → `IN_PROGRESS` → `IN_REVIEW` → `COMPLETED`

**Response `200`:** Updated project object

---

#### `DELETE /api/projects/:projectId`

Deletes a project.

**Auth:** Clerk required

**Response `200`:**

```json
{ "message": "Project deleted successfully" }
```

---

### 4.4 Invoices

#### `GET /api/invoices`

Returns all invoices. Supports filtering by query params.

**Auth:** Clerk required

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `clientId` | string | Optional. Filter by client |
| `status` | string | Optional. Filter by status |

**Response `200`:** Array of invoice objects

---

#### `POST /api/invoices`

Creates a new invoice with line items. Auto-calculates total in paise.

**Auth:** Clerk required

**Request Body:**

```json
{
  "clientId": "64abc...",
  "projectId": "64def...",
  "invoiceNumber": "INV-2026-001",
  "dueDate": "2026-04-21",
  "lineItems": [
    { "description": "Homepage Design", "qty": 10, "rate": 500 },
    { "description": "SEO Setup", "qty": 2, "rate": 1500 }
  ],
  "status": "DRAFT"
}
```

| Field           | Type              | Required              |
| --------------- | ----------------- | --------------------- |
| `clientId`      | string            | ✅                    |
| `invoiceNumber` | string            | ✅                    |
| `dueDate`       | string (ISO date) | ✅                    |
| `lineItems`     | array             | ✅ (min 1 item)       |
| `projectId`     | string            | ❌                    |
| `status`        | enum              | ❌ (default: `DRAFT`) |

> `totalAmount` is auto-calculated: `sum(qty × rate) × 100` (converted to paise)

**Response `201`:** Created invoice object

---

#### `GET /api/invoices/:invoiceId`

Returns a specific invoice with all line items.

**Auth:** Clerk required

**Response `200`:** Invoice object

---

#### `PATCH /api/invoices/:invoiceId`

Updates an invoice. Not allowed if status is `PAID`.

**Auth:** Clerk required

**Request Body:**

```json
{
  "status": "PENDING",
  "dueDate": "2026-05-01",
  "lineItems": [
    { "description": "Updated Design Work", "qty": 5, "rate": 1000 }
  ]
}
```

**Response `200`:** Updated invoice object
**Response `400`:** Cannot edit a paid invoice

---

#### `DELETE /api/invoices/:invoiceId`

Deletes an invoice. Only allowed if status is `DRAFT`.

**Auth:** Clerk required

**Response `200`:**

```json
{ "message": "Invoice deleted successfully" }
```

**Response `400`:** Only draft invoices can be deleted

---

### 4.5 Magic Link

#### `POST /api/clients/:clientId/magic-link`

Generates a secure token and emails the client their portal link.

**Auth:** Clerk required

**How it works:**

1. Generates a 64-character random hex token using `crypto.randomBytes(32)`
2. Sets expiry to 7 days from now
3. Saves token to client record in MongoDB
4. Sends email via Resend with portal URL: `{APP_URL}/portal/{token}`

**Response `200`:**

```json
{
  "message": "Magic link sent successfully",
  "expiresAt": "2026-03-28T10:00:00.000Z"
}
```

---

### 4.6 Client Portal

> These routes have **no Clerk auth**. They are secured by the magic link token in the URL. All routes use the shared `verifyPortalToken()` helper from `lib/verify-portal-token.ts`.

#### `GET /api/portal/:token/projects`

Returns the client's project timeline (read-only).

**Auth:** Magic token

**Response `200`:** Array of projects ordered by `createdAt` ascending
**Response `401`:** Invalid or expired token

---

#### `GET /api/portal/:token/invoices`

Returns the client's invoices (read-only).

**Auth:** Magic token

**Response `200`:** Array of invoices ordered by `createdAt` descending
**Response `401`:** Invalid or expired token

---

#### `POST /api/portal/:token/pay/:invoiceId`

Creates a Razorpay order for the client to pay an invoice.

**Auth:** Magic token

**How it works:**

1. Verifies token and finds client
2. Verifies invoice belongs to this client
3. Checks invoice is not already `PAID`
4. Creates Razorpay order with `invoice.totalAmount` in paise
5. Saves `razorpayOrderId` to invoice record
6. Returns order details to frontend for checkout modal

**Response `200`:**

```json
{
  "orderId": "order_SU9X1VRPpLKdil",
  "amount": 600000,
  "currency": "INR",
  "invoiceNumber": "INV-2026-001"
}
```

**Response `400`:** Invoice is already paid
**Response `401`:** Invalid or expired token
**Response `404`:** Invoice not found

---

### 4.7 Subscriptions

#### `POST /api/subscriptions/create`

Creates a Razorpay subscription for the PRO plan upgrade.

**Auth:** Clerk required

**How it works:**

1. Checks user is not already PRO
2. Creates a Razorpay customer if one doesn't exist
3. Creates a Razorpay subscription using `RAZORPAY_PLAN_ID`
4. Saves `razorpaySubscriptionId` to user record
5. Returns subscription details for frontend checkout

**Response `200`:**

```json
{
  "subscriptionId": "sub_xxxxxxxxxx",
  "razorpayKeyId": "rzp_test_xxxxxxxxxx"
}
```

**Response `400`:** Already on Pro plan

> **Note:** The plan is NOT upgraded to PRO here. It is upgraded automatically when the `subscription.charged` webhook fires.

---

#### `POST /api/subscriptions/cancel`

Cancels the active PRO subscription.

**Auth:** Clerk required

**How it works:**

1. Checks user is on PRO plan
2. Cancels subscription via Razorpay SDK
3. Sets user `plan` back to `"FREE"`
4. Clears `razorpaySubscriptionId` from user record

**Response `200`:**

```json
{ "message": "Subscription cancelled successfully" }
```

**Response `400`:** Not on Pro plan or no active subscription

---

### 4.8 Webhooks

> These routes are **public** — no Clerk auth. Each is secured by its own cryptographic signature.

#### `POST /api/webhooks/clerk`

Syncs Clerk user data to MongoDB on signup and profile updates.

**Auth:** Clerk webhook signature (`CLERK_WEBHOOK_SECRET`)

**Handled Events:**

| Event          | Action                                                                      |
| -------------- | --------------------------------------------------------------------------- |
| `user.created` | Creates new User in MongoDB with Clerk `userId` as the `id`, `plan: "FREE"` |
| `user.updated` | Updates email and name in MongoDB                                           |

**Response `200`:**

```json
{ "message": "Webhook processed" }
```

---

#### `POST /api/webhooks/razorpay`

Handles all Razorpay payment and subscription events.

**Auth:** Razorpay HMAC SHA256 signature (`RAZORPAY_WEBHOOK_SECRET`)

> **Critical:** Raw request body is read using `request.text()` — never `request.json()` — before signature verification. Parsing the body before verification will break the signature check.

**Handled Events:**

| Event                  | Action                                                          |
| ---------------------- | --------------------------------------------------------------- |
| `order.paid`           | Finds invoice by `razorpayOrderId` → sets status to `PAID`      |
| `subscription.charged` | Finds user by `razorpaySubscriptionId` → sets `plan` to `"PRO"` |

**Idempotency:** If invoice is already `PAID` when `order.paid` fires, returns 200 without re-processing.

**Response `200`:**

```json
{ "received": true }
```

> **Always returns 200** — even on unexpected errors — to prevent Razorpay from retrying endlessly.

---

## 5. Error Codes & Responses

### Standard Error Format

All API errors follow this shape:

```json
{
  "error": "Human readable error message"
}
```

### HTTP Status Codes Used

| Status | Meaning               | When Used                                                |
| ------ | --------------------- | -------------------------------------------------------- |
| `200`  | OK                    | Successful GET, PATCH, DELETE                            |
| `201`  | Created               | Successful POST (resource created)                       |
| `400`  | Bad Request           | Validation error, business rule violation                |
| `401`  | Unauthorized          | Missing or invalid auth (Clerk or magic token)           |
| `403`  | Forbidden             | Resource belongs to another user, or FREE plan limit hit |
| `404`  | Not Found             | Resource doesn't exist in database                       |
| `500`  | Internal Server Error | Unexpected server error                                  |

### Common Error Responses

| Error Message                                                  | Status | Cause                                     |
| -------------------------------------------------------------- | ------ | ----------------------------------------- |
| `Unauthorized`                                                 | 401    | No Clerk session or invalid magic token   |
| `Forbidden`                                                    | 403    | Trying to access another user's resource  |
| `Free plan limit reached. Upgrade to Pro to add more clients.` | 403    | FREE user already has 3 clients           |
| `Client not found`                                             | 404    | Client ID doesn't exist or wrong user     |
| `Project not found`                                            | 404    | Project ID doesn't exist or wrong user    |
| `Invoice not found`                                            | 404    | Invoice ID doesn't exist or wrong user    |
| `Cannot edit a paid invoice`                                   | 400    | Trying to PATCH a PAID invoice            |
| `Only draft invoices can be deleted`                           | 400    | Trying to DELETE a non-DRAFT invoice      |
| `Invoice is already paid`                                      | 400    | Trying to pay an already PAID invoice     |
| `You are already on the Pro plan`                              | 400    | Trying to subscribe when already PRO      |
| `You are not on the Pro plan`                                  | 400    | Trying to cancel when on FREE             |
| `No active subscription found`                                 | 400    | No `razorpaySubscriptionId` on user       |
| `Invalid webhook signature`                                    | 400    | Webhook signature mismatch                |
| `Missing signature`                                            | 400    | Webhook received with no signature header |
| `Failed to send email`                                         | 500    | Resend API error                          |

### Zod Validation Errors

When request body fails Zod validation, the response is `400` with this shape:

```json
{
  "error": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

---

_Mini-lancer Backend Documentation — Built with Next.js 16, Prisma, MongoDB, Clerk, Razorpay & Resend_
