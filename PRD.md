# Product Requirements Document (PRD) - Kroombox CRM (v2)

## Project Overview
**Title:** Aplikasi Customer Relationship Management untuk Dukungan Konsumen Kroombox Berbasis LLM.
**Objective:** A multi-role CRM system with Role-Based Access Control (RBAC) to manage customer complaints, staff interactions, and administrative oversight.

## Role-Based Access Control (RBAC)

### 1. Role: Customer
- **Dashboard:** Overview of personal services and loyalty status.
- **Loyalty Indicator:** Points display in the header (e.g., 🪙 150 Poin).
- **Forum Solusi (Public Forum):** A public-facing ticket system designed like a discussion board.
  - **Duplication Prevention:** A prominent search bar to find existing solutions.
  - **Public Solutions:** View "Resolved" tickets from other users to find answers before creating a new thread.
- **My Threads:** View personal discussion threads.
- **Thread Detail (Forum Style):** A thread-based discussion interface to interact with Staff.

### 2. Role: Staff (Customer Service Frontliner)
- **Dashboard:** View incoming complaints with shift/time filters.
- **Interaction:** Reply to customer tickets within the Forum UI.
- **Maintenance Transfer:** For tickets with "High" priority, a button to "Transfer to Maintenance" is available to escalate to the technical team.

### 3. Role: Admin (Back-Office)
- **Constraint:** No interaction with customer tickets (Back-office only).
- **User Management:** CRUD operations for Customers, Staff, and Admins.
- **Ticket Settings:** Global view of all tickets with the ability to set/change Priority (Low, Medium, High).

## Authentication Flow
- **Login:** Users enter email and password. For simulation, any password works for dummy accounts.
- **Register:** New users can sign up via the Register page (simulated success).

## Technical Stack
- **Frontend:** React.js (Vite)
- **Routing:** react-router-dom
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)

## Folder Structure
- `/src/pages/auth/`: Login and Register pages.
- `/src/pages/customer/`: Customer-specific views.
- `/src/pages/staff/`: Staff-specific views.
- `/src/pages/admin/`: Admin-specific views.
- `/src/components/`: Shared UI components.
