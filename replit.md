# Global CR Transport

## Overview
Landing page and employee admin tool for Global CR Transport, a logistics company with 20 years in the market. The admin tool is a Trello-style kanban board for managing cargo tickets.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Replit Auth (employee access only)
- **File uploads**: multer → `/uploads` directory

## Key Features
- Public landing page (Spanish) with WhatsApp support button (+506 2222-2222)
- Admin kanban board with 5 status columns: Nuevo → En Proceso → Aduana → En Tránsito → Entregado
- Ticket detail dialog with photo attachments and comment threads
- Drag-and-drop to change ticket status

## Data Model
- `tickets` – cargo tracking tickets with status, origin, destination, client info
- `ticket_comments` – threaded comments per ticket (userId, userName, content)
- `ticket_attachments` – photo attachments per ticket (stored in /uploads)

## API Routes (all under /api, auth-protected except landing page)
- GET/POST /api/tickets – list/create tickets
- GET/PUT/DELETE /api/tickets/:id – get/update/delete ticket
- POST /api/tickets/:id/comments – add comment
- POST /api/tickets/:id/attachments – upload file attachment
- DELETE /api/tickets/:id/attachments/:attachmentId – remove attachment

## Running
- `npm run dev` starts Express + Vite on port 5000
- Database schema pushed via `npm run db:push`

## User Preferences
- Spanish as primary language for admin interface
- Landing page in Spanish with "20 years" messaging
- WhatsApp button linking to +506 2222-2222
