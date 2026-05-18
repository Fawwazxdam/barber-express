# Barber Express API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints use cookie-based authentication with JWT tokens. The `access_token` cookie is set on login and must be included in subsequent requests.

---

## 🔐 Authentication

### POST `/auth/login`
Login user and obtain access token.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login success",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

**Error Responses:**
- `401` — Invalid credentials

---

### POST `/auth/logout`
Logout current user (clears cookie).

**Headers:**
```
Cookie: access_token=<token>
```

**Success Response (200):**
```json
{
  "message": "Logout success"
}
```

---

### POST `/auth/logout-all`
Logout from all devices (requires authentication).

**Headers:**
```
Cookie: access_token=<token>
```

**Success Response (200):**
```json
{
  "message": "Logged out from all devices"
}
```

---

### POST `/auth/refresh`
Refresh access token using current token.

**Headers:**
```
Content-Type: application/json
Cookie: access_token=<token> (optional)
```

**Request Body:**
```json
{
  "refreshToken": "token-string"
}
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully"
}
```

**Error Responses:**
- `400` — Refresh token is required
- `401` — Invalid or expired refresh token

---

### GET `/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Cookie: access_token=<token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

---

### POST `/auth/change-password`
Change user password (requires authentication).

**Headers:**
```
Content-Type: application/json
Cookie: access_token=<token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` — Missing required fields
- `401` — Current password is incorrect

---

## 🏪 Tenants

### GET `/tenants`
Get all tenants.

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Barbershop A",
    "slug": "barbershop-a",
    "phone": "+1234567890",
    "address": "123 Main St",
    "isActive": true,
    "openTime": "09:00",
    "closeTime": "21:00",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### GET `/tenants/:id`
Get tenant by ID.

**Success Response (200):**
```json
{
  "id": "uuid",
  "name": "Barbershop A",
  "slug": "barbershop-a",
  "phone": "+1234567890",
  "address": "123 Main St",
  "isActive": true,
  "openTime": "09:00",
  "closeTime": "21:00",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404` — Tenant not found

---

### GET `/tenants/slug/:slug`
Get tenant by slug.

**Success Response (200):**
```json
{
  "id": "uuid",
  "name": "Barbershop A",
  "slug": "barbershop-a",
  ...
}
```

---

### GET `/tenants/:id/stats`
Get tenant statistics.

**Success Response (200):**
```json
{
  "barberCount": 5,
  "bookingCount": 25,
  "hasActiveSubscription": true,
  "subscription": {
    "plan": "Premium",
    "endsAt": "2026-02-01T00:00:00.000Z"
  }
}
```

---

### GET `/tenants/:id/dashboard`
Get tenant dashboard stats.

**Success Response (200):**
```json
{
  "tenantName": "Barbershop A",
  "activeBarbers": 5,
  "todayBookings": 10,
  "pendingBookings": 3,
  "openTime": "09:00",
  "closeTime": "21:00"
}
```

---

### POST `/tenants`
Create tenant (Admin only).

**Headers:**
```
Content-Type: application/json
Cookie: access_token=<token>
```

**Request Body:**
```json
{
  "name": "Barbershop A",
  "slug": "barbershop-a",
  "phone": "+1234567890",
  "address": "123 Main St",
  "openTime": "09:00",
  "closeTime": "21:00"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "name": "Barbershop A",
  "slug": "barbershop-a",
  ...
}
```

**Error Responses:**
- `409` — Slug or phone already exists
- `401` — Unauthenticated
- `403` — Forbidden (Admin only)

---

### PATCH `/tenants/:id`
Update tenant (Admin only).

**Request Body:**
```json
{
  "name": "Updated Barbershop",
  "phone": "+0987654321"
}
```

