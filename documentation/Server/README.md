# Mini-lancer Backend Documentation (Next.js 16)

## Table of Contents

- [Section 1 — Tech Stack & Libraries](#section-1--tech-stack--libraries)
- [Section 2 — Database Schema](#section-2--database-schema)
- [Section 3 — Environment Variables](#section-3--environment-variables)
- [Section 4 — API Endpoints](#section-4--api-endpoints)
- [Section 5 — Error Codes & Responses](#section-5--error-codes--responses)

## Section 1 — Tech Stack & Libraries

| Technology / Library      |             Version | Backend Usage                                                 |
| ------------------------- | ------------------: | ------------------------------------------------------------- |
| Next.js (App Router)      |              16.2.1 | Route handlers in `app/api/**/route.ts`, server runtime       |
| TypeScript                | (project TS config) | Type-safe APIs and schemas                                    |
| @clerk/nextjs             |               7.0.6 | Authentication via `await auth()` from `@clerk/nextjs/server` |
| Prisma                    |                 6.x | ORM for MongoDB Atlas                                         |
| MongoDB Atlas             |                   — | Primary database                                              |
| razorpay                  |                 2.x | Orders, subscriptions, webhook verification                   |
| resend                    |                 6.x | Transactional emails                                          |
| @react-email/render       |                 2.x | Render React email templates to HTML                          |
| zod                       |                 4.x | Request body validation on API routes                         |
| crypto (Node.js built-in) |       Node built-in | Magic link token generation                                   |
| svix                      |                 1.x | Clerk webhook signature stack dependency                      |

> **Important (Next.js 16 + Clerk):** Auth entrypoint file is `proxy.ts` (not `middleware.ts`).

> **Prisma query pattern:** This backend intentionally uses separate sequential `await` calls and does **not** use `prisma.$transaction`.

---

## Section 2 — Database Schema

### Enums

| Enum            | Values                                                 | Default       |
| --------------- | ------------------------------------------------------ | ------------- |
| `ProjectStatus` | `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED` | `NOT_STARTED` |
| `InvoiceStatus` | `DRAFT`, `PENDING`, `PAID`, `OVERDUE`                  | `DRAFT`       |

### `User`

| Field                    | Type       | Constraints / Defaults | Notes                                          |
| ------------------------ | ---------- | ---------------------- | ---------------------------------------------- |
| `id`                     | `String`   | Primary Key            | Matches Clerk `userId`; **not auto-generated** |
| `email`                  | `String`   | `@unique`              | Required                                       |
| `name`                   | `String`   | Required               | User display name                              |
| `razorpayCustomerId`     | `String?`  | Optional               | Set when customer is created in Razorpay       |
| `razorpaySubscriptionId` | `String?`  | Optional               | Set after subscription creation                |
| `plan`                   | `String`   | Default: `"FREE"`      | `FREE` / `PRO`                                 |
| `createdAt`              | `DateTime` | `@default(now())`      | Timestamp                                      |
| `updatedAt`              | `DateTime` | `@updatedAt`           | Timestamp                                      |

Relationships:

- `User` has many `Client`
- `User` has many `Project`
- `User` has many `Invoice`

### `Client`

| Field            | Type        | Constraints / Defaults     | Notes                           |
| ---------------- | ----------- | -------------------------- | ------------------------------- |
| `id`             | `String`    | ObjectId, auto-generated   | Mongo `_id`                     |
| `userId`         | `String`    | FK → `User.id`             | Required                        |
| `name`           | `String`    | Required                   | Client name                     |
| `email`          | `String`    | Required                   | Client email                    |
| `companyName`    | `String?`   | Optional                   | Company                         |
| `magicLinkToken` | `String?`   | Optional; **no `@unique`** | Uniqueness handled at app level |
| `tokenExpiresAt` | `DateTime?` | Optional                   | Expiry for portal access        |
| `createdAt`      | `DateTime`  | `@default(now())`          | Timestamp                       |
| `updatedAt`      | `DateTime`  | `@updatedAt`               | Timestamp                       |

Relationships:

- `Client` belongs to `User` (`onDelete: Cascade`)
- `Client` has many `Project`
- `Client` has many `Invoice`

### `Project`

| Field       | Type            | Constraints / Defaults | Notes                  |
| ----------- | --------------- | ---------------------- | ---------------------- |
| `id`        | `String`        | ObjectId               | Mongo `_id`            |
| `userId`    | `String`        | FK → `User.id`         | Required               |
| `clientId`  | `String`        | FK → `Client.id`       | Required               |
| `name`      | `String`        | Required               | Project title          |
| `status`    | `ProjectStatus` | Default: `NOT_STARTED` | Project workflow state |
| `createdAt` | `DateTime`      | `@default(now())`      | Timestamp              |
| `updatedAt` | `DateTime`      | `@updatedAt`           | Timestamp              |

Relationships:

- `Project` belongs to `User` (`onDelete: Cascade`)
- `Project` belongs to `Client` (`onDelete: Cascade`)
- `Project` has many `Invoice`

### `Invoice`

| Field             | Type            | Constraints / Defaults | Notes                                                 |
| ----------------- | --------------- | ---------------------- | ----------------------------------------------------- |
| `id`              | `String`        | ObjectId               | Mongo `_id`                                           |
| `userId`          | `String`        | FK → `User.id`         | Required                                              |
| `clientId`        | `String`        | FK → `Client.id`       | Required                                              |
| `projectId`       | `String?`       | FK → `Project.id`      | Optional                                              |
| `invoiceNumber`   | `String`        | Required               | Unique per user (`@@unique([userId, invoiceNumber])`) |
| `status`          | `InvoiceStatus` | Default: `DRAFT`       | Invoice lifecycle                                     |
| `totalAmount`     | `Int`           | Required               | Stored in **paise** (`INR * 100`)                     |
| `lineItems`       | `Json`          | Required               | Array of `{ description, qty, rate }`                 |
| `dueDate`         | `DateTime`      | Required               | Due date                                              |
| `razorpayOrderId` | `String?`       | Optional               | Linked Razorpay order                                 |
| `createdAt`       | `DateTime`      | `@default(now())`      | Timestamp                                             |
| `updatedAt`       | `DateTime`      | `@updatedAt`           | Timestamp                                             |

Relationships:

- `Invoice` belongs to `User` (`onDelete: Cascade`)
- `Invoice` belongs to `Client` (`onDelete: Cascade`)
- `Invoice` belongs to `Project?` (`onDelete: SetNull`)

---

## Section 3 — Environment Variables

| Variable                              | Example Value Format                                              | Where to Get It                            |
| ------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`                        | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/mini_lancer?...` | MongoDB Atlas → Connect → Drivers          |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | `pk_test_...` / `pk_live_...`                                     | Clerk Dashboard → API Keys                 |
| `CLERK_SECRET_KEY`                    | `sk_test_...` / `sk_live_...`                                     | Clerk Dashboard → API Keys                 |
| `CLERK_WEBHOOK_SECRET`                | `whsec_...`                                                       | Clerk Dashboard → Webhooks → endpoint      |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | `/sign-in`                                                        | Set static value                           |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | `/sign-up`                                                        | Set static value                           |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard`                                                      | Set static value                           |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard`                                                      | Set static value                           |
| `RESEND_API_KEY`                      | `re_...`                                                          | resend.com → API Keys                      |
| `FROM_EMAIL`                          | `noreply@yourdomain.com`                                          | Verified domain/sender on Resend           |
| `RAZORPAY_KEY_ID`                     | `rzp_test_...` / `rzp_live_...`                                   | Razorpay Dashboard → Settings → API Keys   |
| `RAZORPAY_KEY_SECRET`                 | `<secret>`                                                        | Razorpay Dashboard → Settings → API Keys   |
| `RAZORPAY_WEBHOOK_SECRET`             | `<webhook_secret>`                                                | Razorpay Dashboard → Settings → Webhooks   |
| `RAZORPAY_PLAN_ID`                    | `plan_XXXXXXXXXXXXXX`                                             | Razorpay Dashboard → Subscriptions → Plans |
| `NEXT_PUBLIC_APP_URL`                 | `http://localhost:3000`                                           | Set static value                           |

> **Warning:** Missing payment or webhook env vars will break subscription/payment/webhook flows at runtime.

---

## Section 4 — API Endpoints

### 4.1 `GET /api/users/me`

- **Auth:** Clerk (`await auth()`)
- **Request Body:** none
- **Response (200):**

```json
{
  "plan": "FREE",
  "clientCount": 2,
  "clientLimit": 3,
  "canAddClient": true
}
```

### 4.2 `GET /api/clients`

- **Auth:** Clerk
- **Request Body:** none
- **Response (200):**

```json
[
  {
    "id": "67d9a0...",
    "userId": "user_2abc...",
    "name": "Acme Corp",
    "email": "billing@acme.com",
    "companyName": "Acme",
    "magicLinkToken": null,
    "tokenExpiresAt": null,
    "createdAt": "2026-03-22T10:00:00.000Z",
    "updatedAt": "2026-03-22T10:00:00.000Z"
  }
]
```

### 4.3 `POST /api/clients`

- **Auth:** Clerk
- **Request Body:**

```json
{
  "name": "Acme Corp",
  "email": "billing@acme.com",
  "companyName": "Acme"
}
```

- **Response (201):**

```json
{
  "id": "67d9a0...",
  "userId": "user_2abc...",
  "name": "Acme Corp",
  "email": "billing@acme.com",
  "companyName": "Acme",
  "createdAt": "2026-03-22T10:00:00.000Z",
  "updatedAt": "2026-03-22T10:00:00.000Z"
}
```

> **FREE plan rule:** max 3 clients. On 4th attempt, route returns `403` with upgrade message.

### 4.4 `GET /api/clients/:clientId`

- **Auth:** Clerk
- **Request Body:** none
- **Response (200):**

```json
{
  "id": "67d9a0...",
  "name": "Acme Corp",
  "email": "billing@acme.com",
  "companyName": "Acme"
}
```

### 4.5 `PATCH /api/clients/:clientId`

- **Auth:** Clerk
- **Request Body (all optional):**

```json
{
  "name": "Acme Pvt Ltd",
  "email": "accounts@acme.com",
  "companyName": "Acme India"
}
```

- **Response (200):**

```json
{
  "id": "67d9a0...",
  "name": "Acme Pvt Ltd",
  "email": "accounts@acme.com",
  "companyName": "Acme India"
}
```

### 4.6 `DELETE /api/clients/:clientId`

- **Auth:** Clerk
- **Request Body:** none
- **Response (200):**

```json
{
  "message": "Client deleted successfully"
}
```

### 4.7 `POST /api/clients/:clientId/magic-link`

- **Auth:** Clerk
- **Request Body:** none
- **Behavior:** creates `magicLinkToken` with 64-char hex (`crypto.randomBytes(32).toString("hex")`), sets 7-day expiry, sends email via Resend.
- **Response (200):**

```json
{
  "message": "Magic link sent successfully",
  "expiresAt": "2026-03-29T10:00:00.000Z"
}
```

### 4.8 `GET /api/projects`

- **Auth:** Clerk
- **Query Params:** `clientId` (optional)
- **Response (200):**

```json
[
  {
    "id": "67da11...",
    "clientId": "67d9a0...",
    "name": "Website Revamp",
    "status": "IN_PROGRESS",
    "createdAt": "2026-03-20T08:00:00.000Z"
  }
]
```

### 4.9 `POST /api/projects`

- **Auth:** Clerk
- **Request Body:**

```json
{
  "name": "Website Revamp",
  "clientId": "67d9a0...",
  "status": "NOT_STARTED"
}
```

- **Response (201):**

```json
{
  "id": "67da11...",
  "name": "Website Revamp",
  "status": "NOT_STARTED",
  "clientId": "67d9a0..."
}
```

### 4.10 `GET /api/projects/:projectId`

- **Auth:** Clerk
- **Request Body:** none
- **Response (200):**

```json
{
  "id": "67da11...",
  "name": "Website Revamp",
  "status": "IN_REVIEW",
  "clientId": "67d9a0..."
}
```

### 4.11 `PATCH /api/projects/:projectId`

- **Auth:** Clerk
- **Request Body (optional fields):**

```json
{
  "name": "Website Revamp v2",
  "status": "COMPLETED"
}
```

- **Response (200):**

```json
{
  "id": "67da11...",
  "name": "Website Revamp v2",
  "status": "COMPLETED"
}
```

### 4.12 `DELETE /api/projects/:projectId`

- **Auth:** Clerk
- **Request Body:** none
- **Response (200):**

```json
{
  "message": "Project deleted successfully"
}
```

### 4.13 `GET /api/invoices`

- **Auth:** Clerk
- **Query Params:** `clientId` (optional), `status` (optional: `DRAFT | PENDING | PAID | OVERDUE`)
- **Response (200):**

```json
[
  {
    "id": "67db00...",
    "invoiceNumber": "INV-001",
    "status": "PENDING",
    "totalAmount": 125000,
    "lineItems": [
      { "description": "Design", "qty": 5, "rate": 2500 },
      { "description": "Dev", "qty": 10, "rate": 10000 }
    ],
    "dueDate": "2026-04-01T00:00:00.000Z"
  }
]
```

### 4.14 `POST /api/invoices`

- **Auth:** Clerk
- **Request Body:**

```json
{
  "clientId": "67d9a0...",
  "projectId": "67da11...",
  "invoiceNumber": "INV-001",
  "dueDate": "2026-04-01",
  "status": "PENDING",
  "lineItems": [
    { "description": "Design", "qty": 5, "rate": 2500 },
    { "description": "Dev", "qty": 10, "rate": 10000 }
  ]
}
```

- **Response (201):**

```json
{
  "id": "67db00...",
  "invoiceNumber": "INV-001",
  "status": "PENDING",
  "totalAmount": 11250000,
  "lineItems": [
    { "description": "Design", "qty": 5, "rate": 2500 },
    { "description": "Dev", "qty": 10, "rate": 10000 }
  ]
}
```

> **Amount note:** `totalAmount` is stored in paise. Backend computes `sum(qty * rate) * 100`.

### 4.15 `GET /api/invoices/:invoiceId`

- **Auth:** Clerk
- **Request Body:** none
- **Response (200):**

```json
{
  "id": "67db00...",
  "invoiceNumber": "INV-001",
  "status": "PENDING",
  "totalAmount": 11250000,
  "lineItems": [{ "description": "Design", "qty": 5, "rate": 2500 }]
}
```

### 4.16 `PATCH /api/invoices/:invoiceId`

- **Auth:** Clerk
- **Request Body (all optional, but blocked if status already `PAID`):**

```json
{
  "invoiceNumber": "INV-001-UPDATED",
  "dueDate": "2026-04-10",
  "status": "PENDING",
  "lineItems": [{ "description": "Design", "qty": 8, "rate": 2500 }]
}
```

- **Response (200):**

```json
{
  "id": "67db00...",
  "invoiceNumber": "INV-001-UPDATED",
  "status": "PENDING",
  "totalAmount": 2000000
}
```

### 4.17 `DELETE /api/invoices/:invoiceId`

- **Auth:** Clerk
- **Request Body:** none
- **Rule:** only `DRAFT` invoices can be deleted.
- **Response (200):**

```json
{
  "message": "Invoice deleted successfully"
}
```

### 4.18 `GET /api/portal/:token/projects`

- **Auth:** Public, token-secured (`magicLinkToken` + expiry)
- **Request Body:** none
- **Response (200):**

```json
[
  {
    "id": "67da11...",
    "name": "Website Revamp",
    "status": "IN_PROGRESS",
    "createdAt": "2026-03-20T08:00:00.000Z"
  }
]
```

### 4.19 `GET /api/portal/:token/invoices`

- **Auth:** Public, token-secured
- **Request Body:** none
- **Response (200):**

```json
[
  {
    "id": "67db00...",
    "invoiceNumber": "INV-001",
    "status": "PENDING",
    "totalAmount": 11250000,
    "dueDate": "2026-04-01T00:00:00.000Z"
  }
]
```

### 4.20 `POST /api/portal/:token/pay/:invoiceId`

- **Auth:** Public, token-secured
- **Request Body:** none
- **Behavior:** creates Razorpay order for invoice amount, stores `razorpayOrderId` on invoice.
- **Response (200):**

```json
{
  "orderId": "order_Q1x2y3...",
  "amount": 11250000,
  "currency": "INR",
  "invoiceNumber": "INV-001"
}
```

### 4.21 `POST /api/subscriptions/create`

- **Auth:** Clerk
- **Request Body:** none
- **Behavior:** creates Razorpay customer if missing, then creates subscription, stores `razorpaySubscriptionId`.
- **Response (200):**

```json
{
  "subscriptionId": "sub_Q9ab...",
  "razorpayKeyId": "rzp_test_1234"
}
```

> **Important:** This route does **not** set plan to `PRO`. Plan upgrade happens in Razorpay webhook (`subscription.charged`).

### 4.22 `POST /api/subscriptions/cancel`

- **Auth:** Clerk
- **Request Body:** none
- **Behavior:** cancels Razorpay subscription, sets user plan to `FREE`, clears `razorpaySubscriptionId`.
- **Response (200):**

```json
{
  "message": "Subscription cancelled successfully"
}
```

### 4.23 `POST /api/webhooks/clerk`

- **Auth:** Public webhook endpoint, signature verified with Clerk webhook secret
- **Request Body:** Clerk event payload
- **Handles:** `user.created`, `user.updated`
- **Response (200):**

```json
{
  "message": "Webhook processed"
}
```

### 4.24 `POST /api/webhooks/razorpay`

- **Auth:** Public webhook endpoint, secured by `x-razorpay-signature`
- **Critical Rule:** reads raw body via `await request.text()` (never `request.json()` before signature verification)
- **Handles:**
  - `order.paid` → invoice status set to `PAID`
  - `subscription.charged` → user plan set to `PRO`
- **Response (success + fallback):**

```json
{
  "received": true
}
```

> **Webhook reliability:** Razorpay route intentionally returns `200` even when internal handling fails, to avoid repeated retries for already-handled or unknown events.

---

## Section 5 — Error Codes & Responses

### Standard Error Response Format

```json
{
  "error": "message"
}
```

### Zod Validation Error Shape

When request validation fails, routes return:

```json
{
  "error": {
    "formErrors": [],
    "fieldErrors": {
      "name": ["Name is required"],
      "email": ["Invalid email"]
    }
  }
}
```

### HTTP Status Codes Used

| Status | Meaning in this backend                                                                             |
| -----: | --------------------------------------------------------------------------------------------------- |
|  `200` | Successful read/update/delete/webhook acknowledgement                                               |
|  `201` | Resource created (`POST /api/clients`, `POST /api/projects`, `POST /api/invoices`)                  |
|  `400` | Invalid input/state transition/signature/body                                                       |
|  `401` | Unauthenticated request (`auth().userId` missing) or invalid/expired portal token                   |
|  `403` | Authenticated but not permitted (ownership mismatch, plan limit reached, portal ownership mismatch) |
|  `404` | Resource/user not found                                                                             |
|  `500` | Unexpected server/provider failure                                                                  |

### Complete Error Message Table

| Status | Error Message                                                  | Exact Cause                                                   |
| -----: | -------------------------------------------------------------- | ------------------------------------------------------------- |
|    400 | `Invalid JSON body`                                            | Request body is not valid JSON                                |
|    400 | `Invalid webhook signature`                                    | Clerk webhook signature verification failed                   |
|    400 | `Missing signature`                                            | `x-razorpay-signature` header missing in Razorpay webhook     |
|    400 | `Invalid signature`                                            | Razorpay webhook signature mismatch                           |
|    400 | `Invoice is already paid`                                      | Portal pay attempted on invoice already in `PAID` state       |
|    400 | `Cannot edit a paid invoice`                                   | Invoice `PATCH` attempted when invoice status is `PAID`       |
|    400 | `Only draft invoices can be deleted`                           | Invoice `DELETE` attempted when status is not `DRAFT`         |
|    400 | `Project not found`                                            | Invoice create request included invalid/non-owned `projectId` |
|    400 | `You are already on the Pro plan`                              | Subscription create called while user plan is `PRO`           |
|    400 | `You are not on the Pro plan`                                  | Subscription cancel called while user plan is not `PRO`       |
|    400 | `No active subscription found`                                 | Subscription cancel called without `razorpaySubscriptionId`   |
|    401 | `Unauthorized`                                                 | Clerk `userId` missing                                        |
|    401 | `Invalid token`                                                | Portal token not found                                        |
|    401 | `Token expired`                                                | Portal token exists but expiry time passed                    |
|    403 | `Forbidden`                                                    | Ownership mismatch for resource or portal invoice mismatch    |
|    403 | `Free plan limit reached. Upgrade to Pro to add more clients.` | FREE plan user attempted to create more than 3 clients        |
|    404 | `User not found`                                               | Authenticated user id not present in DB                       |
|    404 | `Client not found`                                             | Client id missing or not owned by user                        |
|    404 | `Project not found`                                            | Project id missing or not owned by user                       |
|    404 | `Invoice not found`                                            | Invoice id missing or not owned/linked correctly              |
|    500 | `Failed to send email`                                         | Resend failed for magic link email                            |
|    500 | `Internal server error`                                        | Portal payment order creation failed unexpectedly             |

> **Note:** `POST /api/subscriptions/create` and `POST /api/subscriptions/cancel` return `500` with `{"error": String(error)}` when exceptions are thrown.

> **Note:** Razorpay webhook route returns `400` only for missing/invalid signature checks; otherwise it returns `200 {"received": true}` including unexpected processing errors (logged server-side).
