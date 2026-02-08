# Barber Express API

RESTful API untuk aplikasi barber shop, dibangun dengan Express.js, TypeScript, dan Drizzle ORM.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL / SQLite
- **ORM:** Drizzle ORM
- **Auth:** JWT (cookies-based)
- **Language:** TypeScript

## Project Structure

```
src/
├── app.ts                 # Main application
├── server.ts              # Server entry point
├── controllers/           # Request handlers
│   ├── auth.controller.ts
│   ├── bookings.controller.ts
│   ├── services.controller.ts
│   ├── users.controller.ts
│   └── media.controller.ts
├── services/             # Business logic
│   ├── auth.service.ts
│   ├── bookings.service.ts
│   ├── users.service.ts
│   └── media.service.ts
├── db/                   # Database layer
│   ├── schema.ts         # DB schema
│   ├── index.ts          # DB connection
│   ├── users.repository.ts
│   ├── bookings.repository.ts
│   ├── services.repository.ts
│   └── media.repository.ts
├── routes/               # API routes
├── utils/                # Utilities
│   ├── jwt.ts
│   └── bookings.utils.ts
└── types/                # TypeScript types
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Buat file `.env` berdasarkan contoh:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/barber_express

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# App
PORT=4002
CLIENT_URL=http://localhost:3000
```

### 3. Database Setup

**Untuk PostgreSQL:**

```bash
# Push schema ke database
npm run db:push

# Atau migrate
npm run db:migrate
```

**Untuk SQLite (development):**

Database sudah include di `sqlite.db`.

### 4. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:4002`

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/barbers` | Get all barbers | Public |
| GET | `/users/barbers/:id` | Get barber profile | Public |
| POST | `/users/barbers` | Create barber | Admin |
| PATCH | `/users/barbers/:id` | Update barber | Admin |

### Services

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/services` | Get all services | Public |
| POST | `/services` | Create service | Admin |
| PATCH | `/services/:id` | Update service | Admin |
| PATCH | `/services/:id/toggle-active` | Toggle active | Admin |
| DELETE | `/services/:id` | Delete service | Admin |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/bookings` | Get all bookings | Admin |
| GET | `/bookings/:id` | Get booking by ID | Public |
| POST | `/bookings` | Create booking | Public |
| GET | `/bookings/by-barber?barberId=` | Get bookings by barber | - |
| GET | `/bookings/barber?date=&barberId=` | Get barber bookings by date | - |
| GET | `/bookings/available-slots?date=&barberId=` | Get available time slots | Public |
| PATCH | `/bookings/:id/status` | Update booking status | Admin |

### Media (Polymorphic)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/media?type=&referenceId=` | Get media by reference |
| POST | `/media` | Create media |
| GET | `/media/:id` | Get media by ID |
| DELETE | `/media/:id` | Delete media |

**Type values:** `barber`, `service`, `booking`, dll

## Database Schema

### Users
- id, name, email, password, role (ADMIN, BARBER), createdAt

### Services
- id, name, price, duration, isActive

### Bookings
- id, barberId, serviceId, customerUserId, customerName, customerPhone, customerNote, bookingDate, status (pending, confirmed, cancelled, completed)

### Media (Polymorphic)
- id, url, filename, mimeType, size, type, referenceId, createdAt

## Available Scripts

```bash
npm run dev        # Development
npm run build      # Build for production
npm run start      # Start production server
npm run db:push    # Push schema to database
npm run db:studio  # Open Drizzle Studio
```

## License

MIT