**Success Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Barbershop",
  ...
}
```

---

### DELETE `/tenants/:id`
Delete tenant (Admin only).

**Success Response (200):**
```json
{
  "message": "Tenant deleted successfully"
}
```

**Error Responses:**
- `400` — Cannot delete tenant with active subscription or existing barbers
- `404` — Tenant not found

---

## 📋 Plans

### GET `/plans`
Get all plans.

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Basic",
    "price": 100000,
    "maxBarbers": 2,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "name": "Premium",
    "price": 250000,
    "maxBarbers": 5,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### GET `/plans/active`
Get all active plans.

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Premium",
    "price": 250000,
    "maxBarbers": 5,
    "isActive": true
  }
]
```

---

### GET `/plans/:id`
Get plan by ID.

**Success Response (200):**
```json
{
  "id": "uuid",
  "name": "Premium",
  "price": 250000,
  "maxBarbers": 5,
  "isActive": true
}
```

---

### GET `/plans/name/:name`
Get plan by name.

**Success Response (200):**
```json
{
  "id": "uuid",
  "name": "Premium",
  "price": 250000,
  "maxBarbers": 5
}
```

---

### GET `/plans/:id/stats`
Get plan statistics (Admin only).

**Success Response (200):**
```json
{
  "totalPlans": 3,
  "activePlans": 2,
  "plans": [
    {
      "planId": "uuid",
      "planName": "Basic",
      "price": 100000,
      "maxBarbers": 2,
      "isActive": true,
      "totalSubscriptions": 15,
      "activeSubscriptions": 10
    }
  ]
}
```

---

### POST `/plans`
Create plan (Admin only).

**Request Body:**
```json
{
  "name": "Premium",
  "price": 250000,
  "maxBarbers": 5,
  "isActive": true
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "name": "Premium",
  "price": 250000,
  "maxBarbers": 5,
  "isActive": true
}
```

**Error Responses:**
- `409` — Plan name already exists
- `400` — Invalid data

---

### PATCH `/plans/:id`
Update plan (Admin only).

**Request Body:**
```json
{
  "price": 300000,
  "maxBarbers": 6
}
```

**Success Response (200):**
```json
{
  "id": "uuid",
  "name": "Premium",
  "price": 300000,
  "maxBarbers": 6
}
```

---

### DELETE `/plans/:id`
Delete plan (Admin only).

**Success Response (200):**
```json
{
  "message": "Plan deleted successfully"
}
```

**Error Responses:**
- `400` — Cannot delete plan with active subscriptions
- `404` — Plan not found

---

## 📜 Subscriptions

### GET `/subscriptions/tenant/:tenantId`
Get tenant's subscription history.

**Success Response (200):**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "planId": "uuid",
  "status": "active",
  "startsAt": "2026-01-01T00:00:00.000Z",
  "endsAt": "2026-02-01T00:00:00.000Z",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "planName": "Premium",
  "planPrice": 250000,
  "planMaxBarbers": 5
}
```

---

### GET `/subscriptions/tenant/:tenantId/active`
Get tenant's active subscription.

**Success Response (200):**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "planId": "uuid",
  "status": "active",
  "startsAt": "2026-01-01T00:00:00.000Z",
  "endsAt": "2026-02-01T00:00:00.000Z",
  "planName": "Premium",
  "planPrice": 250000,
  "planMaxBarbers": 5
}
```

**Error Responses:**
- `404` — No active subscription found

---

### GET `/subscriptions/tenant/:tenantId/history`
Get tenant's subscription history.

**Query Parameters:**
- `limit` (optional) — Number of records to return (default: 20)

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "status": "expired",
    "startsAt": "2025-12-01T00:00:00.000Z",
    "endsAt": "2026-01-01T00:00:00.000Z",
    "planName": "Basic"
  }
]
```

---

### GET `/subscriptions/tenant/:tenantId/validate`
Validate tenant subscription.

**Success Response (200):**
```json
{
  "isValid": true,
  "subscription": {
    "id": "uuid",
    "planName": "Premium",
    "endsAt": "2026-02-01T00:00:00.000Z"
  }
}
```

---

### POST `/subscriptions/tenant/:tenantId/renew`
Renew tenant subscription.

**Request Body (optional):**
```json
{
  "durationDays": 30
}
```

**Success Response (200):**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "planId": "uuid",
  "status": "active",
  "startsAt": "2026-01-01T00:00:00.000Z",
  "endsAt": "2026-03-02T00:00:00.000Z"
}
```

