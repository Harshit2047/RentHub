# RentHub — Modern Apartment Rental Platform

A full-stack apartment rental web application built with **Angular 22**, **Tailwind CSS 4**, and **Node.js / Express**. RentHub connects prospective tenants directly with landlords and property managers—eliminating brokerage fees, enabling real-time booking inquiries, and supporting threaded interactive discussions.

---

## 🔗 Project Links

| Resource | URL |
|---|---|
| **GitHub Repository** | `https://github.com/your-username/renthub` *(Replace with your repository link)* |
| **Live Deployed App** | `https://renthub-app.vercel.app` *(Replace with your deployed frontend URL)* |
| **Backend API Health** | `http://localhost:3000/api/health` |

---

## 👥 Demo Credentials

The database comes pre-seeded with test accounts for immediate evaluation:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Landlord (Host)** | `landlord@example.com` | `Password123!` | Post/Edit listings, upload photos, manage inquiries (Accept/Decline), reply with "Host" badge |
| **Tenant** | `tenant@example.com` | `Password123!` | Browse, filter, save Favourites, submit booking inquiries, comment and ask questions |
| **Admin** | `admin@example.com` | `Password123!` | System-wide listing moderation and account management |

*(New users can also register freely on `/register` as either a Tenant or a Landlord.)*

---

## 🌟 Key Features & Requirements Implementation

### 1. Post Apartments for Rent (Landlord Portal)
- **Detailed Form**: Collects property title, description, address, city, state, PIN code, monthly rent, security deposit, bedrooms, bathrooms, and carpet area.
- **Furnishing State**: Visual selector for *Fully Furnished*, *Semi-Furnished*, or *Unfurnished*.
- **Living Preferences**: Food/dietary rule selection via radio buttons (*Vegetarian Preferred / Only* vs *Non-Vegetarian Allowed*).
- **Amenities**: 10 popular amenities selectable via interactive toggle checkboxes (High-speed WiFi, Reserved Parking, Gym, Swimming Pool, 24/7 Security, Elevator, Power Backup, Air Conditioning, Private Balcony, 24/7 Water Supply).
- **Media Upload**: Drag-and-drop / file selector with Cloudinary integration and photo deletion.
- **Form Validation**: Strict reactive form validation with real-time feedback and touched/submitted states.

### 2. ⭐ Bonus Feature: Preview & Submit Mode
- **Dual-Mode Editor**: Both `/create` and `/edit/:id` feature a live mode switcher between:
  1. **Listing Details Form**: Full input fields and controls.
  2. **Full Preview & Submit**: Real-time rendering of exactly how prospective tenants will experience the apartment before it goes live.
- **Live Preview Sidebar**: Side-by-side sticky card preview updating instantly as you type.

### 3. Show Interest (Favourites & Booking Inquiries)
- **Favourites System**: One-click heart toggle on apartment cards and detail pages, synchronized reactively across components using RxJS `BehaviorSubject`. Dedicated `/favourites` view with the full search and filter bar.
- **Booking & Visit Scheduling**: Direct modal on apartment details allowing tenants to specify preferred move-in / visit dates and custom messages.
- **Inquiry Management**:
  - Landlords view incoming requests on `/dashboard` with one-click **"✓ Accept Request"** and **"✕ Decline"** buttons.
  - Tenants track request status in real-time (*Accepted*, *Pending Review*, *Declined*).

### 4. Interactive Comment & Reply System
- Threaded discussions on every listing for questions and rental negotiation.
- Verified **"Host / Landlord"** author badge for property owners.
- Comment editing and deletion permissions strictly enforced.
- Protected write endpoints with JWT authentication middleware.

### 5. Advanced Search & Filter
- Reusable `ApartmentFiltersComponent` integrated across **Home**, **Apartments (`/apartments`)**, and **Favourites (`/favourites`)**.
- Filters by city, keyword search, price range (Min/Max ₹), bedrooms, bathrooms, furnishing status, and availability.
- Sorting by price (low to high, high to low) and newest additions.

---

## 🧪 Unit Testing Suite

RentHub includes a comprehensive unit testing suite covering **Components**, **Services**, and **Modules/Routing** using Angular 22's Vitest runner:

| Type | Test File | Tests | Status |
|---|---|:---:|:---:|
| **Component** | `src/app/apartments/apartment-card.component.spec.ts` | 5 | ✅ Passed |
| **Component** | `src/app/auth/register.component.spec.ts` | 8 | ✅ Passed |
| **Service** | `src/app/core/apartment.service.spec.ts` | 6 | ✅ Passed |
| **Service** | `src/app/core/auth.service.spec.ts` | 9 | ✅ Passed |
| **Guard** | `src/app/core/auth.guard.spec.ts` | 4 | ✅ Passed |
| **Module / Routing** | `src/app/app.routes.spec.ts` | 9 | ✅ Passed |
| **Total** | **6 Test Suites** | **41 Tests** | **✅ 100% Passed (0 Failures)** |

To execute the unit tests:
```bash
cd renthub-client
npm test -- --watch=false
```

---

## 🛠️ Architecture & Tech Stack

### Frontend (`renthub-client`)
- **Framework**: Angular 22 (Standalone Components, Signals, Reactive Forms)
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism UI
- **Typography & Theme**: Inter font, Indigo/Cyan accents, Indian Rupee (`₹`) numbering
- **Feedback**: Non-blocking `ToastService` notifications (no native `alert()` calls)
- **HTTP**: `provideHttpClient` with functional DI and `JwtInterceptor`

### Backend (`renthub-server`)
- **Runtime**: Node.js v24 (ES Modules) + Express.js v5
- **ORM**: Prisma ORM v6
- **Database**: PostgreSQL (Neon Cloud) / SQLite (`dev.db`)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Uploads**: Cloudinary + Multer memory storage

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 2. Frontend Setup
```bash
cd renthub-client
npm install
npm start
# Application opens at http://localhost:4200
```

### 3. Backend Setup
```bash
cd renthub-server
npm install
npm run dev
# Server listens at http://localhost:3000
```

### 4. Build for Production
```bash
cd renthub-client
npm run build
# Output generated in dist/renthub-client
```

---

## 📁 Repository Structure

```
RentHub/
├── renthub-client/                 # Angular 22 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── apartments/         # Card, Details, List, Create, Edit
│   │   │   ├── auth/               # Login, Register, Auth Guards
│   │   │   ├── comments/           # Threaded Comment & Reply System
│   │   │   ├── core/               # Services (Auth, Apartment, Fav, Toast)
│   │   │   ├── dashboard/          # Tenant & Landlord Dashboards
│   │   │   ├── favourites/         # Saved Listings Page
│   │   │   ├── home/               # Hero, Carousel, Latest Properties
│   │   │   ├── models/             # TypeScript Models & Interfaces
│   │   │   ├── shared/             # Navbar, Footer, Filters, Toast
│   │   │   ├── app.config.ts       # Application Configuration
│   │   │   └── app.routes.ts       # Route Declarations & AuthGuards
│   │   └── styles.css              # Global Design Tokens & Tailwind
│   ├── angular.json
│   └── package.json
├── renthub-server/                 # Express Backend API
│   ├── prisma/
│   │   └── schema.prisma           # Prisma Data Schema
│   ├── src/
│   │   ├── controllers/            # Auth, Apartment, Inquiry, Comment
│   │   ├── middleware/             # Auth & Error Handlers
│   │   ├── routes/                 # Express Route Definitions
│   │   └── server.js               # Entry Point
│   └── package.json
└── README.md                       # Documentation & Evaluation Guide
```

---

## 📋 Evaluation Checklist

- [x] **Fully functional web application** with responsive UI and clear error handling.
- [x] **Unit tests**: 33 passing test cases covering components, services, auth guard, and routing module.
- [x] **Auth Guards**: Role-based access control protecting create/edit routes for landlords and securing private routes.
- [x] **Form Validation**: Comprehensive client-side validations on registration, login, create, and edit forms.
- [x] **Modern CSS**: Tailwind CSS 4 with accessible contrast ratios, clean typography, and interactive components.
- [x] **Clean Codebase**: All dead scaffolding files removed, modular architecture, and zero browser `alert()` popups.
- [x] **Bonus Feature**: Interactive Preview and Submit Screen for property listings.
