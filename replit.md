# Global CR Transport

## Overview
Landing page and employee admin tool for Global CR Transport, a logistics company with 20 years in the market. The admin tool is a Trello-style kanban board for managing cargo tickets.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js with TypeScript (dev), Vercel Serverless Functions (production)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT-based email/password auth (ADMIN_EMAIL, ADMIN_PASSWORD env vars)
- **File uploads**: multer → `/uploads` directory (dev), base64 in DB (Vercel)

## Key Features
- Public landing page (Spanish) with WhatsApp support button (+506 2222-2222)
- Admin kanban board with 5 status columns: Nuevo → En Proceso → Aduana → En Tránsito → Entregado
- Ticket detail dialog with photo attachments and comment threads
- Drag-and-drop to change ticket status
- JWT-based login at /login

## Data Model
- `tickets` – cargo tracking tickets with status, origin, destination, client info
- `ticket_comments` – threaded comments per ticket (userId, userName, content)
- `ticket_attachments` – photo attachments per ticket

## API Routes (all under /api, auth-protected except landing page)
- POST /api/auth/login – login with email/password
- GET /api/auth/user – get current user
- POST /api/auth/logout – logout
- GET/POST /api/tickets – list/create tickets
- GET/PUT/DELETE /api/tickets/:id – get/update/delete ticket
- POST /api/tickets/:id/comments – add comment
- POST /api/tickets/:id/attachments – upload file attachment
- DELETE /api/attachments/:id – remove attachment

## Vercel Deployment
- `vercel.json` configures build and routing
- `api/` directory contains Vercel serverless functions
- Frontend built by Vite → `dist/public`
- Required env vars in Vercel:
  - `DATABASE_URL` – PostgreSQL connection string
  - `ADMIN_EMAIL` – admin login email
  - `ADMIN_PASSWORD` – admin login password
  - `JWT_SECRET` or `SESSION_SECRET` – JWT signing secret
- Seed database: POST /api/seed (optional SEED_KEY env var for protection)

## Running (Development)
- `npm run dev` starts Express + Vite on port 5000
- Database schema pushed via `npm run db:push`

## User Preferences
- Spanish as primary language for admin interface
- Landing page in Spanish with "20 years" messaging
- WhatsApp button linking to +506 2222-2222