---

### POST `/subscriptions/tenant/:tenantId/upgrade`
Upgrade or downgrade subscription plan.

**Request Body:**
```json
{
  "planId": "uuid-of-new-plan"
}
```

**Success Response (200):**
```json
{
  "id": "new-subscription-uuid",
  "tenantId": "uuid",
  "planId": "new-plan-uuid",
  "status": "active",
  "message": "Subscription changed to Premium"
}
```

---

### POST `/subscriptions`
Create subscription (Admin only).

**Request Body:**
```json
{
  "tenantId": "uuid",
  "planId": "uuid",
  "durationDays": 30
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "planId": "uuid",
  "status": "active",
  "startsAt": "2026-01-01T00:00:00.000Z",
  "endsAt": "2026-02-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404` — Tenant or plan not found
- `400` — Plan is not active
- `409` — Tenant already has active subscription

---

### DELETE `/subscriptions/:id`
Cancel subscription (Admin only).

**Success Response (200):**
```json
{
  "id": "uuid",
  "status": "cancelled"
}
```

**Error Responses:**
- `404` — Subscription not found
- `400` — Subscription already cancelled

---

### GET `/subscriptions/expired`
Get expired subscriptions (Admin only).

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "status": "active",
    "endsAt": "2025-12-31T00:00:00.000Z"
  }
]
```

---

## 💈 Services

### GET `/services`
Get all services.

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Haircut",
    "price": 50000,
    "duration": 30,
    "isActive": true
  }
]
```

---

### GET `/services/:id`
Get service by ID.

**Success Response (200):**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "name": "Haircut",
  "price": 50000,
  "duration": 30,
  "isActive": true
}
```

---

### POST `/services`
Create service.

**Headers:**
```
Content-Type: application/json
Cookie: access_token=<token>
```

**Request Body:**
```json
{
  "tenantId": "uuid",
  "name": "Haircut",
  "price": 50000,
  "duration": 30,
  "isActive": true
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "name": "Haircut",
  "price": 50000,
  "duration": 30
}
```

---

### PATCH `/services/:id`
Update service.

**Request Body:**
```json
{
  "price": 60000,
  "duration": 45
}
```

**Success Response (200):**
```json
{
  "id": "uuid",
  "price": 60000,
  "duration": 45
}
```

---

### PATCH `/services/:id/toggle-active`
Toggle service active status.

**Success Response (200):**
```json
{
  "id": "uuid",
  "isActive": false
}
```

---

### DELETE `/services/:id`
Delete service.

**Success Response (200):**
```json
{
  "message": "Service deleted successfully"
}
```

---

## 📅 Bookings

### GET `/bookings`
Get all bookings (with details).

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "barberId": "uuid",
    "barberName": "John Doe",
    "serviceId": "uuid",
    "serviceName": "Haircut",
    "servicePrice": 50000,
    "customerUserId": "uuid",
    "customerName": "Jane Smith",
    "customerPhone": "+1234567890",
    "customerNote": "Please use scissors",
    "bookingDate": "2026-01-15T10:00:00.000Z",
    "status": "confirmed",
    "duration": 30,
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-10T08:00:00.000Z"
  }
]
```

---

### GET `/bookings/:id`
Get booking by ID or partial ID.

**Success Response (200):**
```json
{
  "id": "uuid",
  "customerName": "Jane Smith",
  "customerPhone": "+1234567890",
  "serviceName": "Haircut",
  "servicePrice": 50000,
  "barberName": "John Doe",
  "bookingDate": "2026-01-15T10:00:00.000Z",
  "status": "confirmed",
  "duration": 30
}
```

