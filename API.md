# Barber Express API Documentation

## Base URL
```
http://localhost:4002
```

---

## Endpoints

### 1. GET /
Health check endpoint.

**Response:**
```
hello world
```

---

### 2. POST /auth/login
Login user dan set JWT cookie.

**Request Body:**
```json
{
  "email": "admin@sixteen.com",
  "password": "password"
}
```

**Success Response (200):**
```json
{
  "message": "Login success",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin",
    "email": "admin@sixteen.com",
    "role": "ADMIN"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

**Cookies:**
- `access_token`: JWT token (httpOnly, secure, sameSite: lax)

---

### 3. POST /auth/logout
Logout user dan hapus JWT cookie.

**Request Body:** (empty)

**Success Response (200):**
```json
{
  "message": "Logout success"
}
```

---

### 4. GET /auth/me
Get current user yang sedang login.

**Headers:**
- Cookie: `access_token=<jwt_token>`

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "ADMIN"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Not authenticated"
}
```

---

## Database Schema (PostgreSQL + Drizzle ORM)

### Tables

#### users
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, auto-generated |
| name | varchar(100) | User name |
| email | varchar(100) | Unique email |
| password | varchar(255) | Hashed password |
| role | enum | ADMIN or BARBER |
| created_at | timestamp | Creation timestamp |

#### services
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar(100) | Service name |
| price | integer | Price in IDR |
| duration | integer | Duration in minutes |
| is_active | boolean | Service availability |

#### bookings
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| barber_id | uuid | Reference to users (barber) |
| service_id | uuid | Reference to services |
| customer_user_id | uuid | Reference to users (optional) |
| customer_name | varchar(100) | Customer name |
| customer_phone | varchar(20) | Customer phone |
| customer_note | text | Additional notes |
| booking_date | timestamp | Booking time with timezone |
| status | enum | pending, confirmed, cancelled, completed |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### refresh_tokens
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| token | varchar(64) | Unique refresh token |
| user_id | uuid | Reference to users |
| expires_at | timestamp | Token expiration |
| created_at | timestamp | Creation timestamp |

---

## Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| PORT | 4002 | Server port |
| JWT_SECRET | xYmscMP+tT+Az/bpyDm41W+0jCuJPHk75Q8xyYkUVXY= | Secret key untuk JWT |
| JWT_EXPIRES_IN | 7d | Token expiration |
| DATABASE_URL | postgresql://... | PostgreSQL connection string |
| CLIENT_URL | http://localhost:3000 | Frontend URL untuk CORS |
| NODE_ENV | development | Environment |

---

## Commands

```bash
# Install dependencies
npm install

# Run migrations (create tables)
npm run db:push

# Seed admin user
npm run db:seed

# Start development server
npm run dev
```

---

## Frontend Integration Tips

### Login Flow
1. Call `POST /auth/login` dengan email & password
2. Server set cookie `access_token` otomatis
3. Redirect ke halaman yang butuh autentikasi

### Check Auth Status
1. Call `GET /auth/me`
2. Jika response 200 → user login, dapat data user
3. Jika response 401 → user belum login

### Logout
1. Call `POST /auth/logout`
2. Cookie dihapus otomatis
3. Redirect ke halaman login

### Protected Routes
Tambahkan cookie `access_token` di semua request yang butuh autentikasi. Cookie otomatis terkirim jika `credentials: true` di fetch.
