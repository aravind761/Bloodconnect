# BloodConnect — Production-Style Blood Donation Finder

**BloodConnect** is an enterprise-grade full-stack Blood Donation Finder and LifeLink coordination platform with an interactive 3D frontend and database-backed Next.js API architecture. It unites volunteer donors, community blood banks, and hospital trauma units to eliminate preventable blood shortages in real time.

---

## 🌟 Key Features

1. **Interactive 3D Hero Experience**:
   - Parametric 3D blood-drop sculpture built with React Three Fiber, Three.js, soft crimson ambient illumination, and floating particle fields.
   - Tilt and mouse-responsive interaction with graceful 2D SVG/CSS fallback for low-spec devices and automatic `prefers-reduced-motion` compliance.

2. **Donation Center Finder & Interactive Radar Map**:
   - Interactive tactical map with custom crimson pins and live urgent request beacons.
   - List and Map view toggle, distance calculation via the Haversine formula, opening hours, supported blood groups, and verified facility tags.
   - Integrated browser Geolocation ("Use My Location").

3. **Real-Time Urgent Blood Requests Portal**:
   - Hospital emergency requests with urgency levels (`CRITICAL`, `URGENT`, `NORMAL`), patient clinical notes, and live unit fulfillment progress bars.
   - Interactive donation pledge flow and hospital triage creation modal.

4. **Donor Eligibility Self-Assessment**:
   - Multi-step friendly questionnaire (Age, Weight, Donation interval, International travel, Medications) with instant pass/deferral evaluation and preparation tips.

5. **Double-Booking Protected Appointment Scheduling**:
   - Select center, date, and 15-minute time slots (Morning, Afternoon, Evening) with conflict prevention and printable confirmation passes.

6. **Role-Based Dashboards**:
   - **Donor Dashboard**: Upcoming appointments, past donation timeline, eligibility countdown, achievement badges (*First Drop*, *Life Saver*, *Emergency Hero*), and saved centers.
   - **Blood Bank & Hospital Dashboard**: Live inventory tracker for all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-) with quick +/- stock controls, critical shortage alarms (≤ 3 units), and appointment check-in.
   - **Admin Console**: Network statistics, center approvals/verification toggles, user registry management, and system-wide emergency broadcast banner creator.

7. **Authentication & Multi-Role Support**:
   - Secure JWT token authentication with bcrypt password hashing and 1-click test credentials for **Donor**, **Hospital**, **Blood Bank**, and **Admin**.

---

## 🏗️ Architecture & Project Structure

```
Bloodconnect/
├── prisma/
│   ├── schema.prisma        # Complete PostgreSQL Prisma schema
│   └── seed.ts              # Realistic database seeding script
├── src/
│   ├── app/
│   │   ├── (dashboard)/     # Role-based dashboard layouts
│   │   │   ├── dashboard/admin/page.tsx
│   │   │   ├── dashboard/donor/page.tsx
│   │   │   ├── dashboard/hospital/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/             # Next.js API routes (Backend)
│   │   │   ├── alerts/route.ts
│   │   │   ├── appointments/route.ts
│   │   │   ├── auth/route.ts
│   │   │   ├── centers/route.ts
│   │   │   ├── centers/[id]/route.ts
│   │   │   ├── inventory/route.ts
│   │   │   ├── requests/route.ts
│   │   │   └── requests/[id]/route.ts
│   │   ├── auth/            # Auth screens
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── book/            # Appointment scheduling page
│   │   ├── eligibility/     # Multi-step eligibility checker
│   │   ├── find-center/     # Interactive center finder with map
│   │   ├── urgent/          # Urgent blood requests page
│   │   ├── globals.css      # Custom styling & glassmorphism
│   │   ├── layout.tsx       # Root layout with emergency banner & navbar
│   │   └── page.tsx         # Home page with 3D hero & impact statistics
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── BloodDrop.tsx # 3D teardrop geometry & physical ruby material
│   │   │   ├── Particles.tsx # Floating crimson particle cloud
│   │   │   └── Scene.tsx     # R3F Canvas setup, lighting & 2D fallback
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── EmergencyBanner.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   └── Navbar.tsx
│   │   └── Map.tsx          # Interactive Map component with custom pins
│   └── lib/
│       ├── auth.ts          # JWT generation & password hashing
│       ├── demo-data.ts     # Realistic demo data for offline/standalone run
│       ├── prisma.ts        # Prisma client singleton
│       ├── types.ts         # TypeScript interfaces & enums
│       └── utils.ts         # Haversine distance, blood compatibility matrices
├── .env                     # Environment variables
├── .env.example
├── package.json
├── postcss.config.js
├── tailwind.config.ts       # Deep crimson (#9B1C31) & navy accents
└── tsconfig.json
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Next.js 14 (App Router), TypeScript, Tailwind CSS
- **3D Visualization**: React Three Fiber (`@react-three/fiber`), Three.js (`three`), `@react-three/drei`
- **Backend**: Next.js App Router API Routes (`/api/*`)
- **Database**: PostgreSQL with Prisma ORM (with seamless fallback for standalone/demo testing)
- **Authentication**: JWT token cookies with `bcryptjs` password hashing
- **Icons & UI**: Lucide Icons, Glassmorphic cards, accessible WCAG contrast

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **pnpm**
- **PostgreSQL** (Optional for local DB persistence; the application comes preloaded with resilient runtime fallbacks)

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Environment Variables
Copy or adjust `.env`:
```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bloodconnect?schema=public"

# JWT Secret
JWT_SECRET="bloodconnect_super_secure_jwt_secret_key_2025"

# Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Mapbox Access Token
NEXT_PUBLIC_MAPBOX_TOKEN=""
```

### 4. Database Setup & Seeding (PostgreSQL)
If your PostgreSQL database is running:
```bash
# Push Prisma schema to your database
npx prisma db push

# Seed the database with demo centers, inventories, and requests
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Accounts for Evaluation

All test accounts share the default password: **`Password123!`**

| Persona | Email | Role | Features Accessible |
|---|---|---|---|
| **Volunteer Donor** | `donor@bloodconnect.org` | `DONOR` | Book slots, view badges, track history |
| **Hospital Staff** | `hospital@bloodconnect.org` | `HOSPITAL` | Broadcast urgent needs, view requests |
| **Blood Bank Ops** | `bloodbank@bloodconnect.org` | `BLOOD_BANK` | Live 8-group inventory sync, check in donors |
| **Administrator** | `admin@bloodconnect.org` | `ADMIN` | Manage users, approve facilities, broadcast alerts |

> **Pro Tip**: You can also switch test personas at any moment using the **Persona Pill** in the top navigation bar without typing credentials!