**Error Responses:**
- `404` — Booking not found

---

### POST `/bookings`
Create a new booking.

**Headers:**
```
Content-Type: application/json
Cookie: access_token=<token> (optional for registered users)
```

**Request Body:**
```json
{
  "barberId": "uuid",
  "serviceId": "uuid",
  "customerUserId": "uuid",
  "customerName": "Jane Smith",
  "customerPhone": "+1234567890",
  "customerNote": "Please use scissors",
  "bookingTime": "2026-01-15T10:00:00.000Z"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "barberId": "uuid",
  "serviceId": "uuid",
  "customerName": "Jane Smith",
  "customerPhone": "+1234567890",
  "customerNote": "Please use scissors",
  "bookingDate": "2026-01-15T10:00:00.000Z",
  "status": "pending",
  "createdAt": "2026-01-10T08:00:00.000Z"
}
```

**Error Responses:**
- `400` — Time slot not available or outside operating hours
- `404` — Barber or service not found

---

### GET `/bookings/barber/:barberId`
Get all bookings for a specific barber.

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "barberId": "uuid",
    "serviceId": "uuid",
    "customerName": "Jane Smith",
    "bookingDate": "2026-01-15T10:00:00.000Z",
    "status": "confirmed",
    "duration": 30
  }
]
```

---

### GET `/bookings/barber/:barberId/date`
Get barber's bookings for a specific date.

**Query Parameters:**
- `date` — Date in YYYY-MM-DD format

**Success Response (200):**
```json
{
  "id": "uuid",
  "serviceName": "Haircut",
  "customerName": "Jane Smith",
  "bookingDate": "2026-01-15T10:00:00.000Z",
  "status": "confirmed",
  "duration": 30
}
```

---

### GET `/bookings/date`
Get all bookings for a specific date.

**Query Parameters:**
- `date` — Date in YYYY-MM-DD format

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "customerName": "Jane Smith",
    "serviceName": "Haircut",
    "barberName": "John Doe",
    "bookingDate": "2026-01-15T10:00:00.000Z",
    "status": "confirmed"
  }
]
```

---

### GET `/bookings/available-slots`
Get available booking slots for a barber on a date.

**Query Parameters:**
- `date` — Date in YYYY-MM-DD format
- `barberId` — Barber UUID

**Success Response (200):**
```json
{
  "slots": [
    {
      "start": "2026-01-15T09:00:00.000Z",
      "end": "2026-01-15T09:30:00.000Z"
    },
    {
      "start": "2026-01-15T09:30:00.000Z",
      "end": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400` — Missing or invalid date parameter

---

### PATCH `/bookings/:id/status`
Update booking status.

**Headers:**
```
Content-Type: application/json
Cookie: access_token=<token>
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid statuses:** `pending`, `confirmed`, `cancelled`, `completed`

**Success Response (200):**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "updatedAt": "2026-01-10T09:00:00.000Z"
}
```

---

### GET `/bookings/dashboard/stats`
Get dashboard statistics (aggregated).

**Success Response (200):**
```json
{
  "todayBookings": 10,
  "completedBookingsToday": 5,
  "topHaircuts": [
    {
      "serviceId": "uuid",
      "serviceName": "Haircut",
      "count": 15
    }
  ]
}
```

---

### GET `/bookings/barber/:barberId/dashboard/stats`
Get barber-specific dashboard stats.

**Success Response (200):**
```json
{
  "todayBookings": 5,
  "completedBookingsToday": 3,
  "pendingConfirmations": [
    {
      "id": "uuid",
      "customerName": "Jane Smith",
      "serviceName": "Haircut",
      "bookingDate": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## 👤 Users (Barbers)

### GET `/users/barbers`
Get all barbers (with media).

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "description": "Expert barber with 5 years experience",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "media": [
      {
        "id": "uuid",
        "url": "/uploads/barber-image.jpg",
        "type": "barber"
      }
    ]
  }
]
```

