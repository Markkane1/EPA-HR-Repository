# EPA Punjab - Personnel Repository

A modern, full-stack Human Resources management system custom-built for the Environment Protection Agency (EPA) Punjab using strict Clean Architecture principles.

## Architecture

This application strictly separates concerns across four distinct layers to ensure maximum maintainability and testability:
- **Domain Layer**: Pure entities and interfaces (Zero external dependencies).
- **Application Layer**: Isolated business logic and Use Cases.
- **Infrastructure Layer**: Concrete implementations (Mongoose, Axios, Express Routes).
- **Presentation Layer**: React views, hooks, and responsive Tailwind UI.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Zod, React-Hook-Form, React Router
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth, Bcrypt
- **Architecture**: Domain-Driven Design / Clean Architecture

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running on `localhost:27017`

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The system expects a `.env` file in the root directory.
   ```env
   JWT_SECRET=super_secret_jwt_key_epa_hr_123!
   JWT_EXPIRES_IN=1d
   MONGODB_URI=mongodb://localhost:27017/epa-hr-repository
   ```

3. **Seed the Database**
   This script purges existing collections and generates base Offices, Positions, realistic Employees, Postings, and default Authentication Users.
   ```bash
   npm run seed
   ```

4. **Run the Application**
   This boots both the Vite frontend server and the Node backend concurrently.
   ```bash
   npm run dev
   ```

## Default Accounts
After seeding, you can log in with:
- **Admin**: `admin@epa.punjab.gov.pk` / `Admin@1234`
- **Viewer**: `viewer@epa.punjab.gov.pk` / `Viewer@1234`