---

### GET `/users/barbers/:id`
Get barber by ID (with media).

**Success Response (200):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "description": "Expert barber with 5 years experience",
  "media": [
    {
      "id": "uuid",
      "url": "/uploads/barber-image.jpg",
      "filename": "original.jpg",
      "mimeType": "image/jpeg",
      "size": 102400,
      "type": "barber"
    }
  ]
}
```

**Error Responses:**
- `404` — Barber not found

---

### POST `/users/barbers`
Create new barber (Admin only).

**Headers:**
```
Content-Type: multipart/form-data
Cookie: access_token=<token>
```

**Form Data:**
- `email` (string) — Required
- `name` (string) — Required
- `password` (string) — Required
- `description` (string) — Optional
- `image` (file) — Optional image file

**Success Response (201):**
```json
{
  "message": "Barber created"
}
```

**Error Responses:**
- `409` — Email already exists
- `400` — Invalid data

---

### PATCH `/users/barbers/:id`
Update barber (Admin only).

**Headers:**
```
Content-Type: multipart/form-data
Cookie: access_token=<token>
```

**Form Data:**
- `name` (string) — Optional
- `password` (string) — Optional
- `image` (file) — Optional

**Success Response (200):**
```json
{
  "message": "Barber updated"
}
```

---

## 🖼️ Media

### GET `/media/:id`
Get media by ID.

**Success Response (200):**
```json
{
  "id": "uuid",
  "url": "/uploads/barber-image.jpg",
  "filename": "original.jpg",
  "mimeType": "image/jpeg",
  "size": 102400,
  "type": "barber",
  "referenceId": "uuid",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

### GET `/media/reference/:type/:referenceId`
Get all media for a specific reference.

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "url": "/uploads/barber-image-1.jpg",
    "type": "barber"
  },
  {
    "id": "uuid",
    "url": "/uploads/barber-image-2.jpg",
    "type": "barber"
  }
]
```

---

### DELETE `/media/:id`
Delete media.

**Headers:**
```
Cookie: access_token=<token>
```

**Success Response (200):**
```json
{
  "message": "Media deleted"
}
```

---

### DELETE `/media/reference/:type/:referenceId`
Delete all media for a reference.

**Headers:**
```
Cookie: access_token=<token>
```

**Success Response (200):**
```json
{
  "message": "Media deleted"
}
```

---

## 📊 Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

---

## 🔐 Role-Based Access

- **Public endpoints** — No authentication required
- **Authenticated endpoints** — Require valid `access_token` cookie
- **Admin-only endpoints** — Require `role: "ADMIN"` in token

---

## 📅 Operating Hours

Default operating hours: `09:00` - `21:00` (9 AM to 9 PM)

Bookings outside these hours will be rejected.

---

## 💾 Database Schema Reference

### Tables
- **tenants** — Shop/business information
- **users** — Barbers and admins (role: ADMIN, BARBER)
- **services** — Services offered by each tenant
- **bookings** — Customer bookings
- **plans** — Subscription plans
- **subscriptions** — Tenant subscriptions
- **media** — Uploaded files (images)
- **refresh_tokens** — JWT refresh tokens

---

## 🏗️ Architecture

### Repository Pattern
All database operations are in `src/db/*.repository.ts`

### Service Layer
Business logic in `src/services/*.service.ts`

### Controllers
HTTP request handling in `src/controllers/*.controller.ts`

### Routes
Endpoint definitions in `src/routes/*.route.ts`

---

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Setup `.env` file with `DATABASE_URL` and `JWT_SECRET`
3. Run migrations: `npm run db:migrate`
4. Seed database: `npm run db:seed`
5. Start dev server: `npm run dev`

---

*Generated from source code — Last updated: 2026-05-02*
